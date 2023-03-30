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
exports.getNonCirculatingSupplyAddressConfigurations = exports.getNetworkConfigurations = exports.nonCirculatingSupplyAddressesConfigInput = exports.chainIdToNetworkMap = void 0;
// src/config.ts
const node_fetch_1 = __importDefault(require("node-fetch"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const API_URL = 'https://api-leaderboard.dev.svcs.ferrumnetwork.io/api/v1/currencies/token/data';
const tokenContractAddress = "0xa719b8ab7ea7af0ddb4358719a34631bb79d15dc";
const chainId = 56;
exports.chainIdToNetworkMap = {
    "1": {
        jsonRpcUrl: "https://nd-770-685-838.p2pify.com/e30d3ea257d1588823179ce4d5811a61",
        name: "Ethereum"
    },
    "56": {
        jsonRpcUrl: "https://nd-605-906-592.p2pify.com/df9065025f5e18317e708040b1f2ab13",
        name: "BSC"
    },
    "137": {
        jsonRpcUrl: "https://nd-662-671-431.p2pify.com/72aea5a70bbd5482f9a498540072b1e1",
        name: "Polygon"
    },
    "42161": {
        jsonRpcUrl: "https://nd-674-145-610.p2pify.com/bc9acaa6f1386224186fb1e794c40c14",
        name: "Arbitrum One"
    },
    "43114": {
        jsonRpcUrl: "https://nd-900-134-973.p2pify.com/0a4e07e77ebc245f0bf7839745b4803b/ext/bc/C/rpc",
        name: "Avalanche"
    }
};
function getNetworkConfigurations() {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `${API_URL}?tokenContractAddress=${tokenContractAddress}&chainId=${chainId}&offset=0`;
        const response = yield (0, node_fetch_1.default)(url);
        const data = yield response.json();
        const networks = {};
        for (const item of data.body.currencyAddressesByNetworks) {
            const network = exports.chainIdToNetworkMap[item.network.chainId];
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
function getNonCirculatingSupplyAddressConfigurations() {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `${API_URL}?tokenContractAddress=${tokenContractAddress}&chainId=${chainId}&offset=0`;
        const response = yield (0, node_fetch_1.default)(url);
        const data = yield response.json();
        const nonCirculatingSupplyAddresses = [];
        for (const item of exports.nonCirculatingSupplyAddressesConfigInput) {
            const network = exports.chainIdToNetworkMap[item.chainId];
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
