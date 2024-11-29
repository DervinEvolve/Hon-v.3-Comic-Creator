import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { SolanaProvider } from './contexts/SolanaContext';
import '@solana/wallet-adapter-react-ui/styles.css';

const endpoint = clusterApiUrl('devnet');
const wallets = [new PhantomWalletAdapter()];

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <SolanaProvider>
            <App />
          </SolanaProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  </React.StrictMode>
);