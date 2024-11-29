import React from 'react';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

export const WalletButton: React.FC = () => {
  return (
    <WalletMultiButton 
      className="!bg-purple-600 hover:!bg-purple-700 !text-white !px-4 !py-2 !rounded-md !transition-colors !font-medium !text-sm"
    />
  );
}; 