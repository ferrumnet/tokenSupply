// ./client/src/App.tsx
import React from 'react';
import axios from 'axios';
import { Container, TextField, Button, Box, Typography } from '@mui/material';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Home from './components/Home';
import './App.css';
import SetupTokenSupply from './components/SetupTokenSupply';
import UpdateNonCirculatingSupplyAddressConfig from './components/UpdateNonCirculatingSupplyAddressConfig';
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';

function App() {
  return (
    <ThemeProvider theme={theme}> {/* Wrap BrowserRouter with ThemeProvider */}
      <BrowserRouter>
        <Container>
          <Box my={4}>
            <Typography variant="h4" component="h1" gutterBottom>
              Token Supply Management
            </Typography>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/setupTokenSupply" element={<SetupTokenSupply />} />
              <Route path="/updateNonCirculatingSupplyAddressConfig" element={<UpdateNonCirculatingSupplyAddressConfig />} />
            </Routes>
          </Box>
        </Container>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default App;
