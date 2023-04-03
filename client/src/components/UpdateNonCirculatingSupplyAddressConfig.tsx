// ./client/src/components/UpdateNonCirculatingSupplyAddressConfig.tsx
import React, { ChangeEvent, useState } from 'react';
import axios from 'axios';
import { Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, TextField, Box, Typography, Paper } from '@mui/material';

import Web3 from 'web3';

const apiUrl = process.env.REACT_APP_API_URL || '';
const UpdateNonCirculatingSupplyAddressConfig: React.FC = () => {
    const [tokenContractAddress, setTokenContractAddress] = useState('');
    const [tokenContractAddressError, setTokenContractAddressError] = useState<string | null>(null);
    const [chainId, setChainId] = useState('');
    const [addressErrors, setAddressErrors] = useState<(string | null)[]>([]);
    const [config, setConfig] = useState<any>(null);
    const [showConfigForm, setShowConfigForm] = useState(true);

    const fetchConfig = async () => {
        try {
            const response = await axios.get(`${apiUrl}/nonCirculatingSupplyAddressConfig`, {
                params: { tokenContractAddress, chainId },
            });
            setConfig(response.data);
            setShowConfigForm(false);
        } catch (error) {
            console.error('Error fetching the config:', error);
        }
    };

    const handleTokenContractAddressChange = (e: ChangeEvent<HTMLInputElement>) => {
        const newAddress = e.target.value.trim().toLowerCase();
        setTokenContractAddress(newAddress);
        setTokenContractAddressError(Web3.utils.isAddress(newAddress) ? null : 'Invalid EVM address');
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const newConfig = { ...config };
        newConfig.nonCirculatingSupplyAddresses[index].name = e.target.value;
        setConfig(newConfig);
    };

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const newAddress = e.target.value.trim().toLowerCase();
        const newConfig = { ...config };
        newConfig.nonCirculatingSupplyAddresses[index].address = newAddress;
        setConfig(newConfig);

        const newErrors = [...addressErrors];
        newErrors[index] = Web3.utils.isAddress(newAddress) ? null : 'Invalid EVM address';
        setAddressErrors(newErrors);
    };

    const handleChainIdChange = (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
        const newConfig = { ...config };
        newConfig.nonCirculatingSupplyAddresses[index].chainId = e.target.value;
        setConfig(newConfig);
    };

    const handleRemoveRow = (index: number) => {
        const newConfig = { ...config };
        newConfig.nonCirculatingSupplyAddresses.splice(index, 1);
        setConfig(newConfig);
    };

    const handleAddRow = () => {
        const newConfig = { ...config };
        newConfig.nonCirculatingSupplyAddresses.push({
            name: '',
            address: '',
            chainId: '',
        });
        setConfig(newConfig);

        // Add a new error for the new row
        setAddressErrors([...addressErrors, '']);
    };


    const handleUpdateNonCirculatingSupplyAddressConfig = async () => {
        try {
            await axios.put(`${apiUrl}/updateNonCirculatingSupplyAddressConfigurations`, {
                currencyId: config.currency,
                nonCirculatingSupplyAddresses: config.nonCirculatingSupplyAddresses,
            });
            alert('Successfully updated non-circulating supply address config');
        } catch (error) {
            console.error('Error updating the config:', error);
        }
    };

    return (
        <Box>
            <Typography variant="h5" component="h2" gutterBottom>
                Update Non-Circulating Supply Address Configuration
            </Typography>
            {showConfigForm ? (
                <Box display="flex" flexDirection="column" gap={2}>
                    <TextField
                        fullWidth
                        label="Token Contract Address"
                        value={tokenContractAddress}
                        onChange={handleTokenContractAddressChange}
                        error={Boolean(tokenContractAddressError)}
                        helperText={tokenContractAddressError}
                    />
                    <TextField
                        fullWidth
                        label="Chain ID"
                        value={chainId}
                        onChange={(e) => setChainId(e.target.value)}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={fetchConfig}
                        disabled={Boolean(tokenContractAddressError) || !tokenContractAddress || !chainId}
                    >
                        Get Non-Circulating Supply Address Config
                    </Button>
                </Box>
            ) : (
                <Typography variant="subtitle1" gutterBottom>
                    Non-Circulating Supply Addresses for Token Contract Address: {tokenContractAddress} and Chain ID: {chainId}
                </Typography>
            )}
            {!showConfigForm && config && (
                <Box mt={4}>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Address</TableCell>
                                    <TableCell>Chain ID</TableCell>
                                    <TableCell>Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {config.nonCirculatingSupplyAddresses.map((row: any, index: number) => (
                                    <TableRow key={index}>
                                        <TableCell>
                                            <TextField
                                                value={row.name}
                                                onChange={(e: ChangeEvent<HTMLInputElement>) => handleNameChange(e, index)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                value={row.address}
                                                error={Boolean(addressErrors[index])}
                                                helperText={addressErrors[index]}
                                                onChange={(e: ChangeEvent<HTMLInputElement>) => handleAddressChange(e, index)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <TextField
                                                value={row.chainId}
                                                onChange={(e: ChangeEvent<HTMLInputElement>) => handleChainIdChange(e, index)}
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Button onClick={() => handleRemoveRow(index)}>Remove</Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                    <Box mt={2} display="flex" flexDirection="column" gap={2}>
                        <Button
                            variant="contained"
                            color="secondary"
                            onClick={handleAddRow}
                        >
                            Add Row
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleUpdateNonCirculatingSupplyAddressConfig}
                            disabled={
                                addressErrors.some((error) => error !== null && error !== '') ||
                                config.nonCirculatingSupplyAddresses.some(
                                    (row: any) => !row.name || !row.address || !row.chainId
                                )
                            }
                        >
                            Update Non-Circulating Supply Addresses
                        </Button>
                    </Box>
                </Box>
            )}
        </Box>
    );
};

export default UpdateNonCirculatingSupplyAddressConfig;
