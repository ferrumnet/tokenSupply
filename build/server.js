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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// src/server.ts
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const bignumber_js_1 = __importDefault(require("bignumber.js"));
const getSupplyAcrossNetworks_1 = require("./getSupplyAcrossNetworks");
const config_1 = require("./config");
const cacheMiddleware_1 = __importDefault(require("./cacheMiddleware"));
const dotenv_1 = require("dotenv");
const cors_1 = __importDefault(require("cors"));
(0, dotenv_1.config)();
const app = (0, express_1.default)();
const port = process.env.PORT || 8080;
const cacheDuration = Number(process.env.CACHE_DURATION || 300);
app.use(body_parser_1.default.json());
app.use((0, cors_1.default)());
app.get("/totalSupplyAcrossNetworks", (0, cacheMiddleware_1.default)(cacheDuration), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { tokenContractAddress, chainId } = req.query;
        if (typeof tokenContractAddress !== 'string' || typeof chainId !== 'string') {
            res.status(400).json({ error: 'Both tokenContractAddress and chainId must be provided as query parameters.' });
            return;
        }
        const { networks, currencyId } = yield (0, config_1.getNetworkConfigurations)(tokenContractAddress, Number(chainId));
        const totalSupplyData = yield (0, getSupplyAcrossNetworks_1.getTotalSupplyAcrossNetworks)(networks);
        res.json(totalSupplyData);
    }
    catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching the total supply.' });
    }
}));
app.get('/totalSupply', (0, cacheMiddleware_1.default)(cacheDuration), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { tokenContractAddress, chainId } = req.query;
        if (typeof tokenContractAddress !== 'string' || typeof chainId !== 'string') {
            res.status(400).json({ error: 'Both tokenContractAddress and chainId must be provided as query parameters.' });
            return;
        }
        const { networks, currencyId } = yield (0, config_1.getNetworkConfigurations)(tokenContractAddress, Number(chainId));
        const totalSupplyData = yield (0, getSupplyAcrossNetworks_1.getTotalSupplyAcrossNetworks)(networks);
        res.send(totalSupplyData.total);
    }
    catch (error) {
        console.error('Error getting total supply:', error);
        res.status(500).send('Error getting total supply');
    }
}));
app.get("/nonCirculatingSupplyAddresses", (0, cacheMiddleware_1.default)(cacheDuration), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { tokenContractAddress, chainId } = req.query;
    if (typeof tokenContractAddress !== 'string' || typeof chainId !== 'string') {
        res.status(400).json({ error: 'Both tokenContractAddress and chainId must be provided as query parameters.' });
        return;
    }
    const { networks, currencyId } = yield (0, config_1.getNetworkConfigurations)(tokenContractAddress, Number(chainId));
    const nonCirculatingSupplyAddressConfigurations = yield (0, config_1.getNonCirculatingSupplyAddressConfigurations)(tokenContractAddress, Number(chainId), currencyId);
    // Remove jsonRpcUrl from the response
    const filteredResponse = nonCirculatingSupplyAddressConfigurations.map((_a) => {
        var { jsonRpcUrl } = _a, rest = __rest(_a, ["jsonRpcUrl"]);
        return rest;
    });
    res.json(filteredResponse);
}));
app.get('/nonCirculatingSupplyBalancesByAddress', (0, cacheMiddleware_1.default)(cacheDuration), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { tokenContractAddress, chainId } = req.query;
        if (typeof tokenContractAddress !== 'string' || typeof chainId !== 'string') {
            res.status(400).json({ error: 'Both tokenContractAddress and chainId must be provided as query parameters.' });
            return;
        }
        const { networks, currencyId } = yield (0, config_1.getNetworkConfigurations)(tokenContractAddress, Number(chainId));
        const nonCirculatingSupplyBalances = yield (0, getSupplyAcrossNetworks_1.getNonCirculatingSupplyBalances)(tokenContractAddress, Number(chainId), currencyId);
        res.json(nonCirculatingSupplyBalances);
    }
    catch (error) {
        console.error('Error fetching non-circulating supply balances:', error);
        res.status(500).json({ error: 'Failed to fetch non-circulating supply balances' });
    }
}));
app.get('/nonCirculatingSupplyBalance', (0, cacheMiddleware_1.default)(cacheDuration), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { tokenContractAddress, chainId } = req.query;
        if (typeof tokenContractAddress !== 'string' || typeof chainId !== 'string') {
            res.status(400).json({ error: 'Both tokenContractAddress and chainId must be provided as query parameters.' });
            return;
        }
        const { networks, currencyId } = yield (0, config_1.getNetworkConfigurations)(tokenContractAddress, Number(chainId));
        const { balances } = yield (0, getSupplyAcrossNetworks_1.getNonCirculatingSupplyBalances)(tokenContractAddress, Number(chainId), currencyId);
        const totalBalance = balances.reduce((sum, balance) => sum.plus(balance.balance), new bignumber_js_1.default(0));
        res.send(totalBalance.toString());
    }
    catch (error) {
        console.error('Error fetching non-circulating supply balances:', error);
        res.status(500).json({ error: 'Failed to fetch non-circulating supply balances' });
    }
}));
app.get('/circulatingSupplyBalance', (0, cacheMiddleware_1.default)(cacheDuration), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { tokenContractAddress, chainId } = req.query;
        if (typeof tokenContractAddress !== 'string' || typeof chainId !== 'string') {
            res.status(400).json({ error: 'Both tokenContractAddress and chainId must be provided as query parameters.' });
            return;
        }
        const { networks, currencyId } = yield (0, config_1.getNetworkConfigurations)(tokenContractAddress, Number(chainId));
        const totalSupplyData = yield (0, getSupplyAcrossNetworks_1.getTotalSupplyAcrossNetworks)(networks);
        const totalSupply = new bignumber_js_1.default(totalSupplyData.total);
        const { balances } = yield (0, getSupplyAcrossNetworks_1.getNonCirculatingSupplyBalances)(tokenContractAddress, Number(chainId), currencyId);
        const nonCirculatingSupply = balances.reduce((sum, balance) => sum.plus(balance.balance), new bignumber_js_1.default(0));
        const circulatingSupply = totalSupply.minus(nonCirculatingSupply);
        res.send(circulatingSupply.toString());
    }
    catch (error) {
        console.error('Error fetching circulating supply balance:', error);
        res.status(500).json({ error: 'Failed to fetch circulating supply balance' });
    }
}));
app.get('/getTokenContractAddresses', (0, cacheMiddleware_1.default)(cacheDuration), (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { tokenContractAddress, chainId } = req.query;
    if (!tokenContractAddress || !chainId) {
        return res.status(400).json({ error: 'Both tokenContractAddress and chainId are required.' });
    }
    try {
        const response = yield (0, config_1.getTokenContractAddresses)(tokenContractAddress, parseInt(chainId));
        return res.json(response);
    }
    catch (error) {
        console.error('Error fetching token contract addresses:', error);
        return res.status(500).json({ error: 'An error occurred while fetching token contract addresses.' });
    }
}));
app.post("/setNonCirculatingSupplyAddressConfigurations", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { currencyId, nonCirculatingSupplyAddresses } = req.body;
        if (!currencyId || !nonCirculatingSupplyAddresses) {
            return res.status(400).json({ error: 'Both currencyId and nonCirculatingSupplyAddresses must be provided in the request body.' });
        }
        const addedDocument = yield (0, config_1.setNonCirculatingSupplyAddressConfigurations)(currencyId, nonCirculatingSupplyAddresses);
        res.status(201).json({ success: true, statusCode: 201, status: 'Created', addedDocument });
    }
    catch (error) {
        console.error("Error setting non-circulating supply address configurations:", error);
        if (error instanceof Error) {
            if (error.message.includes("Non-Circulating Supply Addresses have already been configured")) {
                res.status(409).json({ error: error.message });
            }
            else {
                res.status(500).json({ error: "An error occurred while setting non-circulating supply address configurations." });
            }
        }
        else {
            res.status(500).json({ error: "An error occurred while setting non-circulating supply address configurations." });
        }
    }
}));
app.put('/updateNonCirculatingSupplyAddressConfigurations', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { currencyId, nonCirculatingSupplyAddresses } = req.body;
        const updatedConfig = yield (0, config_1.updateNonCirculatingSupplyAddressConfigurations)(currencyId, nonCirculatingSupplyAddresses);
        res.status(200).json(updatedConfig);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        }
        else {
            res.status(400).json({ error: 'An unexpected error occurred' });
        }
    }
}));
app.get('/nonCirculatingSupplyAddressConfig', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { tokenContractAddress, chainId } = req.query;
        // Validate the input
        if (!tokenContractAddress || !chainId) {
            return res.status(400).json({ error: 'tokenContractAddress and chainId are required' });
        }
        const nonCirculatingSupplyAddresses = yield (0, config_1.getNonCirculatingSupplyAddressConfigurationsByTokenAndChain)(tokenContractAddress, parseInt(chainId, 10));
        res.status(200).json(nonCirculatingSupplyAddresses);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(400).json({ error: error.message });
        }
        else {
            res.status(400).json({ error: 'An unexpected error occurred' });
        }
    }
}));
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
