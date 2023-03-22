#!/bin/bash

JSON_RPC_ENDPOINT_URL="https://nd-499-825-018.p2pify.com/5d8bab30e1462f48144c36f18d2ee958"
TOKEN_CONTRACT_ADDRESS="0x9f6AbbF0Ba6B5bfa27f4deb6597CC6Ec20573FDA"

# Make the JSON-RPC request
response=$(curl -s -X POST --data '{"jsonrpc":"2.0","method":"eth_call","params":[{"to": "'$TOKEN_CONTRACT_ADDRESS'", "data": "0x18160ddd"}, "latest"],"id":1}' -H "Content-Type: application/json" $JSON_RPC_ENDPOINT_URL)

# Extract the hexadecimal result from the response
hex_value=$(echo $response | jq -r '.result')

# Convert the hexadecimal value to decimal using Python
decimal_value=$(python3 -c "print(int('$hex_value', 16))")

# Output the result
echo "Total supply: $decimal_value"
