import React, { useState } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { supportService } from '../../services/supportService';
import { Gift, X } from 'lucide-react';

interface SupportModalProps {
  isOpen: boolean;
  onClose: () => void;
  comic: Comic;
}

export const SupportModal: React.FC<SupportModalProps> = ({ isOpen, onClose, comic }) => {
  const [amount, setAmount] = useState(1);
  const [isProcessing, setIsProcessing] = useState(false);
  const { publicKey } = useWallet();

  const handleSupport = async () => {
    if (!comic.creatorWallet) return;
    
    setIsProcessing(true);
    try {
      await supportService.sendSupport(comic.creatorWallet, amount);
      onClose();
    } catch (error) {
      console.error('Support failed:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Support Creator</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          {!publicKey ? (
            <div className="text-center">
              <p className="mb-4">Connect your wallet to support this creator</p>
              <WalletMultiButton />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Amount (SOL)
                </label>
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  value={amount}
                  onChange={(e) => setAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>

              <button
                onClick={handleSupport}
                disabled={isProcessing}
                className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <Gift className="w-5 h-5" />
                <span>{isProcessing ? 'Processing...' : 'Send Support'}</span>
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}; 