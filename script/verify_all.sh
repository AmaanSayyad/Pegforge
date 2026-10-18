#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

RPC_MEZO="${RPC_MEZO:-https://rpc.test.mezo.org}"
CHAIN_MEZO=31611

verify_mezo() {
  local addr="$1"
  local contract="$2"
  shift 2
  echo ""
  echo "==== VERIFY $contract @ $addr ===="
  if [[ $# -gt 0 ]]; then
    forge verify-contract \
      --chain "$CHAIN_MEZO" \
      --rpc-url "$RPC_MEZO" \
      --verifier sourcify \
      --watch \
      --constructor-args "$@" \
      "$addr" "$contract"
  else
    forge verify-contract \
      --chain "$CHAIN_MEZO" \
      --rpc-url "$RPC_MEZO" \
      --verifier sourcify \
      --watch \
      "$addr" "$contract"
  fi
}

# Core
verify_mezo 0xa64350F13010225585640E6af5acc3AF04480C2a contracts/PegforgePortal.sol:PegforgePortal || true
verify_mezo 0xF82263e2A01BF3977500CfD2A95A6B6d2103BF7B contracts/RwaMUSDMarket.sol:RwaMUSDMarket \
  "$(cast abi-encode 'constructor(address)' 0x118917a40FAF1CD7a13dB0Ef56C86De7973Ac503)" || true

# Mezo MockRWAs - constructor minter was original portal 0xb817...
PORTAL0=0xb8171c4E2002Deea048477D8B337ff27F9a36687

encode_mock() {
  cast abi-encode 'constructor(string,string,address)' "$1" "$2" "$PORTAL0"
}

verify_mezo 0xD1EAA16e0a1689C1b4c4B4BD7a3Ff18eA2Cfd650 contracts/MockRWA.sol:MockRWA "$(encode_mock 'pegforge NVIDIA' xNVDA)" || true
verify_mezo 0x465c20d9b234D46B601153fDE1a55fAeC0b1569e contracts/MockRWA.sol:MockRWA "$(encode_mock 'pegforge Apple' xAAPL)" || true
verify_mezo 0xEa8860639d003c9B746B94d077D6dD5052e7cF5d contracts/MockRWA.sol:MockRWA "$(encode_mock 'pegforge Microsoft' xMSFT)" || true
verify_mezo 0xBdb5bDc633Dec3F7D288C1b93b775A80fFE1aD40 contracts/MockRWA.sol:MockRWA "$(encode_mock 'pegforge Amazon' xAMZN)" || true
verify_mezo 0x15D7CaE32F552F4F81bCBe1B68F04869366b436A contracts/MockRWA.sol:MockRWA "$(encode_mock 'pegforge Alphabet' xGOOGL)" || true
verify_mezo 0x2CdA441bA79F54E1dE7c366dF09c260247941760 contracts/MockRWA.sol:MockRWA "$(encode_mock 'pegforge Meta' xMETA)" || true
verify_mezo 0x0FF14768c7598e6F287bfC6451B888c406dfD5Bd contracts/MockRWA.sol:MockRWA "$(encode_mock 'pegforge Tesla' xTSLA)" || true
verify_mezo 0xe16E629C36427d00804027d569416f0f8928F3a2 contracts/MockRWA.sol:MockRWA "$(encode_mock 'pegforge Gold' xGOLD)" || true
verify_mezo 0x88f6c41970274525B0dd9B07152Dbb4b596Bc94f contracts/MockRWA.sol:MockRWA "$(encode_mock 'pegforge Silver' xSILVER)" || true
verify_mezo 0xfeAAa8c66A6b395256eA232036D8858f22d7bBa2 contracts/MockRWA.sol:MockRWA "$(encode_mock 'pegforge WTI' xWTI)" || true

echo ""
echo "==== Mezo Sourcify done ===="
