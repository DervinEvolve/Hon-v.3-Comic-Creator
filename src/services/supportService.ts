import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';

export const supportService = {
  async sendSupport(recipientAddress: string, amount: number) {
    const { connection } = useConnection();
    const { publicKey, sendTransaction } = useWallet();

    if (!publicKey) throw new Error('Wallet not connected');

    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: publicKey,
          toPubkey: new PublicKey(recipientAddress),
          lamports: amount * LAMPORTS_PER_SOL
        })
      );

      const signature = await sendTransaction(transaction, connection);
      await connection.confirmTransaction(signature, 'confirmed');

      return signature;
    } catch (error) {
      console.error('Error sending support:', error);
      throw error;
    }
  }
}; 