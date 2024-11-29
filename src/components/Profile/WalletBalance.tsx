import { useWallet, useConnection } from '@solana/wallet-adapter-react';
import { useState, useEffect, useCallback } from 'react';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';

export const WalletBalance = () => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);

  const fetchBalance = useCallback(async (walletAddress: PublicKey) => {
    try {
      // Get multiple confirmations of the balance
      const [balance1, balance2] = await Promise.all([
        connection.getBalance(walletAddress),
        connection.getBalance(walletAddress, 'confirmed')
      ]);
      
      // Use the most recent balance
      const finalBalance = Math.max(balance1, balance2);
      setBalance(finalBalance / LAMPORTS_PER_SOL);
    } catch {
      // Silent error handling
    }
  }, [connection]);

  useEffect(() => {
    if (!publicKey) {
      setBalance(null);
      return;
    }

    // Initial fetch
    fetchBalance(publicKey);

    // Set up WebSocket subscription
    const subscriptionId = connection.onAccountChange(
      publicKey,
      async (account) => {
        setBalance(account.lamports / LAMPORTS_PER_SOL);
        // Double-check balance after a short delay
        setTimeout(() => fetchBalance(publicKey), 500);
      },
      'confirmed'
    );

    // Polling as backup
    const intervalId = setInterval(() => {
      fetchBalance(publicKey);
    }, 2000);

    return () => {
      clearInterval(intervalId);
      connection.removeAccountChangeListener(subscriptionId);
    };
  }, [publicKey, connection, fetchBalance]);

  if (!publicKey) return null;

  return (
    <div className="bg-gradient-to-r from-blue-500 to-purple-500 p-4 rounded-lg">
      <p className="text-white text-2xl font-bold">
        {balance !== null ? `${balance.toFixed(4)} SOL` : 'Loading...'}
      </p>
    </div>
  );
}; 