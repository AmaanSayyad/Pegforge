// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console2} from "forge-std/Script.sol";
import {MockRWA} from "../contracts/MockRWA.sol";
import {PegforgePortal} from "../contracts/PegforgePortal.sol";
import {RwaMUSDMarket} from "../contracts/RwaMUSDMarket.sol";

/** Redeploy Portal with claimExpressLoan; keep existing Market + MockRWAs. */
contract RedeployPortal is Script {
    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        RwaMUSDMarket market = RwaMUSDMarket(vm.envAddress("MARKET"));

        address[10] memory tokens = [
            vm.envAddress("TOKEN_NVDA"),
            vm.envAddress("TOKEN_AAPL"),
            vm.envAddress("TOKEN_MSFT"),
            vm.envAddress("TOKEN_AMZN"),
            vm.envAddress("TOKEN_GOOGL"),
            vm.envAddress("TOKEN_META"),
            vm.envAddress("TOKEN_TSLA"),
            vm.envAddress("TOKEN_GOLD"),
            vm.envAddress("TOKEN_SILVER"),
            vm.envAddress("TOKEN_WTI")
        ];
        string[10] memory ids = [
            "nvda",
            "aapl",
            "msft",
            "amzn",
            "googl",
            "meta",
            "tsla",
            "gold",
            "silver",
            "wti"
        ];

        vm.startBroadcast(pk);
        PegforgePortal portal = new PegforgePortal();
        portal.setMarket(address(market));
        market.setExpressOperator(address(portal));
        portal.setSourceChain(11155111, true);
        portal.setSourceChain(84532, true);
        portal.setSourceChain(46630, true);
        portal.setSourceChain(0, true);

        for (uint256 i = 0; i < tokens.length; i++) {
            portal.setMezoToken(keccak256(bytes(ids[i])), tokens[i]);
            MockRWA(tokens[i]).setMinter(address(portal));
        }

        console2.log("PORTAL", address(portal));
        console2.log("MARKET", address(market));
        vm.stopBroadcast();
    }
}
