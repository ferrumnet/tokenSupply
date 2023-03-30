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
  