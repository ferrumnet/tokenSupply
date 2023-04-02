// src/config.ts
import fetch from "node-fetch";
import { 
  AddressConfiguration, 
  AddressConfigurationInput, 
  NetworkConfigurations, 
  ChainIdToNetwork, 
  GatewayCabnApiResponse, 
  TokenAddress, 
  TokenDetails 
} from "./types";
import Web3 from "web3";
import { AbiItem } from "web3-utils";
import erc20Abi from "./erc20Abi.json";
import fs from "fs";
import path from "path";
import { MongoClient, ObjectId, WithId, Document as MongoDocument } from "mongodb";
import { config } from 'dotenv';
config();

const API_URL = process.env.API_URL;
const DATABASE_NAME = process.env.DATABASE_NAME;
const DB_COLLECTION_NAME_NON_CIRCULATING_SUPPLY_ADDRESS = process.env.DB_COLLECTION_NAME_NON_CIRCULATING_SUPPLY_ADDRESS as string;
const DB_COLLECTION_NAME_CHAIN_NETWORK_MAP = process.env.DB_COLLECTION_NAME_CHAIN_NETWORK_MAP as string;

async function getChainIdToNetworkMap(): Promise<ChainIdToNetwork> {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in the environment variables');
  }
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const database = client.db(DATABASE_NAME);
  const chainIdToNetworkMapCollection = database.collection(DB_COLLECTION_NAME_CHAIN_NETWORK_MAP);

  const result = await chainIdToNetworkMapCollection.findOne({ appName: "tokenSupply" });

  await client.close();

  if (!result) {
    throw new Error(`${DB_COLLECTION_NAME_CHAIN_NETWORK_MAP} not found in the database.`);
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


async function getNonCirculatingSupplyAddressesConfigInput(currencyId: string): Promise<AddressConfigurationInput[]> {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in the environment variables');
  }
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const database = client.db(DATABASE_NAME);
  const collection = database.collection(DB_COLLECTION_NAME_NON_CIRCULATING_SUPPLY_ADDRESS);

  const result = await collection.findOne({ currency: new ObjectId(currencyId) });

  await client.close();

  if (!result) {
    throw new Error(`No non-circulating supply addresses configuration found for currency with ID: ${currencyId}`);
  }

  return result.nonCirculatingSupplyAddresses;
}

async function getNonCirculatingSupplyAddressesConfigInputRaw(currencyId: string): Promise<WithId<MongoDocument>> {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in the environment variables');
  }
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const database = client.db(DATABASE_NAME);
  const collection = database.collection(DB_COLLECTION_NAME_NON_CIRCULATING_SUPPLY_ADDRESS);

  const result = await collection.findOne({ currency: new ObjectId(currencyId) });

  await client.close();

  if (!result) {
    throw new Error(`No non-circulating supply addresses configuration found for currency with ID: ${currencyId}`);
  }

  return result;
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

async function getTokenContractAddresses(tokenContractAddress: string, chainId: number): Promise<{ tokenDetails: TokenDetails, tokenAddresses: Array<TokenAddress> }> {
  const url = `${API_URL}?tokenContractAddress=${tokenContractAddress}&chainId=${chainId}&offset=0`;
  const response = await fetch(url);
  const data: GatewayCabnApiResponse = await response.json();

  const tokenAddresses: Array<TokenAddress> = [];

  const firstItem = data.body.currencyAddressesByNetworks[0];
  if (!firstItem) {
    throw new Error('No data found in currencyAddressesByNetworks');
  }

  const tokenDetails: TokenDetails = {
    currencyId: firstItem.currency._id,
    name: firstItem.currency.name,
    symbol: firstItem.currency.symbol,
  };

  for (const item of data.body.currencyAddressesByNetworks) {
    tokenAddresses.push({
      tokenContractAddress: item.tokenContractAddress,
      chainId: item.network.chainId,
      networkName: item.network.name,
    });
  }
  return { tokenDetails, tokenAddresses };
}

async function setNonCirculatingSupplyAddressConfigurations(
  currencyId: string,
  nonCirculatingSupplyAddresses: AddressConfigurationInput[]
): Promise<WithId<MongoDocument>> {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in the environment variables');
  }
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const database = client.db(DATABASE_NAME);
  const collection = database.collection(DB_COLLECTION_NAME_NON_CIRCULATING_SUPPLY_ADDRESS);

  const newConfig = {
    currency: new ObjectId(currencyId),
    nonCirculatingSupplyAddresses,
  };

  try {
    // Insert the document and store the result
    const result = await collection.insertOne(newConfig);

    // Retrieve the inserted document using insertedId
    const insertedDocument = await collection.findOne({ _id: result.insertedId });

    // Close the client connection
    await client.close();

    // Check if the insertedDocument is not null, otherwise throw an error
    if (!insertedDocument) {
      throw new Error("Failed to retrieve the inserted document");
    }

    // Return the inserted document
    return insertedDocument;
  } catch (error) {
    await client.close();
  
    if ((error as any).code === 11000) {
      throw new Error(
        "Non-Circulating Supply Addresses have already been configured for this currency. If you'd like to update them, try the update form."
      );
    } else {
      throw error;
    }
  }  
}

async function updateNonCirculatingSupplyAddressConfigurations(
  currencyId: string,
  nonCirculatingSupplyAddresses: AddressConfigurationInput[]
): Promise<WithId<MongoDocument>> {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not defined in the environment variables');
  }
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  const database = client.db(DATABASE_NAME);
  const collection = database.collection(DB_COLLECTION_NAME_NON_CIRCULATING_SUPPLY_ADDRESS);
  console.log(currencyId);
  try {
    const result = await collection.updateOne(
      { currency: new ObjectId(currencyId) },
      { $set: { nonCirculatingSupplyAddresses } }
    );

    if (result.modifiedCount === 0) {
      throw new Error('No non-circulating supply addresses configuration found for the specified currency ID');
    }

    const updatedDocument = await collection.findOne({ currency: new ObjectId(currencyId) });

    await client.close();

    if (!updatedDocument) {
      throw new Error("Failed to retrieve the updated document");
    }

    return updatedDocument;
  } catch (error) {
    await client.close();
    throw error;
  }
}

async function getNonCirculatingSupplyAddressConfigurationsByTokenAndChain(tokenContractAddress: string, chainId: number): Promise<WithId<MongoDocument>> {
  // Get network configurations and currencyId
  const { networks, currencyId } = await getNetworkConfigurations(tokenContractAddress, chainId);

  // Get non-circulating supply address configurations using the currencyId
  const nonCirculatingSupplyAddresses = await getNonCirculatingSupplyAddressesConfigInputRaw(currencyId);

  return nonCirculatingSupplyAddresses;
}



export { 
  getNetworkConfigurations,
  getNonCirculatingSupplyAddressesConfigInput,
  getNonCirculatingSupplyAddressesConfigInputRaw, 
  getNonCirculatingSupplyAddressConfigurations, 
  getTokenContractAddresses,
  setNonCirculatingSupplyAddressConfigurations,
  updateNonCirculatingSupplyAddressConfigurations,
  getNonCirculatingSupplyAddressConfigurationsByTokenAndChain
};

