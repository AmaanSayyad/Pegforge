// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console2} from "forge-std/Script.sol";
import {MockRWA} from "../contracts/MockRWA.sol";
import {PegforgePortal} from "../contracts/PegforgePortal.sol";
import {RwaMUSDMarket} from "../contracts/RwaMUSDMarket.sol";

contract WireMezoAssets is Script {
    struct AssetSpec {
        string id;
        string name;
        string symbol;
        uint256 priceUsd;
        uint256 maxLtvBps;
        uint256 liqBps;
    }

    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        PegforgePortal portal = PegforgePortal(vm.envAddress("PORTAL"));
        RwaMUSDMarket market = RwaMUSDMarket(vm.envAddress("MARKET"));

        AssetSpec[10] memory specs = [
            AssetSpec("nvda", "pegforge NVIDIA", "xNVDA", 21794e16, 5000, 6000),
            AssetSpec("aapl", "pegforge Apple", "xAAPL", 3471e17, 5000, 6000),
            AssetSpec("msft", "pegforge Microsoft", "xMSFT", 53133e16, 5000, 6000),
            AssetSpec("amzn", "pegforge Amazon", "xAMZN", 2531e17, 4500, 5500),
            AssetSpec("googl", "pegforge Alphabet", "xGOOGL", 32058e16, 4500, 5500),
            AssetSpec("meta", "pegforge Meta", "xMETA", 62019e16, 4500, 5500),
            AssetSpec("tsla", "pegforge Tesla", "xTSLA", 40746e16, 4000, 5000),
            AssetSpec("gold", "pegforge Gold", "xGOLD", 405438e16, 6500, 7500),
            AssetSpec("silver", "pegforge Silver", "xSILVER", 5411e16, 5500, 6500),
            AssetSpec("wti", "pegforge WTI", "xWTI", 10164e16, 4000, 5000)
        ];

        vm.startBroadcast(pk);
        for (uint256 i = 0; i < specs.length; i++) {
            MockRWA token = new MockRWA(specs[i].name, specs[i].symbol, address(portal));
            bytes32 assetId = keccak256(bytes(specs[i].id));
            portal.setMezoToken(assetId, address(token));
            market.listAsset(address(token), specs[i].priceUsd, specs[i].maxLtvBps, specs[i].liqBps);
            console2.log(specs[i].id, address(token));
        }
        vm.stopBroadcast();
    }
}
