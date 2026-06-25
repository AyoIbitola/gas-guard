// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console2} from "forge-std/Script.sol";
import {DonationPool} from "../src/DonationPool.sol";

contract DeployScript is Script {
    function run() external {
        uint256 minDonationWei = vm.envOr("MIN_DONATION_WEI", uint256(0.001 ether));

        vm.startBroadcast();
        DonationPool pool = new DonationPool(minDonationWei);
        vm.stopBroadcast();

        console2.log("DonationPool deployed at:", address(pool));
        console2.log("minDonation (wei):", pool.minDonation());
        console2.log("owner:", pool.owner());
    }
}
