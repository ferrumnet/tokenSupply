// src/types.ts

import BigNumber from "bignumber.js";

export interface NonCirculatingSupplyBalance {
    chainId: string;
    address: string;
    tokenContractAddress: string;
    name: string;
    balance: BigNumber;
  }

  interface NetworkConfiguration {
    jsonRpcUrl: string;
    tokenContractAddress: string;
    chainId: string;
  }
  
  export type NetworkConfigurations = {
    [network: string]: NetworkConfiguration;
  };

  export interface AddressConfigurationInput {
    name: string;
    address: string;
    chainId: string;
  }

  export interface AddressConfiguration {
    name: string;
    address: string;
    tokenContractAddress: string;
    jsonRpcUrl: string;
    chainId: string;
  }

  export interface ChainIdToNetwork {
    [key: string]: {
      jsonRpcUrl: string;
      name: string;
    };
  }

  export interface GatewayCabnApiResponse {
    body: {
      currencyAddressesByNetworks: {
        network: {
          chainId: string;
        };
        currency: {
          _id: string;
        }
        tokenContractAddress: string;
      }[];
    };
  }
  