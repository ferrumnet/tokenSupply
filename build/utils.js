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
exports.getErc20TokenBalance = exports.getBep2TokenBalance = void 0;
// src/utils.ts
const axios_1 = __importDefault(require("axios"));
const web3_1 = __importDefault(require("web3"));
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const erc20Abi_json_1 = __importDefault(require("./erc20Abi.json"));
const erc20Abi = erc20Abi_json_1.default;
function getBep2TokenBalance(address, jsonRpcUrl, tokenContractAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        const url = `${jsonRpcUrl}/api/v1/account/${address}`;
        try {
            const response = yield axios_1.default.get(url);
            if (response.data && response.data.balances) {
                for (const balance of response.data.balances) {
                    if (balance.symbol === tokenContractAddress) {
                        return parseFloat(balance.free);
                    }
                }
            }
            throw new Error(`Failed to fetch ${tokenContractAddress} balance`);
        }
        catch (error) {
            console.error(`Error fetching ${tokenContractAddress} balance:`, error);
            throw error;
        }
    });
}
exports.getBep2TokenBalance = getBep2TokenBalance;
function getErc20TokenBalance(address, jsonRpcUrl, tokenContractAddress) {
    return __awaiter(this, void 0, void 0, function* () {
        const web3 = new web3_1.default(jsonRpcUrl);
        const tokenContract = new web3.eth.Contract(erc20Abi, tokenContractAddress);
        try {
            const decimals = yield tokenContract.methods.decimals().call();
            const balance = yield tokenContract.methods.balanceOf(address).call();
            const divisor = new bignumber_js_1.default(10).pow(decimals);
            return new bignumber_js_1.default(balance).dividedBy(divisor).toNumber();
        }
        catch (error) {
            console.error(`Error getting ERC20 token balance for address ${address}:`, error);
            throw error;
        }
    });
}
exports.getErc20TokenBalance = getErc20TokenBalance;
// export async function getErc20TokenBalance(address: string, jsonRpcUrl: string, tokenContractAddress: string): Promise < number > {
//     const web3 = new Web3(jsonRpcUrl);
//     const tokenContract = new web3.eth.Contract(erc20Abi, tokenContractAddress);
//     try {
//         const balance = await tokenContract.methods.balanceOf(address).call();
//         return parseFloat(web3.utils.fromWei(balance, 'ether'));
//     } catch (error) {
//         console.error(`Error fetching ERC20 balance for address $ {address}:` , error);
//         throw error;
//     }
// }
