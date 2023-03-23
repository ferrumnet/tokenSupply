const axios = require('axios');
const BigNumber = require('bignumber.js');
const Web3 = require('web3');

const networks = {
  Ethereum: {
    jsonRpcUrl: 'https://nd-770-685-838.p2pify.com/e30d3ea257d1588823179ce4d5811a61',
    tokenContractAddress: '0xe5caef4af8780e59df925470b050fb23c43ca68c'
  },
  BSC: {
    jsonRpcUrl: 'https://nd-605-906-592.p2pify.com/df9065025f5e18317e708040b1f2ab13',
    tokenContractAddress: '0xa719b8ab7ea7af0ddb4358719a34631bb79d15dc'
  },
  Polygon: {
    jsonRpcUrl: 'https://nd-662-671-431.p2pify.com/72aea5a70bbd5482f9a498540072b1e1',
    tokenContractAddress: '0xd99bafe5031cc8b345cb2e8c80135991f12d7130'
  },
  Arbitrum: {
    jsonRpcUrl: 'https://nd-674-145-610.p2pify.com/bc9acaa6f1386224186fb1e794c40c14',
    tokenContractAddress: '0x9f6abbf0ba6b5bfa27f4deb6597cc6ec20573fda'
  },
  Avalanche: {
    jsonRpcUrl: 'https://nd-900-134-973.p2pify.com/0a4e07e77ebc245f0bf7839745b4803b/ext/bc/C/rpc',
    tokenContractAddress: '0xe5caef4af8780e59df925470b050fb23c43ca68c'
  }
};

const getTotalSupplyAcrossNetworks = async () => {
  let totalSupplyAcrossNetworks = new BigNumber(0);

  for (const [network, { jsonRpcUrl, tokenContractAddress }] of Object.entries(networks)) {
    const web3 = new Web3(jsonRpcUrl);
    const decimalsData = '0x313ce567';
    const totalSupplyData = '0x18160ddd';

    try {
      const decimalsResponse = await web3.eth.call({ to: tokenContractAddress, data: decimalsData });
      const decimals = parseInt(decimalsResponse, 16);

      const totalSupplyResponse = await web3.eth.call({ to: tokenContractAddress, data: totalSupplyData });
      const totalSupply = new BigNumber(totalSupplyResponse).shiftedBy(-decimals);

      console.log(`Network: ${network}`);
      console.log(`Decimals: ${decimals}`);
      // console.log(`Total supply (in tokens): ${totalSupply.toFixed()}`);
      console.log(`Total supply (in Ether Base): ${totalSupply.toFixed(decimals)}`);
      console.log('');

      totalSupplyAcrossNetworks = totalSupplyAcrossNetworks.plus(totalSupply);
    } catch (error) {
      console.error(`Error getting total supply for ${network}:`, error.message);
    }
  }

  console.log(`Total supply across networks (in Ether Base): ${totalSupplyAcrossNetworks.toFixed()}`);
};

getTotalSupplyAcrossNetworks();
