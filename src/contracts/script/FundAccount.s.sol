// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";

contract FundAccount is Script {
    address payable recipient = payable(0x635A4179Dd88E617779f5D54ce7eF9153ca98a58);

    function run() public {
        // vm.startBroadcast(tx.origin=0xBE69d72ca5f88aCba033a063dF5DBe43a4148De0);

        // address payable sender = payable(vm.addr(0));
        vm.startBroadcast(0xBE69d72ca5f88aCba033a063dF5DBe43a4148De0);

        // vm.prank(0xBE69d72ca5f88aCba033a063dF5DBe43a4148De0);
        // Transfer funds from the deployer to the recipient
        (bool success, ) = recipient.call{value: 10 ether}("");
        require(success, "Transfer failed.");

        vm.stopBroadcast();
    }
}