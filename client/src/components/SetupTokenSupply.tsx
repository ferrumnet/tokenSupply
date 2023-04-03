// ./client/src/components/SetupTokenSupply.tsx
import React, { useState, FormEvent } from 'react';
import { Box, TextField, Button, Typography, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Checkbox, FormControlLabel } from '@mui/material';
import Web3 from 'web3';



interface PostResponse {
    success: boolean;
    statusCode: number;
    status: string;
    addedDocument: {
        _id: string;
        currency: string;
        nonCirculatingSupplyAddresses: Array<{
            name: string;
            address: string;
            chainId: string;
        }>;
    };
}

const apiUrl = process.env.REACT_APP_API_URL || '';
const web3 = new Web3();



const SetupTokenSupply = () => {
    const [step, setStep] = useState(1);
    const [tokenContractAddress, setTokenContractAddress] = useState("");
    const [chainId, setChainId] = useState("");
    const [tokenDetails, setTokenDetails] = useState<{ currencyId: string; name: string; symbol: string } | null>(null);
    const [tokenAddresses, setTokenAddresses] = useState<Array<{ tokenContractAddress: string; chainId: string; networkName: string }>>([]);
    const [nonCirculatingSupplyAddresses, setNonCirculatingSupplyAddresses] = useState<Array<{ name: string; address: string; chainId: string }>>([{ name: "", address: "", chainId: "" }]);
    const [confirmationChecked, setConfirmationChecked] = useState(false);
    const [addressValidation, setAddressValidation] = useState<Array<boolean>>([true]);
    const [tokenContractAddressValid, setTokenContractAddressValid] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');
    const [postResponse, setPostResponse] = useState<PostResponse>({
        success: false,
        statusCode: 0,
        status: '',
        addedDocument: {
            _id: '',
            currency: '',
            nonCirculatingSupplyAddresses: [],
        },
    });

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();

        const response = await fetch(`${apiUrl}/getTokenContractAddresses?tokenContractAddress=${tokenContractAddress}&chainId=${chainId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        });

        const data = await response.json();

        setTokenDetails(data.tokenDetails);
        setTokenAddresses(data.tokenAddresses);
    };

    const addNonCirculatingSupplyAddress = () => {
        setNonCirculatingSupplyAddresses([...nonCirculatingSupplyAddresses, { name: "", address: "", chainId: "" }]);
    };

    const handleInputChange = (index: number, field: keyof typeof nonCirculatingSupplyAddresses[number], value: string) => {
        const updatedNonCirculatingSupplyAddresses = [...nonCirculatingSupplyAddresses];
        updatedNonCirculatingSupplyAddresses[index][field] = value;
        setNonCirculatingSupplyAddresses(updatedNonCirculatingSupplyAddresses);

        if (field === "address") {
            const updatedAddressValidation = [...addressValidation];
            updatedAddressValidation[index] = isValidEvmAddress(value);
            setAddressValidation(updatedAddressValidation);
        }
    };


    const handleSetNonCirculatingSupplyAddresses = async () => {
        if (tokenDetails && confirmationChecked) {
            const payload = {
                currencyId: tokenDetails.currencyId,
                nonCirculatingSupplyAddresses: nonCirculatingSupplyAddresses.map((address) => ({
                    ...address,
                    address: address.address.toLowerCase(),
                })),
            };

            const response = await fetch(`${apiUrl}/setNonCirculatingSupplyAddressConfigurations`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            const data = await response.json();
            if (response.status === 409) {
                setErrorMessage(data.error);
            } else {
                setErrorMessage('');
                setPostResponse(data);
            }
            console.log(data);
        }
    };


    const proceedToStep2 = () => {
        setStep(2);
        setConfirmationChecked(false);
    };

    const allFieldsFilled = () => {
        return nonCirculatingSupplyAddresses.every(
            (address) => address.name && address.address && address.chainId
        );
    };

    const removeNonCirculatingSupplyAddress = (index: number) => {
        setNonCirculatingSupplyAddresses(
            nonCirculatingSupplyAddresses.filter((_, i) => i !== index)
        );
    };

    const isValidEvmAddress = (address: string) => {
        return web3.utils.isAddress(address);
    };


    return (
        <div>
            <Typography variant="h4" component="h1" gutterBottom>
                Setup Token Supply
            </Typography>
            {step === 1 && (
                <>
                    <Box component="form" onSubmit={handleSubmit} noValidate autoComplete="off">
                        <Box mb={2}>
                            <TextField
                                label="Token Contract Address"
                                value={tokenContractAddress}
                                onChange={(e) => {
                                    setTokenContractAddress(e.target.value);
                                    setTokenContractAddressValid(isValidEvmAddress(e.target.value));
                                }}
                                fullWidth
                                error={!tokenContractAddressValid}
                                helperText={!tokenContractAddressValid ? "Invalid EVM-compatible address" : ""}
                            />
                        </Box>
                        <Box mb={2}>
                            <TextField
                                label="Chain ID"
                                value={chainId}
                                onChange={(e) => setChainId(e.target.value)}
                                fullWidth
                            />
                        </Box>
                        <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            disabled={!tokenContractAddressValid || !chainId}
                        >
                            Get Token Addresses
                        </Button>
                    </Box>
                    {tokenDetails && (
                        <Box mt={4}>
                            <Typography variant="h5" component="h2" gutterBottom>
                                Token Details
                            </Typography>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Currency ID</TableCell>
                                            <TableCell>Name</TableCell>
                                            <TableCell>Symbol</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        <TableRow>
                                            <TableCell>{tokenDetails.currencyId}</TableCell>
                                            <TableCell>{tokenDetails.name}</TableCell>
                                            <TableCell>{tokenDetails.symbol}</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    )}
                    {tokenAddresses.length > 0 && (
                        <Box mt={4}>
                            <Typography variant="h5" component="h2" gutterBottom>
                                Token Addresses
                            </Typography>
                            <TableContainer component={Paper}>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Token Contract Address</TableCell>
                                            <TableCell>Chain ID</TableCell>
                                            <TableCell>Network Name</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {tokenAddresses.map((address, index) => (
                                            <TableRow key={index}>
                                                <TableCell>{address.tokenContractAddress}</TableCell>
                                                <TableCell>{address.chainId}</TableCell>
                                                <TableCell>{address.networkName}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        </Box>
                    )}
                    {tokenDetails && tokenAddresses.length > 0 && (
                        <Box mt={4}>
                            <FormControlLabel
                                control={<Checkbox checked={confirmationChecked} onChange={(e) => setConfirmationChecked(e.target.checked)} />}
                                label="I confirm that the Token Addresses and their Chain Ids are correct."
                            />
                            <Button variant="contained" color="primary" onClick={proceedToStep2} disabled={!confirmationChecked}>
                                Proceed to Step 2: Set Non-Circulating Supply Addresses
                            </Button>
                        </Box>
                    )}
                </>
            )}
            {step === 2 && !postResponse.success && (
                <>
                    <Box mt={4}>
                        <Typography variant="h5" component="h2" gutterBottom>
                            Non-Circulating Supply Addresses
                        </Typography>
                        {nonCirculatingSupplyAddresses.map((address, index) => (
                            <Box key={index} mb={2}>
                                <TextField
                                    label="Name"
                                    value={address.name}
                                    onChange={(e) => handleInputChange(index, "name", e.target.value)}
                                    fullWidth
                                    style={{ marginRight: 16 }}
                                />
                                <TextField
                                    label="Address"
                                    value={address.address}
                                    onChange={(e) => handleInputChange(index, "address", e.target.value)}
                                    fullWidth
                                    style={{ marginRight: 16 }}
                                    error={!addressValidation[index]}
                                    helperText={!addressValidation[index] ? "Invalid EVM-compatible address" : ""}
                                />
                                <TextField
                                    label="Chain ID"
                                    value={address.chainId}
                                    onChange={(e) => handleInputChange(index, "chainId", e.target.value)}
                                    fullWidth
                                />
                                {nonCirculatingSupplyAddresses.length > 1 && (
                                    <Button
                                        variant="contained"
                                        color="secondary"
                                        onClick={() => removeNonCirculatingSupplyAddress(index)}
                                    >
                                        Remove
                                    </Button>
                                )}
                            </Box>
                        ))}
                        <Button variant="contained" color="primary" onClick={addNonCirculatingSupplyAddress}>
                            Add Another Non-Circulating Supply Address
                        </Button>
                    </Box>
                    <Box mt={4}>
                        <FormControlLabel
                            control={<Checkbox checked={confirmationChecked} onChange={(e) => setConfirmationChecked(e.target.checked)} />}
                            label="I confirm that the Non-Circulating Supply Addresses and their Chain Ids are correct."
                        />
                        <Button
                            variant="contained"
                            color="primary"
                            onClick={handleSetNonCirculatingSupplyAddresses}
                            disabled={!confirmationChecked || !allFieldsFilled()}
                        >
                            Set Non-Circulating Supply Addresses
                        </Button>
                    </Box>
                    {errorMessage && (
                        <Box mt={2}>
                            <Typography color="error">{errorMessage}</Typography>
                        </Box>
                    )}
                </>
            )}
            {postResponse.success && (
                <Box mt={4}>
                    <Typography variant="h5" component="h2" gutterBottom>
                        Non-Circulating Supply Addresses Added
                    </Typography>
                    <TableContainer component={Paper}>
                        <Table>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Name</TableCell>
                                    <TableCell>Address</TableCell>
                                    <TableCell>Chain ID</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {postResponse.addedDocument.nonCirculatingSupplyAddresses.map((address, index) => (
                                    <TableRow key={index}>
                                        <TableCell>{address.name}</TableCell>
                                        <TableCell>{address.address}</TableCell>
                                        <TableCell>{address.chainId}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}
        </div>
    );
};

export default SetupTokenSupply;