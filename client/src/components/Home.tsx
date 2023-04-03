// ./client/src/components/Home.tsx
import React, { ChangeEvent, useState, FormEvent } from 'react';
import { Container, TextField, Button, Box, Typography } from '@mui/material';
import axios from 'axios';

const apiUrl = process.env.REACT_APP_API_URL || '';

function Home() {
  const [tokenContractAddress, setTokenContractAddress] = useState<string>('');
  const [chainId, setChainId] = useState<string>('');
  const [tokenAddresses, setTokenAddresses] = useState<any>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    // Call your API endpoint here
    const response = await getNetworkConfigurations(tokenContractAddress, chainId);
    setTokenAddresses(response);
  };

  const getNetworkConfigurations = async (tokenContractAddress: string, chainId: string) => {
    // Replace this with the actual API endpoint URL
    const networkApiUrl = `${apiUrl}/getTokenContractAddresses?tokenContractAddress=${tokenContractAddress}&chainId=${chainId}`;

    try {
      const response = await axios.get(networkApiUrl);
      return response.data;
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box my={4}>
        <Typography variant="h4" component="h1" gutterBottom>
          Get Token Addresses
        </Typography>
        <form onSubmit={handleSubmit}>
          <TextField
            label="Token Contract Address"
            variant="outlined"
            fullWidth
            value={tokenContractAddress}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setTokenContractAddress(e.target.value)}
            margin="normal"
          />
          <TextField
            label="Chain ID"
            variant="outlined"
            fullWidth
            value={chainId}
            onChange={(e: ChangeEvent<HTMLInputElement>) => setChainId(e.target.value)}
            margin="normal"
          />
          <Button type="submit" variant="contained" color="primary">
            Get Token Addresses
          </Button>
        </form>
        {tokenAddresses && (
          <Box mt={4}>
            <Typography variant="h6">Token Addresses</Typography>
            <pre>{JSON.stringify(tokenAddresses, null, 2)}</pre>
          </Box>
        )}
      </Box>
    </Container>
  );
}

export default Home;
