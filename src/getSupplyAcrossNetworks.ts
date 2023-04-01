// src/getSupplyAcrossNetworks.ts
import { AbiItem } from "web3-utils";
import BigNumber from "bignumber.js";
import Web3 from "web3";
import erc20AbiJson from "./erc20Abi.json";
import axios, { AxiosResponse } from "axios";
import { getNetworkConfigurations, getNonCirculatingSupplyAddressConfigurations } from "./config";
import { NonCirculatingSupplyBalance } from './types';
import { getBep2TokenBalance, getErc20TokenBalance } from './utils';
import { NetworkConfigurations } from "./types";

const erc20Abi: AbiItem[] = erc20AbiJson as any;

export async function getNonCirculatingSupplyBalances(tokenContractAddress: string, chainId: number, currencyId: string): Promise<{
  balances: NonCirculatingSupplyBalance[];
  total: BigNumber;
}> {
  const nonCirculatingSupplyBalances: NonCirculatingSupplyBalance[] = [];
  let total = new BigNumber(0);
  for (const {
    chainId: currentChainId,
    address,
    jsonRpcUrl,
    tokenContractAddress: currentTokenContractAddress,
    name,
  } of await getNonCirculatingSupplyAddressConfigurations(tokenContractAddress, chainId, currencyId)) {
    let balance: BigNumber;
    if (currentChainId === "bnbBeaconChain") {
      balance = new BigNumber(await getBep2TokenBalance(address, jsonRpcUrl, currentTokenContractAddress));
    } else {
      balance = new BigNumber(await getErc20TokenBalance(address, jsonRpcUrl, currentTokenContractAddress));
    }
    total = total.plus(balance);
    nonCirculatingSupplyBalances.push({
      chainId: currentChainId,
      address,
      tokenContractAddress: currentTokenContractAddress,
      name,
      balance: balance,
    });
  }
  return {
    balances: nonCirculatingSupplyBalances,
    total: total,
  };
}

export const getTotalSupplyAcrossNetworks = async (networks: NetworkConfigurations): Promise < {
  [network: string]: string;total: string
} > => {
  const supplyPerNetwork: {
      [network: string]: string
  } = {};
  let totalSupply = new BigNumber(0);
  for (const network in networks) {
      const config = networks[network];
      const web3 = new Web3(config.jsonRpcUrl);
      const tokenContract = new web3.eth.Contract(erc20Abi, config.tokenContractAddress);
      try {
          const [supply, decimals] = await Promise.all([
              tokenContract.methods.totalSupply().call(),
              tokenContract.methods.decimals().call(),
          ]);
          const supplyBN = new BigNumber(supply);
          const decimalsBN = new BigNumber(10).pow(decimals);
          const supplyInEther = supplyBN.div(decimalsBN);
          totalSupply = totalSupply.plus(supplyInEther);
          supplyPerNetwork[network] = supplyInEther.toFixed(18);
      } catch (error) {
          console.error(`Error getting total supply for ${network}:`, (error as Error).message);
      }
  }
  return { ...supplyPerNetwork,
      total: totalSupply.toFixed(18)
  };
};