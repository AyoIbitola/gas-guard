// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test, console2} from "forge-std/Test.sol";
import {DonationPool} from "../src/DonationPool.sol";

contract DonationPoolTest is Test {
    DonationPool pool;
    address owner = address(this);

    receive() external payable {}
    address donor = makeAddr("donor");
    address nonOwner = makeAddr("nonOwner");
    uint256 constant MIN_DONATION = 0.001 ether;

    function setUp() public {
        pool = new DonationPool(MIN_DONATION);
        vm.deal(donor, 10 ether);
        vm.deal(nonOwner, 10 ether);
    }

    function test_Donate_Succeeds_WhenAboveMinimumAndNotPaused() public {
        uint256 amount = 0.01 ether;

        vm.expectEmit(true, false, false, true);
        emit DonationPool.DonationReceived(donor, amount, block.timestamp);

        vm.prank(donor);
        pool.donate{value: amount}();

        assertEq(address(pool).balance, amount);
        assertEq(pool.contributions(donor), amount);
        assertEq(pool.totalPooled(), amount);
    }

    function test_Donate_Reverts_WhenPaused() public {
        pool.setPaused(true);

        vm.expectRevert(DonationPool.ContractIsPaused.selector);
        vm.prank(donor);
        pool.donate{value: 0.01 ether}();
    }

    function test_Donate_Reverts_WhenBelowMinimum() public {
        uint256 sentAmount = 0.0005 ether;

        vm.expectRevert(
            abi.encodeWithSelector(DonationPool.DonationBelowMinimum.selector, sentAmount, MIN_DONATION)
        );
        vm.prank(donor);
        pool.donate{value: sentAmount}();
    }

    function test_Withdraw_Succeeds_ForOwner() public {
        vm.prank(donor);
        pool.donate{value: 0.01 ether}();

        uint256 ownerBalanceBefore = owner.balance;

        vm.expectEmit(true, false, false, true);
        emit DonationPool.Withdrawal(owner, 0.01 ether, block.timestamp);

        pool.withdraw();

        assertEq(pool.totalPooled(), 0);
        assertEq(owner.balance, ownerBalanceBefore + 0.01 ether);
    }

    function test_Withdraw_Reverts_WhenNotOwner() public {
        vm.prank(donor);
        pool.donate{value: 0.01 ether}();

        vm.expectRevert(DonationPool.NotOwner.selector);
        vm.prank(nonOwner);
        pool.withdraw();
    }

    function test_Withdraw_Reverts_WhenPoolEmpty() public {
        vm.expectRevert(DonationPool.NoFundsToWithdraw.selector);
        pool.withdraw();
    }

    function test_SetPaused_Reverts_WhenNotOwner() public {
        vm.expectRevert(DonationPool.NotOwner.selector);
        vm.prank(nonOwner);
        pool.setPaused(true);
    }

    function test_SetPaused_TogglesCorrectly() public {
        assertEq(pool.paused(), false);

        vm.expectEmit(false, false, false, true);
        emit DonationPool.PausedStatusChanged(true, block.timestamp);
        pool.setPaused(true);
        assertEq(pool.paused(), true);

        vm.expectEmit(false, false, false, true);
        emit DonationPool.PausedStatusChanged(false, block.timestamp);
        pool.setPaused(false);
        assertEq(pool.paused(), false);
    }

    function test_GetContribution_ReturnsCorrectAmount_AfterMultipleDonations() public {
        vm.startPrank(donor);
        pool.donate{value: 0.01 ether}();
        pool.donate{value: 0.02 ether}();
        pool.donate{value: 0.005 ether}();
        vm.stopPrank();

        assertEq(pool.getContribution(donor), 0.035 ether);
        assertEq(pool.totalPooled(), 0.035 ether);
    }
}
