import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { clusterApiUrl } from '@solana/web3.js';

export const SOLANA_NETWORK = WalletAdapterNetwork.Devnet;
export const SOLANA_RPC_ENDPOINT = clusterApiUrl(SOLANA_NETWORK);

export const SOLANA_CONFIG = {
  network: SOLANA_NETWORK,
  endpoint: SOLANA_RPC_ENDPOINT,
  autoConnect: true
}; 