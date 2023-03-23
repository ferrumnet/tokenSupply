# Token Supply

## Retrieve Supply of a token across networks
1. Can provide different contracts for a token on each network
2. Checks for decimals of a token on each network
3. Sums value according to required decimal conversion and provides an across network totalSupplySum

## API Creation of /totalSupply and /totalSupplyAcrossNetworks
1. Access /totalSupply to get the sum of the supply across networks in one plain test value
2. Access /totalSupplyAcrossNetworks to get the individual total supply of the token across networks