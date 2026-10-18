// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console2} from "forge-std/Script.sol";
import {MockRWA} from "../contracts/MockRWA.sol";
import {SourceVault} from "../contracts/SourceVault.sol";

/// @notice Deploy SourceVault + open-mint MockRWAs on a source chain.
/// Set SOURCE_ASSETS as comma-separated ids matching AssetSpec below via env ASSET_IDS.
contract DeploySource is Script {
    struct Spec {
        string id;
        string name;
        string symbol;
    }

    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");
        string memory chainTag = vm.envOr("CHAIN_TAG", string("source"));
        string memory assetCsv = vm.envString("ASSET_IDS"); // e.g. "nvda,aapl,gold"

        vm.startBroadcast(pk);

        SourceVault vault = new SourceVault();
        console2.log(string.concat("VAULT_", chainTag), address(vault));

        Spec[10] memory all = [
            Spec("nvda", "Ondo NVDAon mock", "NVDAon"),
            Spec("aapl", "xStocks AAPL mock", "AAPLx"),
            Spec("msft", "xStocks MSFT mock", "MSFTx"),
            Spec("amzn", "bStocks AMZN mock", "AMZNb"),
            Spec("googl", "Ondo GOOGLon mock", "GOOGon"),
            Spec("meta", "xStocks META mock", "METAx"),
            Spec("tsla", "Robinhood TSLA mock", "TSLAr"),
            Spec("gold", "Ondo GOLDon mock", "GOLDon"),
            Spec("silver", "xStocks SILVER mock", "SILVERx"),
            Spec("wti", "Ondo WTIon mock", "WTIon")
        ];

        for (uint256 i = 0; i < all.length; i++) {
            if (!_wanted(assetCsv, all[i].id)) continue;
            MockRWA token = new MockRWA(all[i].name, all[i].symbol, address(0));
            vault.setAccepted(address(token), true);
            console2.log(string.concat("TOKEN_", all[i].id), address(token));
        }

        vm.stopBroadcast();
    }

    function _wanted(string memory csv, string memory id) internal pure returns (bool) {
        bytes memory needle = bytes(string.concat(",", id, ","));
        bytes memory hay = bytes(string.concat(",", csv, ","));
        if (hay.length < needle.length) return false;
        for (uint256 i = 0; i <= hay.length - needle.length; i++) {
            bool match_ = true;
            for (uint256 j = 0; j < needle.length; j++) {
                if (hay[i + j] != needle[j]) {
                    match_ = false;
                    break;
                }
            }
            if (match_) return true;
        }
        return false;
    }
}
