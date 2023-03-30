// src/getSupplyAcrossNetworks.ts
import { AbiItem } from "web3-utils";
import BigNumber from "bignumber.js";
import Web3 from "web3";
import erc20Abi from "./erc20Abi.json";
import axios, { AxiosResponse } from "axios";
import { chainIdToNetworkMap, getNetworkConfigurations, getNonCirculatingSupplyAddressConfigurations } from "./config";
import { NonCirculatingSupplyBalance } from './types';
import { getBep2TokenBalance, getErc20TokenBalance } from './utils';
import { NetworkConfigurations } from "./types";

export async function getNonCirculatingSupplyBalances(tokenContractAddress: string, chainId: number): Promise < {
  balances: NonCirculatingSupplyBalance[];total: BigNumber
} > {
  const nonCirculatingSupplyBalances: NonCirculatingSupplyBalance[] = [];
  let total = new BigNumber(0);
  for (const {
          chainId: currentChainId,
          address,
          jsonRpcUrl,
          tokenContractAddress: currentTokenContractAddress,
          name,
      } of await getNonCirculatingSupplyAddressConfigurations(tokenContractAddress, chainId)) {
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

export const getTotalSupplyAcrossNetworks = async (
  networks: NetworkConfigurations
): Promise<{ [network: string]: string; total: string }> => {
  const erc20ABI: AbiItem[] = [
    // Some parts of the ABI have been removed for brevity
    {
      constant: true,
      inputs: [],
      name: "totalSupply",
      outputs: [{ name: "", type: "uint256" }],
      payable: false,
      stateMutability: "view" as const,
      type: "function",
    },
    {
      constant: true,
      inputs: [],
      name: "decimals",
      outputs: [{ name: "", type: "uint8" }],
      payable: false,
      stateMutability: "view" as const,
      type: "function",
    },
  ];

  const supplyPerNetwork: { [network: string]: string } = {};
  let totalSupply = new BigNumber(0);

  for (const network in networks) {
    const config = networks[network];
    const web3 = new Web3(config.jsonRpcUrl);
    const tokenContract = new web3.eth.Contract(erc20ABI, config.tokenContractAddress);

    try {
      const [supply, decimals] = await Promise.all([
        tokenContract.methods.totalSupply().call(),
        tokenContract.methods.decimals().call(),
      ]);

      const supplyBN = new BigNumber(supply);
      const decimalsBN = new BigNumber(10).pow(decimals);
      const supplyInEther = supplyBN.div(decimalsBN);

      totalSupply = totalSupply.plus(supplyInEther);
      supplyPerNetwork[network] = supplyInEther.toString();
    } catch (error) {
      console.error(`Error getting total supply for ${network}:`, (error as Error).message);
    }
  }

  return { ...supplyPerNetwork, total: totalSupply.toString() };
};

const erc20ABI: AbiItem[] = [
  // Add necessary parts of the ABI, such as "balanceOf"
  {
    constant: true,
    inputs: [],
    name: "totalSupply",
    outputs: [{ name: "", type: "uint256" }],
    payable: false,
    stateMutability: "view" as const,
    type: "function",
  },
  {
    constant: true,
    inputs: [],
    name: "decimals",
    outputs: [{ name: "", type: "uint8" }],
    payable: false,
    stateMutability: "view" as const,
    type: "function",
  },
  {
    constant: true,
    inputs: [{ name: "_owner", type: "address" }],
    name: "balanceOf",
    outputs: [{ name: "balance", type: "uint256" }],
    payable: false,
    stateMutability: "view" as const,
    type: "function",
  },
];