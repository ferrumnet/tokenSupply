import { AbiItem } from "web3-utils";
import BigNumber from "bignumber.js";
import Web3 from "web3";

interface NetworkConfiguration {
  jsonRpcUrl: string;
  tokenContractAddress: string;
}

export type NetworkConfigurations = {
  [network: string]: NetworkConfiguration;
};

export const getTotalSupplyAcrossNetworks = async (
  networks: NetworkConfigurations
): Promise<{ [network: string]: string; total: string }> => {
  const erc20ABI: AbiItem[] = [
    // Some parts of the ABI have been removed for brevity
    {
      constant: true,
      inputs: [],
      name: "totalSupply",
      outputs: [{ name: "", type: "uint256" }],
      payable: false,
      stateMutability: "view" as const,
      type: "function",
    },
    {
      constant: true,
      inputs: [],
      name: "decimals",
      outputs: [{ name: "", type: "uint8" }],
      payable: false,
      stateMutability: "view" as const,
      type: "function",
    },
  ];

  const supplyPerNetwork: { [network: string]: string } = {};
  let totalSupply = new BigNumber(0);

  for (const network in networks) {
    const config = networks[network];
    const web3 = new Web3(config.jsonRpcUrl);
    const tokenContract = new web3.eth.Contract(erc20ABI, config.tokenContractAddress);

    try {
      const [supply, decimals] = await Promise.all([
        tokenContract.methods.totalSupply().call(),
        tokenContract.methods.decimals().call(),
      ]);

      const supplyBN = new BigNumber(supply);
      const decimalsBN = new BigNumber(10).pow(decimals);
      const supplyInEther = supplyBN.div(decimalsBN);

      totalSupply = totalSupply.plus(supplyInEther);
      supplyPerNetwork[network] = supplyInEther.toString();
    } catch (error) {
      console.error(`Error getting total supply for ${network}:`, (error as Error).message);
    }
  }

  return { ...supplyPerNetwork, total: totalSupply.toString() };
};
