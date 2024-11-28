import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';

export const solanaService = {
  async sendSol(
    connection: any,
    fromPubkey: PublicKey,
    toPubkey: PublicKey,
    amount: number,
    sendTransaction: any
  ) {
    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey,
          toPubkey,
          lamports: amount * LAMPORTS_PER_SOL
        })
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');
      
      return signature;
    } catch (error) {
      console.error('Error sending SOL:', error);
      throw error;
    }
  }
}; 