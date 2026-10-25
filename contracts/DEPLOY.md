# Pegforge deploy - bridge / wrap / borrow (testnets)

## Architecture

1. **Source chains** (Sepolia / Base Sepolia): `MockRWA` (faucet) + `SourceVault` (approve → lock)
2. **Mezo Testnet (31611)**: `MockRWA` (minter = portal) + `PegforgePortal` + `RwaMUSDMarket` (MUSD liquidity)
3. **UI**: Express (1 confirm on Mezo) or Full (lock source → claim on Mezo)

MUSD (Mezo testnet): `0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503`

## Live deployment (2026-10-29)

Wallet: `0xF7249B507F1f89Eaea5d694cEf5cb96F245Bc5b6`

### Mezo testnet (31611) - Sourcify `exact_match`

| Contract | Address | Explorer | Sourcify |
| --- | --- | --- | --- |
| PegforgePortal | `0xa64350F13010225585640E6af5acc3AF04480C2a` | [explorer](https://explorer.test.mezo.org/address/0xa64350F13010225585640E6af5acc3AF04480C2a) | [sourcify](https://repo.sourcify.dev/contracts/full_match/31611/0xa64350F13010225585640E6af5acc3AF04480C2a/) |
| RwaMUSDMarket | `0xF82263e2A01BF3977500CfD2A95A6B6d2103BF7B` | [explorer](https://explorer.test.mezo.org/address/0xF82263e2A01BF3977500CfD2A95A6B6d2103BF7B) | [sourcify](https://repo.sourcify.dev/contracts/full_match/31611/0xF82263e2A01BF3977500CfD2A95A6B6d2103BF7B/) |
| xNVDA | `0xD1EAA16e0a1689C1b4c4B4BD7a3Ff18eA2Cfd650` | [explorer](https://explorer.test.mezo.org/address/0xD1EAA16e0a1689C1b4c4B4BD7a3Ff18eA2Cfd650) | [sourcify](https://repo.sourcify.dev/contracts/full_match/31611/0xD1EAA16e0a1689C1b4c4B4BD7a3Ff18eA2Cfd650/) |
| xAAPL | `0x465c20d9b234D46B601153fDE1a55fAeC0b1569e` | [explorer](https://explorer.test.mezo.org/address/0x465c20d9b234D46B601153fDE1a55fAeC0b1569e) | [sourcify](https://repo.sourcify.dev/contracts/full_match/31611/0x465c20d9b234D46B601153fDE1a55fAeC0b1569e/) |
| xMSFT | `0xEa8860639d003c9B746B94d077D6dD5052e7cF5d` | [explorer](https://explorer.test.mezo.org/address/0xEa8860639d003c9B746B94d077D6dD5052e7cF5d) | [sourcify](https://repo.sourcify.dev/contracts/full_match/31611/0xEa8860639d003c9B746B94d077D6dD5052e7cF5d/) |
| xAMZN | `0xBdb5bDc633Dec3F7D288C1b93b775A80fFE1aD40` | [explorer](https://explorer.test.mezo.org/address/0xBdb5bDc633Dec3F7D288C1b93b775A80fFE1aD40) | [sourcify](https://repo.sourcify.dev/contracts/full_match/31611/0xBdb5bDc633Dec3F7D288C1b93b775A80fFE1aD40/) |
| xGOOGL | `0x15D7CaE32F552F4F81bCBe1B68F04869366b436A` | [explorer](https://explorer.test.mezo.org/address/0x15D7CaE32F552F4F81bCBe1B68F04869366b436A) | [sourcify](https://repo.sourcify.dev/contracts/full_match/31611/0x15D7CaE32F552F4F81bCBe1B68F04869366b436A/) |
| xMETA | `0x2CdA441bA79F54E1dE7c366dF09c260247941760` | [explorer](https://explorer.test.mezo.org/address/0x2CdA441bA79F54E1dE7c366dF09c260247941760) | [sourcify](https://repo.sourcify.dev/contracts/full_match/31611/0x2CdA441bA79F54E1dE7c366dF09c260247941760/) |
| xTSLA | `0x0FF14768c7598e6F287bfC6451B888c406dfD5Bd` | [explorer](https://explorer.test.mezo.org/address/0x0FF14768c7598e6F287bfC6451B888c406dfD5Bd) | [sourcify](https://repo.sourcify.dev/contracts/full_match/31611/0x0FF14768c7598e6F287bfC6451B888c406dfD5Bd/) |
| xGOLD | `0xe16E629C36427d00804027d569416f0f8928F3a2` | [explorer](https://explorer.test.mezo.org/address/0xe16E629C36427d00804027d569416f0f8928F3a2) | [sourcify](https://repo.sourcify.dev/contracts/full_match/31611/0xe16E629C36427d00804027d569416f0f8928F3a2/) |
| xSILVER | `0x88f6c41970274525B0dd9B07152Dbb4b596Bc94f` | [explorer](https://explorer.test.mezo.org/address/0x88f6c41970274525B0dd9B07152Dbb4b596Bc94f) | [sourcify](https://repo.sourcify.dev/contracts/full_match/31611/0x88f6c41970274525B0dd9B07152Dbb4b596Bc94f/) |
| xWTI | `0xfeAAa8c66A6b395256eA232036D8858f22d7bBa2` | [explorer](https://explorer.test.mezo.org/address/0xfeAAa8c66A6b395256eA232036D8858f22d7bBa2) | [sourcify](https://repo.sourcify.dev/contracts/full_match/31611/0xfeAAa8c66A6b395256eA232036D8858f22d7bBa2/) |

### Sepolia (11155111) - Sourcify `exact_match`

| Contract | Address |
| --- | --- |
| SourceVault | [`0x579C1Ef1387Ca3A80850CB1df38a33689509d357`](https://sepolia.etherscan.io/address/0x579C1Ef1387Ca3A80850CB1df38a33689509d357) |
| NVDAon | `0xc535F241CaDaFe0390Ef99cdb94F0f569f71C658` |
| AAPLx | `0x7019f2f987f91c6902b25614b9ccea8a4bf9d29b` |
| GOOGon | `0x42ea3dffd304ee8c2a7c3886175021700b3dd118` |
| METAx | `0x7397e86dbf9a4eacba0f5ae5f1ca180de3151380` |
| GOLDon | `0xdb7852e4b1ab6d102e5e0f4be668072225a65c00` |
| WTIon | `0xb2c79de2bd3d7cd6892fd1eadcf78ebe09ca6c65` |
| TSLAr | `0x486506794830f903025d3d19302a883f7d0edd68` |

### Base Sepolia (84532) - Sourcify `exact_match`

| Contract | Address |
| --- | --- |
| SourceVault | [`0xbbd719534c41eef0094c6e460a7a9526c8bfcc85`](https://sepolia.basescan.org/address/0xbbd719534c41eef0094c6e460a7a9526c8bfcc85) |
| MSFTx | `0xf82263e2a01bf3977500cfd2a95a6b6d2103bf7b` |
| AMZNb | `0x899a1dff98c3ad911e626787a0e708812d2fd119` |
| SILVERx | `0xf6b4c0dd3355103523f031c8a1eae944a8145180` |

## Re-verify / publish source

Mezo explorer Blockscout API currently 404s, so publish via **Sourcify** (exact match). Explorers that sync Sourcify will show the source.

```bash
# Mezo live contracts
bash script/verify_all.sh

# Sepolia + Base Sepolia
bash script/verify_source_chains.sh
```

Compiler: solc `0.8.28`, optimizer `200` runs (`foundry.toml`).

MockRWA constructor minter on Mezo was the original portal `0xb8171c4E2002Deea048477D8B337ff27F9a36687` (later retargeted to current portal via `setMinter`).

## Deploy scripts

```bash
# With Foundry + PRIVATE_KEY
forge script script/DeployExpress.s.sol:DeployExpress --rpc-url https://rpc.test.mezo.org --broadcast
forge script script/RedeployPortal.s.sol:RedeployPortal --rpc-url https://rpc.test.mezo.org --broadcast
forge script script/DeploySource.s.sol:DeploySource --rpc-url $SEPOLIA_RPC --broadcast
```

## Env (`.env`)

```
NEXT_PUBLIC_PROJECT_ID=...
NEXT_PUBLIC_PEGORGE_PORTAL=0xa64350F13010225585640E6af5acc3AF04480C2a
NEXT_PUBLIC_RWA_MARKET=0xF82263e2A01BF3977500CfD2A95A6B6d2103BF7B
NEXT_PUBLIC_MEZO_TOKEN_NVDA=0x...
NEXT_PUBLIC_SOURCE_TOKEN_NVDA=0x...
NEXT_PUBLIC_SOURCE_VAULT_11155111=0x579C1Ef1387Ca3A80850CB1df38a33689509d357
NEXT_PUBLIC_SOURCE_VAULT_84532=0xbbd719534c41eef0094c6e460a7a9526c8bfcc85
```

## Wallet UX

Express: one MetaMask confirm on Mezo (`expressLoan`).

Full: `source mint → approve vault → lock → Mezo claimExpressLoan` (lockId-bound).

## Frontend

Production UI: https://pegforge.fun/
