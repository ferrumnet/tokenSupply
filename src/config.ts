// src/config.ts
import { NetworkConfigurations } from "./getSupplyAcrossNetworks";

const networks: NetworkConfigurations = {
  Ethereum: {
    jsonRpcUrl: "ADD_YOUR_ETHEREUM_RPC_ENDPOINT",
    tokenContractAddress: "ADD_YOUR_ETHEREUM_TOKEN_SMART_CONTRACT_ADDRESS_IN_LOWER_CASE",
  },
  BSC: {
    jsonRpcUrl: "ADD_YOUR_BSC_RPC_ENDPOINT",
    tokenContractAddress: "ADD_YOUR_BSC_TOKEN_SMART_CONTRACT_ADDRESS_IN_LOWER_CASE",
  },
/* 
You can keep adding as many networks as your token is deployed on, 
just provide a network object with the key of network name such as Polygon, Arbitrum etc
with the jsonRpcUrl of your choice, this can be a public RPC Url (Not recommended due to rate limiting)
or a paid one through Chainstack or other providers. Also provide the token smart contract address in lower
case. See example
    Arbitrum: {
        jsonRpcUrl: "https://arb1.arbitrum.io/rpc",
        tokenContractAddress: "0x9f6abbf0ba6b5bfa27f4deb6597cc6ec20573fda",
    },
    Avalanche: {
        jsonRpcUrl: "https://api.avax.network/ext/bc/C/rpc",
        tokenContractAddress: "0xe5caef4af8780e59df925470b050fb23c43ca68c",
    }

*/
  


};

export { networks };
