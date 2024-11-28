import { createContext, useContext, useState, useEffect } from 'react';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';

interface SolanaContextType {
  balance: number;
  isLoading: boolean;
}

const SolanaContext = createContext<SolanaContextType>({
  balance: 0,
  isLoading: true,
});

export const SolanaProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [balance, setBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!publicKey) {
      setBalance(0);
      setIsLoading(false);
      return;
    }

    const getBalance = async () => {
      try {
        const bal = await connection.getBalance(publicKey);
        setBalance(bal / LAMPORTS_PER_SOL);
      } catch (e) {
        console.error('Error getting balance', e);
      }
      setIsLoading(false);
    };

    getBalance();
    const id = connection.onAccountChange(publicKey, () => getBalance());
    return () => {
      connection.removeAccountChangeListener(id);
    };
  }, [publicKey, connection]);

  return (
    <SolanaContext.Provider value={{ balance, isLoading }}>
      {children}
    </SolanaContext.Provider>
  );
};

export const useSolana = () => useContext(SolanaContext); 