import React from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useSolana } from '../../contexts/SolanaContext';

export const Profile: React.FC = () => {
  const { publicKey } = useWallet();
  const { balance } = useSolana();

  return (
    <div className="container mx-auto px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Username Section */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Profile</h2>
          {/* We'll add username input here */}
        </div>

        {/* Social Links Section */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Social Links</h2>
          {/* We'll add social links here */}
        </div>

        {/* Wallet Activity Section */}
        <div className="bg-gray-800 rounded-lg p-6">
          <h2 className="text-xl font-bold mb-4">Wallet Activity</h2>
          <div className="text-lg">
            Balance: {balance?.toFixed(2)} SOL
          </div>
          {/* We'll add transaction history here */}
        </div>
      </div>
    </div>
  );
}; 