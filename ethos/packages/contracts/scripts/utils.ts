import { writeFileSync } from 'node:fs';
import { ESLint } from 'eslint';
import hre from 'hardhat';
import { zeroAddress } from 'viem';

const { artifacts } = hre;

const defaultTestAdminAccount = '0x61eA43eB8d1bDA72646F141bD3af08bd0f0d362d';
const defaultTestSignerAccount = '0xfee5e1FD4a32012b54d479af03a52616d9223A95';

export const BASE_MAINNET = 'base-mainnet';
export const BASE_TESTNET = 'base-sepolia';

export type HardhatDefinedNetwork = 'dev' | 'testnet' | 'prod';

export function getAdminAccount(network: string): string {
  let adminAccount;
  switch (network) {
    case 'dev':
      adminAccount = process.env.ADMIN_DEV_ADDRESS ?? defaultTestAdminAccount;
      break;
    case 'prod':
      adminAccount = process.env.ADMIN_MAINNET_ADDRESS;
      break;
    case 'testnet':
      adminAccount = process.env.ADMIN_PUBLIC_TESTNET_ADDRESS;
      break;
    default:
      throw new Error('Invalid network');
  }

  if (!adminAccount) {
    throw new Error('Invalid admin account');
  }

  return adminAccount;
}

export function getSignerAccount(network: string): string {
  let signerAccount;
  switch (network) {
    case 'dev':
      signerAccount = process.env.SIGNER_DEV_ADDRESS ?? defaultTestSignerAccount;
      break;
    case 'prod':
      signerAccount = process.env.SIGNER_MAINNET_ADDRESS;
      break;
    case 'testnet':
      signerAccount = process.env.SIGNER_PUBLIC_TESTNET_ADDRESS;
      break;
    default:
      throw new Error('Invalid network');
  }

  if (!signerAccount) {
    throw new Error('Invalid signer account');
  }

  return signerAccount;
}

export const placeholderContractMetadata = {
  dev: {
    address: zeroAddress,
    args: [],
  },
  testnet: {
    address: zeroAddress,
    args: [],
  },
  prod: {
    address: zeroAddress,
    args: [],
  },
};

export const placeholderProxyContractMetadata = {
  dev: {
    address: zeroAddress,
    proxyAddress: zeroAddress,
    args: [],
    proxyArgs: [],
  },
  testnet: {
    address: zeroAddress,
    proxyAddress: zeroAddress,
    args: [],
    proxyArgs: [],
  },
  prod: {
    address: zeroAddress,
    proxyAddress: zeroAddress,
    args: [],
    proxyArgs: [],
  },
};

export async function writeContractABI(
  contractName: string,
  contractConfig: { name: string },
): Promise<void> {
  const abiFilePath = `./src/${contractName}-abi.json`;
  const abiTypeFilePath = `./src/${contractName}-abi.ts`;

  const { abi } = await artifacts.readArtifact(contractConfig.name);

  writeFileSync(abiFilePath, JSON.stringify(abi, null, 2));

  // Save the contract ABI to a TypeScript file
  writeFileSync(
    abiTypeFilePath,
    `
    /**
     * This file is autogenerated. Do not edit it manually.
     */
    import { type Abi } from 'viem';

    export const ${contractName}Abi = ${JSON.stringify(abi)} as const satisfies Abi;
    `,
  );

  // Lint the ts ABI file
  const results = await new ESLint({ fix: true }).lintFiles([abiTypeFilePath]);
  // Auto-fix the linting issues
  await ESLint.outputFixes(results);
}
