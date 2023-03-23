#!/bin/bash

JSON_RPC_ENDPOINT_URL="https://nd-499-825-018.p2pify.com/5d8bab30e1462f48144c36f18d2ee958"
TOKEN_CONTRACT_ADDRESS="0x9f6AbbF0Ba6B5bfa27f4deb6597CC6Ec20573FDA"

# Query the number of decimals for the token
decimals_response=$(curl -s -X POST --data '{"jsonrpc":"2.0","method":"eth_call","params":[{"to": "'$TOKEN_CONTRACT_ADDRESS'", "data": "0x313ce567"}, "latest"],"id":1}' -H "Content-Type: application/json" $JSON_RPC_ENDPOINT_URL)

# Extract the hexadecimal result from the response
decimals_hex=$(echo $decimals_response | jq -r '.result')

# Convert the hexadecimal value to decimal using Python 3
decimals=$(python3 -c "print(int('$decimals_hex', 16))")

# Make the JSON-RPC request for totalSupply
total_supply_response=$(curl -s -X POST --data '{"jsonrpc":"2.0","method":"eth_call","params":[{"to": "'$TOKEN_CONTRACT_ADDRESS'", "data": "0x18160ddd"}, "latest"],"id":1}' -H "Content-Type: application/json" $JSON_RPC_ENDPOINT_URL)

# Extract the hexadecimal result from the response
total_supply_hex=$(echo $total_supply_response | jq -r '.result')

# Convert the hexadecimal value to decimal using Python 3
total_supply=$(python3 -c "print(int('$total_supply_hex', 16))")

# Calculate the Ether value of the total supply
total_supply_ether=$(echo "scale=$decimals; $total_supply / (10 ^ $decimals)" | bc)

# Output the results
echo "Decimals: $decimals"
echo "Total supply (in tokens): $total_supply"
echo "Total supply (in Ether): $total_supply_ether"
