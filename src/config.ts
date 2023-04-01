// src/config.ts
import fetch from "node-fetch";
import { AddressConfiguration, AddressConfigurationInput, NetworkConfigurations, ChainIdToNetwork, GatewayCabnApiResponse } from "./types";
import Web3 from "web3";
import { AbiItem } from "web3-utils";
import erc20Abi from "./erc20Abi.json";
import fs from "fs";
import path from "path";
import { MongoClient, ObjectId } from "mongodb";
import { config } from 'dotenv';
config();

const API_URL = process.env.API_URL;
const DATABASE_NAME = process.env.DATABASE_NAME;

async function getChainIdToNetworkMap(): Promise<ChainIdToNetwork> {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in the environment variables');
  }
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const database = client.db(DATABASE_NAME);
  const chainIdToNetworkMapCollection = database.collection("chainIdToNetworkMap");

  const result = await chainIdToNetworkMapCollection.findOne({ appName: "tokenSupply" });

  await client.close();

  if (!result) {
    throw new Error("chainIdToNetworkMap not found in the database.");
  }

  const chainIdToNetworkMap: ChainIdToNetwork = {};

  for (const item of result.chainIdToNetworkMap) {
    chainIdToNetworkMap[item.chainId] = {
      jsonRpcUrl: item.jsonRpcUrl,
      name: item.name,
    };
  }

  return chainIdToNetworkMap;
}

async function getNetworkConfigurations(tokenContractAddress: string, chainId: number): Promise<{ networks: NetworkConfigurations, currencyId: string }> {
  const url = `${API_URL}?tokenContractAddress=${tokenContractAddress}&chainId=${chainId}&offset=0`;
  const response = await fetch(url);
  const data: GatewayCabnApiResponse = await response.json();

  const networks: NetworkConfigurations = {};
  const chainIdToNetworkMap = await getChainIdToNetworkMap();

  for (const item of data.body.currencyAddressesByNetworks) {
    const network = chainIdToNetworkMap[item.network.chainId];
    if (network) {
      networks[network.name] = {
        jsonRpcUrl: network.jsonRpcUrl,
        tokenContractAddress: item.tokenContractAddress,
        chainId: item.network.chainId
      };
    }
  }

  // Get the currencyId from the response data
  const currencyId = data.body.currencyAddressesByNetworks[0].currency._id;

  return { networks, currencyId };
}


export async function getNonCirculatingSupplyAddressesConfigInput(currencyId: string): Promise<AddressConfigurationInput[]> {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in the environment variables');
  }
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const database = client.db(DATABASE_NAME);
  const collection = database.collection("nonCirculatingSupplyAddressesConfig");

  const result = await collection.findOne({ currency: new ObjectId(currencyId) });

  await client.close();

  if (!result) {
    throw new Error(`No non-circulating supply addresses configuration found for currency with ID: ${currencyId}`);
  }

  return result.nonCirculatingSupplyAddresses;
}

async function getNonCirculatingSupplyAddressConfigurations(tokenContractAddress: string, chainId: number, currencyId: string): Promise<AddressConfiguration[]> {
  const url = `${API_URL}?tokenContractAddress=${tokenContractAddress}&chainId=${chainId}&offset=0`;
  const response = await fetch(url);
  const data: GatewayCabnApiResponse = await response.json();

  const nonCirculatingSupplyAddresses: AddressConfiguration[] = [];
  const chainIdToNetworkMap = await getChainIdToNetworkMap();
  const nonCirculatingSupplyAddressesConfigInput = await getNonCirculatingSupplyAddressesConfigInput(currencyId);

  for (const item of nonCirculatingSupplyAddressesConfigInput) {
    const network = chainIdToNetworkMap[item.chainId]
    let networkItemFromGatewayConfig = data.body.currencyAddressesByNetworks.find(i => i.network.chainId === item.chainId);
    nonCirculatingSupplyAddresses.push(
      {
        name: item.name,
        address: item.address,
        tokenContractAddress: networkItemFromGatewayConfig?.tokenContractAddress as string,
        jsonRpcUrl: network.jsonRpcUrl,
        chainId: item.chainId
      }
    )
  }

  return nonCirculatingSupplyAddresses;
}

export { getNetworkConfigurations, getNonCirculatingSupplyAddressConfigurations };

