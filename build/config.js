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
exports.getNonCirculatingSupplyAddressConfigurations = exports.getNetworkConfigurations = exports.nonCirculatingSupplyAddressesConfigInput = void 0;
// src/config.ts
const node_fetch_1 = __importDefault(require("node-fetch"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const mongodb_1 = require("mongodb");
const dotenv_1 = require("dotenv");
(0, dotenv_1.config)();
const API_URL = process.env.API_URL;
// const MONGODB_URI = "mongodb+srv://tokenSupply_app_dev_qa_uat:M4T9dEmF4hpDTt5f@ferrum-netwrok-dev-qa-u.kyjw1.mongodb.net/?retryWrites=true&w=majority";
const DATABASE_NAME = "ferrum-network-dev";
function getChainIdToNetworkMap() {
    return __awaiter(this, void 0, void 0, function* () {
        const MONGODB_URI = process.env.MONGODB_URI;
        if (!MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in the environment variables');
        }
        const client = new mongodb_1.MongoClient(MONGODB_URI);
        yield client.connect();
        const database = client.db(DATABASE_NAME);
        const chainIdToNetworkMapCollection = database.collection("chainIdToNetworkMap");
        const result = yield chainIdToNetworkMapCollection.findOne({ appName: "tokenSupply" });
        yield client.close();
        if (!result) {
            throw new Error("chainIdToNetworkMap not found in the database.");
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
        return networks;
    });
}
exports.getNetworkConfigurations = getNetworkConfigurations;
exports.nonCirculatingSupplyAddressesConfigInput = JSON.parse(fs_1.default.readFileSync(path_1.default.join(__dirname, "../config/", "nonCirculatingSupplyAddressesConfig.json"), "utf-8"));
function getNonCirculatingSupplyAddressConfigurations(tokenContractAddress, chainId) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `${API_URL}?tokenContractAddress=${tokenContractAddress}&chainId=${chainId}&offset=0`;
        const response = yield (0, node_fetch_1.default)(url);
        const data = yield response.json();
        const nonCirculatingSupplyAddresses = [];
        const chainIdToNetworkMap = yield getChainIdToNetworkMap();
        for (const item of exports.nonCirculatingSupplyAddressesConfigInput) {
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
