// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Script, console2} from "forge-std/Script.sol";
import {MockRWA} from "../contracts/MockRWA.sol";
import {PegforgePortal} from "../contracts/PegforgePortal.sol";
import {RwaMUSDMarket} from "../contracts/RwaMUSDMarket.sol";

/**
 * @notice Redeploy Portal + Market with expressLoan (1 MetaMask), retarget existing MockRWAs.
 */
contract DeployExpress is Script {
    address constant MUSD = 0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503;

    struct Spec {
        string id;
        address token;
        uint256 priceUsd;
        uint256 maxLtvBps;
        uint256 liqBps;
    }

    function run() external {
        uint256 pk = vm.envUint("PRIVATE_KEY");

        Spec[10] memory specs = [
            Spec("nvda", vm.envAddress("TOKEN_NVDA"), 21794e16, 5000, 6000),
            Spec("aapl", vm.envAddress("TOKEN_AAPL"), 3471e17, 5000, 6000),
            Spec("msft", vm.envAddress("TOKEN_MSFT"), 53133e16, 5000, 6000),
            Spec("amzn", vm.envAddress("TOKEN_AMZN"), 2531e17, 4500, 5500),
            Spec("googl", vm.envAddress("TOKEN_GOOGL"), 32058e16, 4500, 5500),
            Spec("meta", vm.envAddress("TOKEN_META"), 62019e16, 4500, 5500),
            Spec("tsla", vm.envAddress("TOKEN_TSLA"), 40746e16, 4000, 5000),
            Spec("gold", vm.envAddress("TOKEN_GOLD"), 405438e16, 6500, 7500),
            Spec("silver", vm.envAddress("TOKEN_SILVER"), 5411e16, 5500, 6500),
            Spec("wti", vm.envAddress("TOKEN_WTI"), 10164e16, 4000, 5000)
        ];

        vm.startBroadcast(pk);

        PegforgePortal portal = new PegforgePortal();
        RwaMUSDMarket market = new RwaMUSDMarket(MUSD);

        portal.setMarket(address(market));
        market.setExpressOperator(address(portal));

        portal.setSourceChain(11155111, true);
        portal.setSourceChain(84532, true);
        portal.setSourceChain(46630, true);
        portal.setSourceChain(0, true);

        console2.log("PORTAL", address(portal));
        console2.log("MARKET", address(market));

        for (uint256 i = 0; i < specs.length; i++) {
            bytes32 assetId = keccak256(bytes(specs[i].id));
            portal.setMezoToken(assetId, specs[i].token);
            market.listAsset(
                specs[i].token,
                specs[i].priceUsd,
                specs[i].maxLtvBps,
                specs[i].liqBps
            );
            MockRWA(specs[i].token).setMinter(address(portal));
            console2.log(specs[i].id, specs[i].token);
        }

        vm.stopBroadcast();
    }
}
