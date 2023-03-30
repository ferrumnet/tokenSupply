TokenSupply App
===============

The TokenSupply App is a simple and efficient solution for calculating the total, circulating, and non-circulating supply of a token across multiple blockchain networks. It provides a set of RESTful API endpoints for querying the token supply data and offers easy integration with other applications or services.

Table of Contents
-----------------

-   [Features](#features)
-   [Getting Started](#getting-started)
    -   [Prerequisites](#prerequisites)
    -   [Installation](#installation)
    -   [Configuration](#configuration)
-   [API Endpoints](#api-endpoints)
-   [Usage Examples](#usage-examples)
-   [Integration](#integration)
-   [Troubleshooting and FAQ](#troubleshooting-and-faq)
-   [Contributing](#contributing)
-   [License](#license)



Features
--------

-   Supports multiple blockchain networks
-   Calculates total, circulating, and non-circulating token supply
-   Provides RESTful API endpoints
-   Easy to integrate with other applications or services
-   Highly configurable

Getting Started
---------------

### Prerequisites

-   [Node.js](https://nodejs.org/en/) (v14.x or later)
-   [npm](https://www.npmjs.com/) (v6.x or later)

### Installation

1.  Clone the repository:

```bash
git clone https://github.com/ferrumnet/tokenSupply.git
```

2.  Change to the project directory:

```bash
cd TokenSupply
```

3.  Install the dependencies:

```bash
npm install
```

4.  Start the server:
```bash
npm start
```
The server will start, and you'll see a message indicating the port it is listening on (default is 8080).

### Configuration

To configure the TokenSupply app, update the `config.ts` file with the appropriate network configurations, token contract addresses, and non-circulating supply addresses.

Example configuration:

```typescript
export const getNetworkConfigurations = async () => {
  return [
    {
      networkName: 'Ethereum',
      rpcUrl: 'https://mainnet.infura.io/v3/YOUR_API_KEY',
      tokenContractAddress: '0x1234567890abcdef',
    },
    // Add more networks here...
  ];
};

export const nonCirculatingSupplyAddressesConfig = [
  {
    name: "Deployer",
    address: "0xc2fdcb728170192c72ada2c08957f2e9390076b7",
    tokenContractAddress: "0xe5caef4af8780e59df925470b050fb23c43ca68c",
    jsonRpcUrl: "https://nd-770-685-838.p2pify.com/e30d3ea257d1588823179ce4d5811a61",
    chainId: "1"
  },
  // Add more addresses here...
];
```

API Endpoints
-------------

The TokenSupply app provides the following API endpoints:

-   `/totalSupplyAcrossNetworks`: Fetches the total supply of the token across all networks.
-   `/totalSupply`: Fetches the total token supply.
-   `/nonCirculatingSupplyAddresses`: Lists the non-circulating supply addresses.
-   `/nonCirculatingSupplyBalancesByAddress`: Fetches the non-circulating supply balances for each address.
-   `/nonCirculatingSupplyBalance`: Fetches the total non-circulating supply balance.
-   `/circulatingSupplyBalance`: Fetches the total circulating supply balance.

For more information on these endpoints, visit the [API Endpoints](https://docs.ferrumnetwork.io/ferrum-network-ecosystem/v/tokensupply-app/api-endpoints) page in the GitBook documentation.

Usage Examples
--------------

Here are some example requests using `curl`:

```bash
# Fetch the total supply across all networks
curl http://localhost:8080/totalSupplyAcrossNetworks

# Fetch the total token supply
curl http://localhost:8080/totalSupply

# List non-circulating supply addresses
curl http://localhost:8080/nonCirculatingSupplyAddresses

# Fetch non-circulating supply balances by address
curl http://localhost:8080/nonCirculatingSupplyBalancesByAddress

# Fetch the total non-circulating supply balance
curl http://localhost:8080/nonCirculatingSupplyBalance

# Fetch the total circulating supply balance
curl http://localhost:8080/circulatingSupplyBalance
```

Integration
-----------

To integrate the TokenSupply app with your existing applications or services, simply call the desired API endpoints from your code, as demonstrated in the [Usage Examples](https://docs.ferrumnetwork.io/ferrum-network-ecosystem/v/tokensupply-app/usage-examples) section of the GitBook documentation.

Troubleshooting and FAQ
-----------------------

For common issues, troubleshooting tips, and frequently asked questions, please refer to the [Troubleshooting and FAQ](https://docs.ferrumnetwork.io/ferrum-network-ecosystem/v/tokensupply-app/troubleshooting-and-faq) page in the GitBook documentation.

Contributing
------------

Contributions are always welcome! If you'd like to contribute, please follow the standard GitHub flow:

1.  Fork the repository.
2.  Create a branch for your changes.
3.  Make your changes and commit them to your branch.
4.  Create a pull request to merge your changes into the main repository
5.  Wait for the project maintainers to review and approve your changes.

Before submitting a pull request, please ensure your code follows the project's coding style, is well-documented, and passes all tests. Additionally, update the documentation and tests as needed to reflect your changes.

License
-------

The TokenSupply app is released under the [MIT License](https://opensource.org/license/mit/). By using or contributing to this project, you agree to the terms of this license.

Support
-------

If you encounter any issues or have questions about the TokenSupply app, feel free to open an issue on GitHub

* * * * *

With the TokenSupply app, you can quickly and easily access token supply data across multiple blockchain networks. Get started today and enjoy the benefits of this powerful tool in your projects.
