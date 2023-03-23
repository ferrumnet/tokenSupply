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
exports.getTotalSupplyAcrossNetworks = void 0;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const web3_1 = __importDefault(require("web3"));
const networks = {
    Ethereum: {
        jsonRpcUrl: 'https://nd-770-685-838.p2pify.com/e30d3ea257d1588823179ce4d5811a61',
        tokenContractAddress: '0xe5caef4af8780e59df925470b050fb23c43ca68c',
    },
    BSC: {
        jsonRpcUrl: 'https://nd-605-906-592.p2pify.com/df9065025f5e18317e708040b1f2ab13',
        tokenContractAddress: '0xa719b8ab7ea7af0ddb4358719a34631bb79d15dc',
    },
    Polygon: {
        jsonRpcUrl: 'https://nd-662-671-431.p2pify.com/72aea5a70bbd5482f9a498540072b1e1',
        tokenContractAddress: '0xd99bafe5031cc8b345cb2e8c80135991f12d7130',
    },
    Arbitrum: {
        jsonRpcUrl: 'https://nd-674-145-610.p2pify.com/bc9acaa6f1386224186fb1e794c40c14',
        tokenContractAddress: '0x9f6abbf0ba6b5bfa27f4deb6597cc6ec20573fda',
    },
    Avalanche: {
        jsonRpcUrl: 'https://nd-900-134-973.p2pify.com/0a4e07e77ebc245f0bf7839745b4803b/ext/bc/C/rpc',
        tokenContractAddress: '0xe5caef4af8780e59df925470b050fb23c43ca68c',
    },
};
// ... (rest of the code)
const getTotalSupplyAcrossNetworks = () => __awaiter(void 0, void 0, void 0, function* () {
    let totalSupplyAcrossNetworks = new bignumber_js_1.default(0);
    const supplyPerNetwork = {};
    for (const [network, { jsonRpcUrl, tokenContractAddress }] of Object.entries(networks)) {
        const web3 = new web3_1.default(jsonRpcUrl);
        const decimalsData = '0x313ce567';
        const totalSupplyData = '0x18160ddd';
        try {
            const decimalsResponse = yield web3.eth.call({ to: tokenContractAddress, data: decimalsData });
            const decimals = parseInt(decimalsResponse, 16);
            const totalSupplyResponse = yield web3.eth.call({ to: tokenContractAddress, data: totalSupplyData });
            const totalSupply = new bignumber_js_1.default(totalSupplyResponse).shiftedBy(-decimals);
            supplyPerNetwork[network] = totalSupply.toFixed();
            totalSupplyAcrossNetworks = totalSupplyAcrossNetworks.plus(totalSupply);
        }
        catch (error) {
            console.error(`Error getting total supply for ${network}:`, error.message);
        }
    }
    return { supplyPerNetwork, total: totalSupplyAcrossNetworks.toFixed() };
});
exports.getTotalSupplyAcrossNetworks = getTotalSupplyAcrossNetworks;
(0, exports.getTotalSupplyAcrossNetworks)();