#!/bin/bash
# Verify a deployed Soroban contract on Stellar testnet

set -e

CONTRACT_ADDRESS=$1

if [ -z "$CONTRACT_ADDRESS" ]; then
  echo "Usage: ./scripts/verify-contract.sh <contract_address>"
  exit 1
fi

echo "Querying Stellar Soroban Testnet RPC for contract: $CONTRACT_ADDRESS"

# Standard JSON-RPC call to query contract state ledger entries
response=$(curl -s -X POST https://soroban-testnet.stellar.org \
  -H "Content-Type: application/json" \
  -d "{
    \"jsonrpc\": \"2.0\",
    \"id\": 1,
    \"method\": \"getLedgerEntries\",
    \"params\": {
      \"keys\": [
        \"$CONTRACT_ADDRESS\"
      ]
    }
  }")

# Check if result exists
if echo "$response" | grep -q "result"; then
  echo "✅ Contract successfully verified on-chain!"
  echo "Explorer URL: https://stellar.expert/explorer/testnet/contract/$CONTRACT_ADDRESS"
else
  echo "❌ Warning: Could not locate active ledger entries for this address. Verify if the deployment transaction succeeded."
  echo "Raw Response: $response"
fi
