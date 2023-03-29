// src/utils.ts
import axios, { AxiosResponse } from 'axios';
import Web3 from 'web3';
import { AbiItem } from 'web3-utils';
import BigNumber from "bignumber.js";
import erc20AbiJson from './erc20Abi.json';

const erc20Abi: AbiItem[] = erc20AbiJson as any;

export async function getBep2TokenBalance(address: string, jsonRpcUrl: string, tokenContractAddress: string): Promise<number> {
  const url = `${jsonRpcUrl}/api/v1/account/${address}`;

  try {
    const response: AxiosResponse = await axios.get(url);

    if (response.data && response.data.balances) {
      for (const balance of response.data.balances) {
        if (balance.symbol === tokenContractAddress) {
          return parseFloat(balance.free);
        }
      }
    }

    throw new Error(`Failed to fetch ${tokenContractAddress} balance`);
  } catch (error) {
    console.error(`Error fetching ${tokenContractAddress} balance:`, error);
    throw error;
  }
}

export async function getErc20TokenBalance(
    address: string,
    jsonRpcUrl: string,
    tokenContractAddress: string
  ): Promise<number> {
    const web3 = new Web3(jsonRpcUrl);
    const tokenContract = new web3.eth.Contract(erc20Abi as AbiItem[], tokenContractAddress);
  
    try {
      const decimals = await tokenContract.methods.decimals().call();
      const balance = await tokenContract.methods.balanceOf(address).call();
      const divisor = new BigNumber(10).pow(decimals);
      return new BigNumber(balance).dividedBy(divisor).toNumber();
    } catch (error) {
      console.error(`Error getting ERC20 token balance for address ${address}:`, error);
      throw error;
    }
  }
