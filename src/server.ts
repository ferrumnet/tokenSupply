// src/server.ts
import express from "express";
import bodyParser from 'body-parser';
import BigNumber from "bignumber.js";
import { getTotalSupplyAcrossNetworks, getNonCirculatingSupplyBalances } from "./getSupplyAcrossNetworks";
import { getNetworkConfigurations, nonCirculatingSupplyAddressesConfig } from "./config";
import { NonCirculatingSupplyBalance } from './types';



const app = express();
const port = process.env.PORT || 8080;

app.use(bodyParser.json());

app.get("/totalSupplyAcrossNetworks", async (req, res) => {
  try {
    const networks = await getNetworkConfigurations();
    const totalSupplyData = await getTotalSupplyAcrossNetworks(networks);
    res.json(totalSupplyData);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching the total supply.' });
  }
});

app.get('/totalSupply', async (req, res) => {
  try {
    const networks = await getNetworkConfigurations();
    const totalSupplyData = await getTotalSupplyAcrossNetworks(networks);
    res.send(totalSupplyData.total);
  } catch (error) {
    console.error('Error getting total supply:', error);
    res.status(500).send('Error getting total supply');
  }
});

app.get("/nonCirculatingSupplyAddresses", (req, res) => {
  res.json(nonCirculatingSupplyAddressesConfig);
});

app.get('/nonCirculatingSupplyBalancesByAddress', async (req, res) => {
  try {
    const nonCirculatingSupplyBalances = await getNonCirculatingSupplyBalances();
    res.json(nonCirculatingSupplyBalances);
  } catch (error) {
    console.error('Error fetching non-circulating supply balances:', error);
    res.status(500).json({ error: 'Failed to fetch non-circulating supply balances' });
  }
});

app.get('/nonCirculatingSupplyBalance', async (req, res) => {
  try {
    const { balances }: { balances: NonCirculatingSupplyBalance[] } = await getNonCirculatingSupplyBalances();
    const totalBalance = balances.reduce((sum, balance) => sum.plus(balance.Balance), new BigNumber(0));
    res.send(totalBalance.toString());
  } catch (error) {
    console.error('Error fetching non-circulating supply balances:', error);
    res.status(500).json({ error: 'Failed to fetch non-circulating supply balances' });
  }
});



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
