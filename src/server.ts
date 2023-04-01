// src/server.ts
import express, { Request, Response, NextFunction } from "express";
import bodyParser from 'body-parser';
import BigNumber from "bignumber.js";
import { getTotalSupplyAcrossNetworks, getNonCirculatingSupplyBalances } from "./getSupplyAcrossNetworks";
import { getNetworkConfigurations, getNonCirculatingSupplyAddressConfigurations } from "./config";
import { NonCirculatingSupplyBalance } from './types';
import cacheMiddleware from './cacheMiddleware';
import { config } from 'dotenv';

config();

const app = express();
const port = process.env.PORT || 8080;
const cacheDuration = Number(process.env.CACHE_DURATION || 300);


app.use(bodyParser.json());

app.get("/totalSupplyAcrossNetworks", cacheMiddleware(cacheDuration), async (req, res) => {
  try {
    const { tokenContractAddress, chainId } = req.query;

    if (typeof tokenContractAddress !== 'string' || typeof chainId !== 'string') {
      res.status(400).json({ error: 'Both tokenContractAddress and chainId must be provided as query parameters.' });
      return;
    }

    const { networks, currencyId } = await getNetworkConfigurations(tokenContractAddress, Number(chainId));
    const totalSupplyData = await getTotalSupplyAcrossNetworks(networks);
    res.json(totalSupplyData);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching the total supply.' });
  }
});

app.get('/totalSupply', cacheMiddleware(cacheDuration), async (req, res) => {
  try {
    const { tokenContractAddress, chainId } = req.query;

    if (typeof tokenContractAddress !== 'string' || typeof chainId !== 'string') {
      res.status(400).json({ error: 'Both tokenContractAddress and chainId must be provided as query parameters.' });
      return;
    }

    const { networks, currencyId } = await getNetworkConfigurations(tokenContractAddress, Number(chainId));
    const totalSupplyData = await getTotalSupplyAcrossNetworks(networks);
    res.send(totalSupplyData.total);
  } catch (error) {
    console.error('Error getting total supply:', error);
    res.status(500).send('Error getting total supply');
  }
});

app.get("/nonCirculatingSupplyAddresses", cacheMiddleware(cacheDuration), async (req, res) => {
  const { tokenContractAddress, chainId } = req.query;

  if (typeof tokenContractAddress !== 'string' || typeof chainId !== 'string') {
    res.status(400).json({ error: 'Both tokenContractAddress and chainId must be provided as query parameters.' });
    return;
  }
  const { networks, currencyId } = await getNetworkConfigurations(tokenContractAddress, Number(chainId));
  const nonCirculatingSupplyAddressConfigurations = await getNonCirculatingSupplyAddressConfigurations(tokenContractAddress, Number(chainId), currencyId);

  // Remove jsonRpcUrl from the response
  const filteredResponse = nonCirculatingSupplyAddressConfigurations.map(({ jsonRpcUrl, ...rest }) => rest);

  res.json(filteredResponse);
});


app.get('/nonCirculatingSupplyBalancesByAddress', cacheMiddleware(cacheDuration), async (req, res) => {
  try {
    const { tokenContractAddress, chainId } = req.query;

    if (typeof tokenContractAddress !== 'string' || typeof chainId !== 'string') {
      res.status(400).json({ error: 'Both tokenContractAddress and chainId must be provided as query parameters.' });
      return;
    }
    const { networks, currencyId } = await getNetworkConfigurations(tokenContractAddress, Number(chainId));
    const nonCirculatingSupplyBalances = await getNonCirculatingSupplyBalances(tokenContractAddress, Number(chainId), currencyId);
    res.json(nonCirculatingSupplyBalances);
  } catch (error) {
    console.error('Error fetching non-circulating supply balances:', error);
    res.status(500).json({ error: 'Failed to fetch non-circulating supply balances' });
  }
});


app.get('/nonCirculatingSupplyBalance', cacheMiddleware(cacheDuration), async (req, res) => {
  try {
    const { tokenContractAddress, chainId } = req.query;

    if (typeof tokenContractAddress !== 'string' || typeof chainId !== 'string') {
      res.status(400).json({ error: 'Both tokenContractAddress and chainId must be provided as query parameters.' });
      return;
    }
    const { networks, currencyId } = await getNetworkConfigurations(tokenContractAddress, Number(chainId));
    const { balances }: { balances: NonCirculatingSupplyBalance[] } = await getNonCirculatingSupplyBalances(tokenContractAddress, Number(chainId), currencyId);
    const totalBalance = balances.reduce((sum, balance) => sum.plus(balance.balance), new BigNumber(0));
    res.send(totalBalance.toString());
  } catch (error) {
    console.error('Error fetching non-circulating supply balances:', error);
    res.status(500).json({ error: 'Failed to fetch non-circulating supply balances' });
  }
});


app.get('/circulatingSupplyBalance', cacheMiddleware(cacheDuration), async (req, res) => {
  try {
    const { tokenContractAddress, chainId } = req.query;

    if (typeof tokenContractAddress !== 'string' || typeof chainId !== 'string') {
      res.status(400).json({ error: 'Both tokenContractAddress and chainId must be provided as query parameters.' });
      return;
    }

    const { networks, currencyId } = await getNetworkConfigurations(tokenContractAddress, Number(chainId));
    const totalSupplyData = await getTotalSupplyAcrossNetworks(networks);
    const totalSupply = new BigNumber(totalSupplyData.total);
    const { balances }: { balances: NonCirculatingSupplyBalance[] } = await getNonCirculatingSupplyBalances(tokenContractAddress, Number(chainId), currencyId);
    const nonCirculatingSupply = balances.reduce((sum, balance) => sum.plus(balance.balance), new BigNumber(0));

    const circulatingSupply = totalSupply.minus(nonCirculatingSupply);
    res.send(circulatingSupply.toString());
  } catch (error) {
    console.error('Error fetching circulating supply balance:', error);
    res.status(500).json({ error: 'Failed to fetch circulating supply balance' });
  }
});


app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
