// src/types.ts

import BigNumber from "bignumber.js";

export interface NonCirculatingSupplyBalance {
    ChainId: string;
    Address: string;
    TokenContractAddress: string;
    Name: string;
    Balance: BigNumber;
  }
  