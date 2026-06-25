// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract DonationPool {
    address public owner;
    bool public paused;
    uint256 public minDonation;
    mapping(address => uint256) public contributions;
    uint256 public totalPooled;

    error ContractIsPaused();
    error DonationBelowMinimum(uint256 sent, uint256 minimum);
    error NotOwner();
    error NoFundsToWithdraw();
    error WithdrawalTransferFailed();

    event DonationReceived(address indexed donor, uint256 amount, uint256 timestamp);
    event Withdrawal(address indexed to, uint256 amount, uint256 timestamp);
    event PausedStatusChanged(bool isPaused, uint256 timestamp);

    constructor(uint256 _minDonation) {
        owner = msg.sender;
        minDonation = _minDonation;
        paused = false;
    }

    function donate() external payable {
        if (paused) revert ContractIsPaused();
        if (msg.value < minDonation) revert DonationBelowMinimum(msg.value, minDonation);
        contributions[msg.sender] += msg.value;
        totalPooled += msg.value;
        emit DonationReceived(msg.sender, msg.value, block.timestamp);
    }

    function withdraw() external {
        if (msg.sender != owner) revert NotOwner();
        if (totalPooled == 0) revert NoFundsToWithdraw();
        uint256 amount = totalPooled;
        totalPooled = 0;
        (bool success,) = owner.call{value: amount}("");
        if (!success) revert WithdrawalTransferFailed();
        emit Withdrawal(owner, amount, block.timestamp);
    }

    function setPaused(bool _paused) external {
        if (msg.sender != owner) revert NotOwner();
        paused = _paused;
        emit PausedStatusChanged(_paused, block.timestamp);
    }

    function getContribution(address donor) external view returns (uint256) {
        return contributions[donor];
    }
}
