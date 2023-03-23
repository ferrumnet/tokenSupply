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
const express_1 = __importDefault(require("express"));
const body_parser_1 = __importDefault(require("body-parser"));
const getSupplyAcrossNetworks_1 = require("./getSupplyAcrossNetworks");
const app = (0, express_1.default)();
const port = process.env.PORT || 3000;
app.use(body_parser_1.default.json());
app.get('/totalSupplyAcrossNetworks', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const totalSupply = yield (0, getSupplyAcrossNetworks_1.getTotalSupplyAcrossNetworks)();
        res.json({ totalSupply });
    }
    catch (error) {
        res.status(500).json({ error: 'An error occurred while fetching the total supply.' });
    }
}));
app.get('/totalSupply', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { total } = yield (0, getSupplyAcrossNetworks_1.getTotalSupplyAcrossNetworks)();
        res.send(total);
    }
    catch (error) {
        console.error('Error getting total supply:', error);
        res.status(500).send('Error getting total supply');
    }
}));
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
