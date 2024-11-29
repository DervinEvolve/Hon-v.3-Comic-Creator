import { Connection, PublicKey, Transaction, SystemProgram, SendTransactionError, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { WalletContextState } from '@solana/wallet-adapter-react';

class SolanaService {
  async sendSol(
    connection: Connection,
    senderPublicKey: PublicKey,
    recipientPublicKey: PublicKey,
    amount: number,
    sendTransaction: WalletContextState['sendTransaction']
  ): Promise<string> {
    try {
      const transaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: senderPublicKey,
          toPubkey: recipientPublicKey,
          lamports: amount * LAMPORTS_PER_SOL,
        })
      );

      const {
        context: { slot: minContextSlot },
        value: { blockhash, lastValidBlockHeight }
      } = await connection.getLatestBlockhashAndContext();

      const signature = await sendTransaction(transaction, connection, {
        minContextSlot,
      });

      // Wait for confirmation
      const confirmation = await connection.confirmTransaction({
        blockhash,
        lastValidBlockHeight,
        signature,
      });

      if (confirmation.value.err) {
        throw new Error('Transaction failed');
      }

      return signature;
    } catch (error) {
      if (error instanceof SendTransactionError) {
        throw new Error('Transaction rejected by user');
      }
      throw error;
    }
  }
}

export const solanaService = new SolanaService(); 