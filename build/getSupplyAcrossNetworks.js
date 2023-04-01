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
exports.getTotalSupplyAcrossNetworks = exports.getNonCirculatingSupplyBalances = void 0;
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const web3_1 = __importDefault(require("web3"));
const erc20Abi_json_1 = __importDefault(require("./erc20Abi.json"));
const config_1 = require("./config");
const utils_1 = require("./utils");
const erc20Abi = erc20Abi_json_1.default;
function getNonCirculatingSupplyBalances(tokenContractAddress, chainId, currencyId) {
    return __awaiter(this, void 0, void 0, function* () {
        const nonCirculatingSupplyBalances = [];
        let total = new bignumber_js_1.default(0);
        for (const { chainId: currentChainId, address, jsonRpcUrl, tokenContractAddress: currentTokenContractAddress, name, } of yield (0, config_1.getNonCirculatingSupplyAddressConfigurations)(tokenContractAddress, chainId, currencyId)) {
            let balance;
            if (currentChainId === "bnbBeaconChain") {
                balance = new bignumber_js_1.default(yield (0, utils_1.getBep2TokenBalance)(address, jsonRpcUrl, currentTokenContractAddress));
            }
            else {
                balance = new bignumber_js_1.default(yield (0, utils_1.getErc20TokenBalance)(address, jsonRpcUrl, currentTokenContractAddress));
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
    });
}
exports.getNonCirculatingSupplyBalances = getNonCirculatingSupplyBalances;
const getTotalSupplyAcrossNetworks = (networks) => __awaiter(void 0, void 0, void 0, function* () {
    const supplyPerNetwork = {};
    let totalSupply = new bignumber_js_1.default(0);
    for (const network in networks) {
        const config = networks[network];
        const web3 = new web3_1.default(config.jsonRpcUrl);
        const tokenContract = new web3.eth.Contract(erc20Abi, config.tokenContractAddress);
        try {
            const [supply, decimals] = yield Promise.all([
                tokenContract.methods.totalSupply().call(),
                tokenContract.methods.decimals().call(),
            ]);
            const supplyBN = new bignumber_js_1.default(supply);
            const decimalsBN = new bignumber_js_1.default(10).pow(decimals);
            const supplyInEther = supplyBN.div(decimalsBN);
            totalSupply = totalSupply.plus(supplyInEther);
            supplyPerNetwork[network] = supplyInEther.toFixed(18);
        }
        catch (error) {
            console.error(`Error getting total supply for ${network}:`, error.message);
        }
    }
    return Object.assign(Object.assign({}, supplyPerNetwork), { total: totalSupply.toFixed(18) });
});
exports.getTotalSupplyAcrossNetworks = getTotalSupplyAcrossNetworks;
