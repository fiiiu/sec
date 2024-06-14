// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "forge-std/Script.sol";

contract FundAccount is Script {
    address payable employer = payable(0x635A4179Dd88E617779f5D54ce7eF9153ca98a58);
    address payable candidate = payable(0x16643f4E44564FDe8101a964faB69aBFfca4cD01);
    

    function run() public {

        vm.startBroadcast(0xBE69d72ca5f88aCba033a063dF5DBe43a4148De0);

        // Transfer funds from the deployer to the employer
        (bool success, ) = employer.call{value: 4 ether}("");
        require(success, "Transfer failed.");
        // Transfer funds from the deployer to the candidate
        (success, ) = candidate.call{value: 4 ether}("");
        require(success, "Transfer failed.");

        vm.stopBroadcast();
    }
}