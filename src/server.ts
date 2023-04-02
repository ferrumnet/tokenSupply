// src/server.ts
import express, { Request, Response, NextFunction } from "express";
import bodyParser from 'body-parser';
import BigNumber from "bignumber.js";
import { getTotalSupplyAcrossNetworks, getNonCirculatingSupplyBalances } from "./getSupplyAcrossNetworks";
import {
  getNetworkConfigurations,
  getNonCirculatingSupplyAddressConfigurations,
  getTokenContractAddresses,
  setNonCirculatingSupplyAddressConfigurations,
  updateNonCirculatingSupplyAddressConfigurations,
  getNonCirculatingSupplyAddressConfigurationsByTokenAndChain
} from "./config";
import { NonCirculatingSupplyBalance } from './types';
import cacheMiddleware from './cacheMiddleware';
import { config } from 'dotenv';
import cors from 'cors';

config();

const app = express();
const port = process.env.PORT || 8080;
const cacheDuration = Number(process.env.CACHE_DURATION || 300);


app.use(bodyParser.json());
app.use(cors());

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

app.get('/getTokenContractAddresses', cacheMiddleware(cacheDuration), async (req, res) => {
  const { tokenContractAddress, chainId } = req.query;

  if (!tokenContractAddress || !chainId) {
    return res.status(400).json({ error: 'Both tokenContractAddress and chainId are required.' });
  }

  try {
    const response = await getTokenContractAddresses(tokenContractAddress as string, parseInt(chainId as string));
    return res.json(response);
  } catch (error) {
    console.error('Error fetching token contract addresses:', error);
    return res.status(500).json({ error: 'An error occurred while fetching token contract addresses.' });
  }
});

app.post("/setNonCirculatingSupplyAddressConfigurations", async (req: Request, res: Response) => {
  try {
    const { currencyId, nonCirculatingSupplyAddresses } = req.body;

    if (!currencyId || !nonCirculatingSupplyAddresses) {
      return res.status(400).json({ error: 'Both currencyId and nonCirculatingSupplyAddresses must be provided in the request body.' });
    }

    const addedDocument = await setNonCirculatingSupplyAddressConfigurations(currencyId, nonCirculatingSupplyAddresses);
    res.status(201).json({ success: true, statusCode: 201, status: 'Created', addedDocument });
  } catch (error) {
    console.error("Error setting non-circulating supply address configurations:", error);

    if (error instanceof Error) {
      if (error.message.includes("Non-Circulating Supply Addresses have already been configured")) {
        res.status(409).json({ error: error.message });
      } else {
        res.status(500).json({ error: "An error occurred while setting non-circulating supply address configurations." });
      }
    } else {
      res.status(500).json({ error: "An error occurred while setting non-circulating supply address configurations." });
    }
  }
});

app.put('/updateNonCirculatingSupplyAddressConfigurations', async (req, res) => {
  try {
    const { currencyId, nonCirculatingSupplyAddresses } = req.body;
    const updatedConfig = await updateNonCirculatingSupplyAddressConfigurations(currencyId, nonCirculatingSupplyAddresses);
    res.status(200).json(updatedConfig);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: 'An unexpected error occurred' });
    }
  }
});

app.get('/nonCirculatingSupplyAddressConfig', async (req, res) => {
  try {
    const { tokenContractAddress, chainId } = req.query;

    // Validate the input
    if (!tokenContractAddress || !chainId) {
      return res.status(400).json({ error: 'tokenContractAddress and chainId are required' });
    }

    const nonCirculatingSupplyAddresses = await getNonCirculatingSupplyAddressConfigurationsByTokenAndChain(tokenContractAddress as string, parseInt(chainId as string, 10));
    res.status(200).json(nonCirculatingSupplyAddresses);
  } catch (error) {
    if (error instanceof Error) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(400).json({ error: 'An unexpected error occurred' });
    }
  }
});



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
