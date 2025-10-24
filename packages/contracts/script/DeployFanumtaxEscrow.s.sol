// SPDX-License-Identifier: MIT
pragma solidity ^0.8.30;

import {Script, console} from "forge-std/Script.sol";
import {FanumtaxEscrow} from "../src/FanumtaxEscrow.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";

/**
 * @title DeployFanumtaxEscrow
 * @notice Deployment script for FanumtaxEscrow with UUPS proxy pattern
 * @dev Usage: forge script script/DeployFanumtaxEscrow.s.sol:DeployFanumtaxEscrow --rpc-url <RPC_URL> --broadcast
 */
contract DeployFanumtaxEscrow is Script {
    function run() external returns (address proxy, address implementation) {
        // Get deployer from private key in environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        console.log("Deploying FanumtaxEscrow with deployer:", deployer);

        vm.startBroadcast(deployerPrivateKey);

        // 1. Deploy implementation
        implementation = address(new FanumtaxEscrow());
        console.log("Implementation deployed at:", implementation);

        // 2. Encode initialize call
        bytes memory initData = abi.encodeCall(FanumtaxEscrow.initialize, (deployer));

        // 3. Deploy proxy
        proxy = address(new ERC1967Proxy(implementation, initData));
        console.log("Proxy deployed at:", proxy);
        console.log("Owner:", deployer);

        vm.stopBroadcast();

        console.log("\n=== Deployment Summary ===");
        console.log("Proxy (use this address):", proxy);
        console.log("Implementation:", implementation);
        console.log("Owner:", deployer);
    }
}
