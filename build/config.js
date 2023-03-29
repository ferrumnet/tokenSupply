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
Object.defineProperty(exports, "__esModule", { value: true });
exports.nonCirculatingSupplyAddressesConfig = exports.getNetworkConfigurations = exports.chainIdToNetworkMap = void 0;
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
        const response = yield fetch(url);
        const data = yield response.json();
        const networks = {};
        for (const item of data.body.currencyAddressesByNetworks) {
            const network = exports.chainIdToNetworkMap[item.network.chainId];
            if (network) {
                networks[network.name] = {
                    jsonRpcUrl: network.jsonRpcUrl,
                    tokenContractAddress: item.tokenContractAddress
                };
            }
        }
        return networks;
    });
}
exports.getNetworkConfigurations = getNetworkConfigurations;
const nonCirculatingSupplyAddressesConfig = [
    {
        Name: "Deployer",
        Address: "0xc2fdcb728170192c72ada2c08957f2e9390076b7",
        TokenContractAddress: "0xe5caef4af8780e59df925470b050fb23c43ca68c",
        JsonRpcUrl: "https://nd-770-685-838.p2pify.com/e30d3ea257d1588823179ce4d5811a61",
        ChainId: "1"
    },
    {
        Name: "Treasury",
        Address: "0x517873ca1edaaa0f6403a0dab2cb0162433de9d1",
        TokenContractAddress: "0xa719b8ab7ea7af0ddb4358719a34631bb79d15dc",
        JsonRpcUrl: "https://nd-605-906-592.p2pify.com/df9065025f5e18317e708040b1f2ab13",
        ChainId: "56"
    },
    {
        Name: "Deployer",
        Address: "0xc2fdcb728170192c72ada2c08957f2e9390076b7",
        TokenContractAddress: "0xd99bafe5031cc8b345cb2e8c80135991f12d7130",
        JsonRpcUrl: "https://nd-662-671-431.p2pify.com/72aea5a70bbd5482f9a498540072b1e1",
        ChainId: "137"
    },
    {
        Name: "Deployer",
        Address: "0xc2fdcb728170192c72ada2c08957f2e9390076b7",
        TokenContractAddress: "0xe5caef4af8780e59df925470b050fb23c43ca68c",
        JsonRpcUrl: "https://nd-900-134-973.p2pify.com/0a4e07e77ebc245f0bf7839745b4803b/ext/bc/C/rpc",
        ChainId: "43114"
    },
    {
        Name: "Deployer",
        Address: "bnb1um8ntkgwle8yrdk0yn5hwdf7hckjpyjjg29k2p",
        TokenContractAddress: "FRM-DE7",
        JsonRpcUrl: "https://dex.binance.org",
        ChainId: "bnbBeaconChain"
    },
    {
        Name: "Treasury",
        Address: "0xe42b80dA58ccEAbe0A6ECe8e3311AE939Ef6b96c",
        TokenContractAddress: "0x9f6abbf0ba6b5bfa27f4deb6597cc6ec20573fda",
        JsonRpcUrl: "https://nd-674-145-610.p2pify.com/bc9acaa6f1386224186fb1e794c40c14",
        ChainId: "42161"
    },
    {
        Name: "Bridge Pool",
        Address: "0x8e01cc26d6dd73581347c4370573ce9e59e74802",
        TokenContractAddress: "0xe5caef4af8780e59df925470b050fb23c43ca68c",
        JsonRpcUrl: "https://nd-770-685-838.p2pify.com/e30d3ea257d1588823179ce4d5811a61",
        ChainId: "1"
    },
    {
        Name: "Bridge Pool",
        Address: "0x8e01cc26d6dd73581347c4370573ce9e59e74802",
        TokenContractAddress: "0xa719b8ab7ea7af0ddb4358719a34631bb79d15dc",
        JsonRpcUrl: "https://nd-605-906-592.p2pify.com/df9065025f5e18317e708040b1f2ab13",
        ChainId: "56"
    },
    {
        Name: "Bridge Pool",
        Address: "0x8e01cc26d6dd73581347c4370573ce9e59e74802",
        TokenContractAddress: "0xd99bafe5031cc8b345cb2e8c80135991f12d7130",
        JsonRpcUrl: "https://nd-662-671-431.p2pify.com/72aea5a70bbd5482f9a498540072b1e1",
        ChainId: "137"
    },
    {
        Name: "Bridge Pool",
        Address: "0x8e01cc26d6dd73581347c4370573ce9e59e74802",
        TokenContractAddress: "0xe5caef4af8780e59df925470b050fb23c43ca68c",
        JsonRpcUrl: "https://nd-900-134-973.p2pify.com/0a4e07e77ebc245f0bf7839745b4803b/ext/bc/C/rpc",
        ChainId: "43114"
    }
];
exports.nonCirculatingSupplyAddressesConfig = nonCirculatingSupplyAddressesConfig;
