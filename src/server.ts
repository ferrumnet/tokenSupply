import express from "express";
import bodyParser from 'body-parser';
import { getTotalSupplyAcrossNetworks } from "./getSupplyAcrossNetworks";
import { networks } from "./config";

const app = express();
const port = process.env.PORT || 8080;

app.use(bodyParser.json());

app.get("/totalSupplyAcrossNetworks", async (req, res) => {
  try {
    const totalSupply = await getTotalSupplyAcrossNetworks(networks);
    res.json(totalSupply);
  } catch (error) {
    res.status(500).json({ error: 'An error occurred while fetching the total supply.' });
  }
});

app.get('/totalSupply', async (req, res) => {
  try {
    const { total } = await getTotalSupplyAcrossNetworks(networks);
    res.send(total);
  } catch (error) {
    console.error('Error getting total supply:', error);
    res.status(500).send('Error getting total supply');
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});