// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {DonationPool} from "../src/DonationPool.sol";

contract DonationPoolFuzzTest is Test {
    DonationPool pool;
    address owner = address(this);

    receive() external payable {}
    address donor = makeAddr("donor");
    uint256 constant MIN_DONATION = 0.001 ether;

    function setUp() public {
        pool = new DonationPool(MIN_DONATION);
        vm.deal(donor, 200 ether);
    }

    function testFuzz_Donate_RevertsExactlyAtBoundary(uint256 amount) public {
        vm.assume(amount <= 100 ether);

        if (amount >= MIN_DONATION) {
            vm.prank(donor);
            pool.donate{value: amount}();
            assertEq(pool.totalPooled(), amount);
        } else {
            vm.expectRevert(
                abi.encodeWithSelector(DonationPool.DonationBelowMinimum.selector, amount, MIN_DONATION)
            );
            vm.prank(donor);
            pool.donate{value: amount}();
        }
    }

    function testFuzz_Withdraw_NeverLeavesPositiveBalanceAfterSuccess(uint256[] memory donationAmounts) public {
        vm.assume(donationAmounts.length > 0 && donationAmounts.length <= 10);

        uint256 totalDonated = 0;
        for (uint256 i = 0; i < donationAmounts.length; i++) {
            uint256 amount = bound(donationAmounts[i], MIN_DONATION, 10 ether);
            totalDonated += amount;
        }

        vm.deal(donor, totalDonated + 1 ether);

        for (uint256 i = 0; i < donationAmounts.length; i++) {
            uint256 amount = bound(donationAmounts[i], MIN_DONATION, 10 ether);
            vm.prank(donor);
            pool.donate{value: amount}();
        }

        assertEq(pool.totalPooled(), totalDonated);
        assertEq(address(pool).balance, totalDonated);

        pool.withdraw();

        assertEq(pool.totalPooled(), 0);
        assertEq(address(pool).balance, 0);
    }
}
