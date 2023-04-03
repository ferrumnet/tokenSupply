"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNonCirculatingSupplyAddressConfigurationsByTokenAndChain = exports.updateNonCirculatingSupplyAddressConfigurations = exports.setNonCirculatingSupplyAddressConfigurations = exports.getTokenContractAddresses = exports.getNonCirculatingSupplyAddressConfigurations = exports.getNonCirculatingSupplyAddressesConfigInputRaw = exports.getNonCirculatingSupplyAddressesConfigInput = exports.getNetworkConfigurations = void 0;
// src/config.ts
const node_fetch_1 = __importDefault(require("node-fetch"));
const mongodb_1 = require("mongodb");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const API_URL = process.env.API_URL;
const DATABASE_NAME = process.env.DATABASE_NAME;
const DB_COLLECTION_NAME_NON_CIRCULATING_SUPPLY_ADDRESS = process.env.DB_COLLECTION_NAME_NON_CIRCULATING_SUPPLY_ADDRESS;
const DB_COLLECTION_NAME_CHAIN_NETWORK_MAP = process.env.DB_COLLECTION_NAME_CHAIN_NETWORK_MAP;
function getChainIdToNetworkMap() {
    return __awaiter(this, void 0, void 0, function* () {
        const MONGODB_URI = process.env.MONGODB_URI;
        if (!MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in the environment variables');
        }
        const client = new mongodb_1.MongoClient(MONGODB_URI);
        yield client.connect();
        const database = client.db(DATABASE_NAME);
        const chainIdToNetworkMapCollection = database.collection(DB_COLLECTION_NAME_CHAIN_NETWORK_MAP);
        const result = yield chainIdToNetworkMapCollection.findOne({ appName: "tokenSupply" });
        yield client.close();
        if (!result) {
            throw new Error(`${DB_COLLECTION_NAME_CHAIN_NETWORK_MAP} not found in the database.`);
        }
        const chainIdToNetworkMap = {};
        for (const item of result.chainIdToNetworkMap) {
            chainIdToNetworkMap[item.chainId] = {
                jsonRpcUrl: item.jsonRpcUrl,
                name: item.name,
            };
        }
        return chainIdToNetworkMap;
    });
}
function getNetworkConfigurations(tokenContractAddress, chainId) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `${API_URL}?tokenContractAddress=${tokenContractAddress}&chainId=${chainId}&offset=0`;
        const response = yield (0, node_fetch_1.default)(url);
        const data = yield response.json();
        const networks = {};
        const chainIdToNetworkMap = yield getChainIdToNetworkMap();
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
    });
}
exports.getNetworkConfigurations = getNetworkConfigurations;
function getNonCirculatingSupplyAddressesConfigInput(currencyId) {
    return __awaiter(this, void 0, void 0, function* () {
        const MONGODB_URI = process.env.MONGODB_URI;
        if (!MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in the environment variables');
        }
        const client = new mongodb_1.MongoClient(MONGODB_URI);
        yield client.connect();
        const database = client.db(DATABASE_NAME);
        const collection = database.collection(DB_COLLECTION_NAME_NON_CIRCULATING_SUPPLY_ADDRESS);
        const result = yield collection.findOne({ currency: new mongodb_1.ObjectId(currencyId) });
        yield client.close();
        if (!result) {
            throw new Error(`No non-circulating supply addresses configuration found for currency with ID: ${currencyId}`);
        }
        return result.nonCirculatingSupplyAddresses;
    });
}
exports.getNonCirculatingSupplyAddressesConfigInput = getNonCirculatingSupplyAddressesConfigInput;
function getNonCirculatingSupplyAddressesConfigInputRaw(currencyId) {
    return __awaiter(this, void 0, void 0, function* () {
        const MONGODB_URI = process.env.MONGODB_URI;
        if (!MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in the environment variables');
        }
        const client = new mongodb_1.MongoClient(MONGODB_URI);
        yield client.connect();
        const database = client.db(DATABASE_NAME);
        const collection = database.collection(DB_COLLECTION_NAME_NON_CIRCULATING_SUPPLY_ADDRESS);
        const result = yield collection.findOne({ currency: new mongodb_1.ObjectId(currencyId) });
        yield client.close();
        if (!result) {
            throw new Error(`No non-circulating supply addresses configuration found for currency with ID: ${currencyId}`);
        }
        return result;
    });
}
exports.getNonCirculatingSupplyAddressesConfigInputRaw = getNonCirculatingSupplyAddressesConfigInputRaw;
function getNonCirculatingSupplyAddressConfigurations(tokenContractAddress, chainId, currencyId) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `${API_URL}?tokenContractAddress=${tokenContractAddress}&chainId=${chainId}&offset=0`;
        const response = yield (0, node_fetch_1.default)(url);
        const data = yield response.json();
        const nonCirculatingSupplyAddresses = [];
        const chainIdToNetworkMap = yield getChainIdToNetworkMap();
        const nonCirculatingSupplyAddressesConfigInput = yield getNonCirculatingSupplyAddressesConfigInput(currencyId);
        for (const item of nonCirculatingSupplyAddressesConfigInput) {
            const network = chainIdToNetworkMap[item.chainId];
            let networkItemFromGatewayConfig = data.body.currencyAddressesByNetworks.find(i => i.network.chainId === item.chainId);
            nonCirculatingSupplyAddresses.push({
                name: item.name,
                address: item.address,
                tokenContractAddress: networkItemFromGatewayConfig === null || networkItemFromGatewayConfig === void 0 ? void 0 : networkItemFromGatewayConfig.tokenContractAddress,
                jsonRpcUrl: network.jsonRpcUrl,
                chainId: item.chainId
            });
        }
        return nonCirculatingSupplyAddresses;
    });
}
exports.getNonCirculatingSupplyAddressConfigurations = getNonCirculatingSupplyAddressConfigurations;
function getTokenContractAddresses(tokenContractAddress, chainId) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `${API_URL}?tokenContractAddress=${tokenContractAddress}&chainId=${chainId}&offset=0`;
        const response = yield (0, node_fetch_1.default)(url);
        const data = yield response.json();
        const tokenAddresses = [];
        const firstItem = data.body.currencyAddressesByNetworks[0];
        if (!firstItem) {
            throw new Error('No data found in currencyAddressesByNetworks');
        }
        const tokenDetails = {
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
    });
}
exports.getTokenContractAddresses = getTokenContractAddresses;
function setNonCirculatingSupplyAddressConfigurations(currencyId, nonCirculatingSupplyAddresses) {
    return __awaiter(this, void 0, void 0, function* () {
        const MONGODB_URI = process.env.MONGODB_URI;
        if (!MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in the environment variables');
        }
        const client = new mongodb_1.MongoClient(MONGODB_URI);
        yield client.connect();
        const database = client.db(DATABASE_NAME);
        const collection = database.collection(DB_COLLECTION_NAME_NON_CIRCULATING_SUPPLY_ADDRESS);
        const newConfig = {
            currency: new mongodb_1.ObjectId(currencyId),
            nonCirculatingSupplyAddresses,
        };
        try {
            // Insert the document and store the result
            const result = yield collection.insertOne(newConfig);
            // Retrieve the inserted document using insertedId
            const insertedDocument = yield collection.findOne({ _id: result.insertedId });
            // Close the client connection
            yield client.close();
            // Check if the insertedDocument is not null, otherwise throw an error
            if (!insertedDocument) {
                throw new Error("Failed to retrieve the inserted document");
            }
            // Return the inserted document
            return insertedDocument;
        }
        catch (error) {
            yield client.close();
            if (error.code === 11000) {
                throw new Error("Non-Circulating Supply Addresses have already been configured for this currency. If you'd like to update them, try the update form.");
            }
            else {
                throw error;
            }
        }
    });
}
exports.setNonCirculatingSupplyAddressConfigurations = setNonCirculatingSupplyAddressConfigurations;
function updateNonCirculatingSupplyAddressConfigurations(currencyId, nonCirculatingSupplyAddresses) {
    return __awaiter(this, void 0, void 0, function* () {
        const MONGODB_URI = process.env.MONGODB_URI;
        if (!MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in the environment variables');
        }
        const client = new mongodb_1.MongoClient(MONGODB_URI);
        yield client.connect();
        const database = client.db(DATABASE_NAME);
        const collection = database.collection(DB_COLLECTION_NAME_NON_CIRCULATING_SUPPLY_ADDRESS);
        console.log(currencyId);
        try {
            const result = yield collection.updateOne({ currency: new mongodb_1.ObjectId(currencyId) }, { $set: { nonCirculatingSupplyAddresses } });
            if (result.modifiedCount === 0) {
                throw new Error('No non-circulating supply addresses configuration found for the specified currency ID');
            }
            const updatedDocument = yield collection.findOne({ currency: new mongodb_1.ObjectId(currencyId) });
            yield client.close();
            if (!updatedDocument) {
                throw new Error("Failed to retrieve the updated document");
            }
            return updatedDocument;
        }
        catch (error) {
            yield client.close();
            throw error;
        }
    });
}
exports.updateNonCirculatingSupplyAddressConfigurations = updateNonCirculatingSupplyAddressConfigurations;
function getNonCirculatingSupplyAddressConfigurationsByTokenAndChain(tokenContractAddress, chainId) {
    return __awaiter(this, void 0, void 0, function* () {
        // Get network configurations and currencyId
        const { networks, currencyId } = yield getNetworkConfigurations(tokenContractAddress, chainId);
        // Get non-circulating supply address configurations using the currencyId
        const nonCirculatingSupplyAddresses = yield getNonCirculatingSupplyAddressesConfigInputRaw(currencyId);
        return nonCirculatingSupplyAddresses;
    });
}
exports.getNonCirculatingSupplyAddressConfigurationsByTokenAndChain = getNonCirculatingSupplyAddressConfigurationsByTokenAndChain;
