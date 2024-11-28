import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useConnection } from '@solana/wallet-adapter-react';
import { useState, useEffect } from 'react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

export const WalletBalance: React.FC = () => {
  const { publicKey } = useWallet();
  const { connection } = useConnection();
  const [balance, setBalance] = useState<number | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!publicKey) {
        setBalance(null);
        return;
      }

      try {
        const lamports = await connection.getBalance(publicKey);
        setBalance(lamports / LAMPORTS_PER_SOL);
      } catch (error) {
        console.error('Error fetching balance:', error);
        setBalance(null);
      }
    };

    fetchBalance();
    // Set up interval to refresh balance
    const intervalId = setInterval(fetchBalance, 10000); // Refresh every 10 seconds

    return () => clearInterval(intervalId);
  }, [publicKey, connection]);

  if (!publicKey) {
    return (
      <div className="bg-gray-700/50 rounded-lg p-6">
        <p className="text-gray-400">Connect your wallet to view balance</p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-6 relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex items-baseline space-x-2">
          <span className="text-3xl font-bold text-white">
            {balance !== null ? balance.toFixed(4) : '---'}
          </span>
          <span className="text-gray-400">SOL</span>
        </div>
        
        {balance !== null && (
          <div className="mt-2 text-sm text-gray-400">
            ≈ ${(balance * 20).toFixed(2)} USD
          </div>
        )}
      </div>
      
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-purple-500/5 rounded-full translate-y-1/2 -translate-x-1/2" />
    </div>
  );
}; 