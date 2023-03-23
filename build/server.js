"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const getSupplyAcrossNetworks_1 = require("./getSupplyAcrossNetworks");
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use(body_parser_1.default.json());
app.get('/totalSupplyAcrossNetworks', async (req, res) => {
    try {
        const totalSupply = await (0, getSupplyAcrossNetworks_1.getTotalSupplyAcrossNetworks)();
        res.json({ totalSupply });
    }
    catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching the total supply.' });
    }
});
app.get('/totalSupply', async (req, res) => {
    try {
        const { total } = await (0, getSupplyAcrossNetworks_1.getTotalSupplyAcrossNetworks)();
        res.send(total);
    }
    catch (error) {
        console.error('Error getting total supply:', error);
        res.status(500).send('Error getting total supply');
    }
});
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
