#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")/.."

ZERO=0x0000000000000000000000000000000000000000

verify_sourcify() {
  local chain="$1" rpc="$2" addr="$3" contract="$4"
  shift 4
  echo ""
  echo "==== VERIFY chain=$chain $contract @ $addr ===="
  if [[ $# -gt 0 ]]; then
    forge verify-contract --chain "$chain" --rpc-url "$rpc" --verifier sourcify --watch \
      --constructor-args "$@" "$addr" "$contract" || true
  else
    forge verify-contract --chain "$chain" --rpc-url "$rpc" --verifier sourcify --watch \
      "$addr" "$contract" || true
  fi
}

SEPOLIA_RPC="${SEPOLIA_RPC_URL:-https://ethereum-sepolia-rpc.publicnode.com}"
BASE_RPC="${BASE_SEPOLIA_RPC_URL:-https://sepolia.base.org}"

# SourceVaults (no constructor args)
verify_sourcify 11155111 "$SEPOLIA_RPC" 0x579C1Ef1387Ca3A80850CB1df38a33689509d357 contracts/SourceVault.sol:SourceVault
verify_sourcify 84532 "$BASE_RPC" 0xbbd719534c41eef0094c6e460a7a9526c8bfcc85 contracts/SourceVault.sol:SourceVault

encode_mock() {
  cast abi-encode 'constructor(string,string,address)' "$1" "$2" "$ZERO"
}

# Sepolia MockRWAs
verify_sourcify 11155111 "$SEPOLIA_RPC" 0xc535F241CaDaFe0390Ef99cdb94F0f569f71C658 contracts/MockRWA.sol:MockRWA "$(encode_mock 'Ondo NVDAon mock' NVDAon)"
verify_sourcify 11155111 "$SEPOLIA_RPC" 0x7019f2f987f91c6902b25614b9ccea8a4bf9d29b contracts/MockRWA.sol:MockRWA "$(encode_mock 'xStocks AAPL mock' AAPLx)"
verify_sourcify 11155111 "$SEPOLIA_RPC" 0x42ea3dffd304ee8c2a7c3886175021700b3dd118 contracts/MockRWA.sol:MockRWA "$(encode_mock 'Ondo GOOGLon mock' GOOGon)"
verify_sourcify 11155111 "$SEPOLIA_RPC" 0x7397e86dbf9a4eacba0f5ae5f1ca180de3151380 contracts/MockRWA.sol:MockRWA "$(encode_mock 'xStocks META mock' METAx)"
verify_sourcify 11155111 "$SEPOLIA_RPC" 0xdb7852e4b1ab6d102e5e0f4be668072225a65c00 contracts/MockRWA.sol:MockRWA "$(encode_mock 'Ondo GOLDon mock' GOLDon)"
verify_sourcify 11155111 "$SEPOLIA_RPC" 0xb2c79de2bd3d7cd6892fd1eadcf78ebe09ca6c65 contracts/MockRWA.sol:MockRWA "$(encode_mock 'Ondo WTIon mock' WTIon)"
verify_sourcify 11155111 "$SEPOLIA_RPC" 0x486506794830f903025d3d19302a883f7d0edd68 contracts/MockRWA.sol:MockRWA "$(encode_mock 'Robinhood TSLA mock' TSLAr)"

# Base Sepolia MockRWAs
verify_sourcify 84532 "$BASE_RPC" 0xf82263e2a01bf3977500cfd2a95a6b6d2103bf7b contracts/MockRWA.sol:MockRWA "$(encode_mock 'xStocks MSFT mock' MSFTx)"
verify_sourcify 84532 "$BASE_RPC" 0x899a1dff98c3ad911e626787a0e708812d2fd119 contracts/MockRWA.sol:MockRWA "$(encode_mock 'bStocks AMZN mock' AMZNb)"
verify_sourcify 84532 "$BASE_RPC" 0xf6b4c0dd3355103523f031c8a1eae944a8145180 contracts/MockRWA.sol:MockRWA "$(encode_mock 'xStocks SILVER mock' SILVERx)"

echo ""
echo "==== Source chains Sourcify done ===="
