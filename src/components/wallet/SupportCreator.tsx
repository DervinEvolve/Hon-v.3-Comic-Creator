import React, { useState } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey } from '@solana/web3.js';
import { Gift } from 'lucide-react';
import { solanaService } from '../../services/solanaService';
import { useSolana } from '../../contexts/SolanaContext';

interface SupportCreatorProps {
  creatorWallet: string;
  comicId: string;
  onSuccess?: () => void;
}

export const SupportCreator: React.FC<SupportCreatorProps> = ({
  creatorWallet,
  comicId,
  onSuccess
}) => {
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const { isConnected } = useSolana();
  const [amount, setAmount] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSupport = async () => {
    if (!isConnected || !publicKey || !creatorWallet) return;
    
    setIsProcessing(true);
    setError(null);

    try {
      const recipientPubKey = new PublicKey(creatorWallet);
      
      const signature = await solanaService.sendSol(
        connection,
        publicKey,
        recipientPubKey,
        amount,
        sendTransaction
      );

      console.log('Support transaction successful:', signature);
      onSuccess?.();
    } catch (err) {
      console.error('Support transaction failed:', err);
      setError('Transaction failed. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  if (!creatorWallet) return null;

  return (
    <div className="flex flex-col space-y-4">
      <div className="flex items-center space-x-2">
        <input
          type="number"
          min="0.1"
          step="0.1"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="px-3 py-2 border rounded-md w-24"
          disabled={isProcessing}
        />
        <span className="text-sm text-gray-500">SOL</span>
      </div>

      <button
        onClick={handleSupport}
        disabled={!isConnected || isProcessing}
        className={`flex items-center justify-center px-4 py-2 rounded-md space-x-2
          ${isConnected 
            ? 'bg-purple-600 hover:bg-purple-700 text-white' 
            : 'bg-gray-300 text-gray-500 cursor-not-allowed'
          }`}
      >
        <Gift className="w-4 h-4" />
        <span>
          {isProcessing ? 'Processing...' : 'Support Creator'}
        </span>
      </button>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
}; 