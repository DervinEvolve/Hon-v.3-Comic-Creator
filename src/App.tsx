import { useState } from 'react';
import { PenLine, Home, BookOpen } from 'lucide-react';
import { Reader } from './components/Reader';
import { Creator } from './components/Creator';
import { ComicGrid } from './components/ComicGrid';
import { Feed } from './components/Feed';
import { useComicStore } from './store/useComicStore';
import { Comic } from './types';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';
import { useMemo } from 'react';
import '@solana/wallet-adapter-react-ui/styles.css';
import { WalletButton } from './components/wallet/WalletButton';

function App() {
  const { isCreatorMode, toggleCreatorMode, currentComic, setCurrentComic } = useComicStore();
  const [showMyComics, setShowMyComics] = useState(false);

  const endpoint = useMemo(() => clusterApiUrl('devnet'), []);
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter()
    ],
    []
  );

  const handleCreateNew = () => {
    const newComic: Comic = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'Untitled Comic',
      creator: 'Anonymous',
      coverImage: '',
      coverType: 'image' as const,
      pages: [[]],
      pageTemplates: [],
      createdAt: new Date(),
      lastModified: new Date()
    };
    setCurrentComic(newComic);
    toggleCreatorMode();
  };

  const handleLogoClick = () => {
    setCurrentComic(null);
    setShowMyComics(false);
  };

  const renderContent = () => {
    if (showMyComics) {
      return <ComicGrid />;
    }
    if (isCreatorMode) {
      return <Creator />;
    }
    if (currentComic && !isCreatorMode) {
      return <Reader />;
    }
    return <Feed />;
  };

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <div className="min-h-screen bg-gray-900 text-white">
            <nav className="fixed top-0 inset-x-0 z-50 bg-gray-800 border-b border-gray-700">
              <div className="max-w-7xl mx-auto px-4">
                <div className="flex items-center justify-between h-16">
                  <div className="flex items-center space-x-4">
                    <button 
                      onClick={handleLogoClick}
                      className="flex items-center space-x-1 hover:opacity-80 transition-opacity"
                    >
                      <span className="text-white font-bold text-2xl tracking-tight">H</span>
                      <div className="relative w-6 h-6 mx-0.5">
                        <svg 
                          viewBox="0 0 24 24" 
                          className="w-6 h-6 text-blue-400"
                          style={{ 
                            filter: 'drop-shadow(0 0 8px rgba(96, 165, 250, 0.3))'
                          }}
                        >
                          <path
                            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="1.5"
                          />
                          <path
                            d="M8 7.5C8 7.5 10 6 12 6c2 0 4 1.5 4 1.5V17c0 0-2-1.5-4-1.5c-2 0-4 1.5-4 1.5V7.5z"
                            fill="currentColor"
                            className="transform -rotate-6"
                          />
                          <path
                            d="M12 6v9.5"
                            stroke="currentColor"
                            strokeWidth="1"
                            className="transform -rotate-6"
                          />
                        </svg>
                      </div>
                      <span className="text-white font-bold text-2xl tracking-tight">n</span>
                    </button>
                  </div>

                  <div className="flex items-center space-x-4">
                    <WalletButton />
                    {!isCreatorMode && (
                      <button
                        onClick={handleCreateNew}
                        className="px-4 py-2 bg-blue-500 text-white rounded-full hover:bg-blue-600 transition-colors flex items-center space-x-2"
                      >
                        <PenLine className="w-5 h-5" />
                        <span>Create Comic</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </nav>

            <main className="pt-16">
              {renderContent()}
            </main>

            {!isCreatorMode && !currentComic && (
              <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 flex items-center space-x-5 bg-white/90 backdrop-blur-sm rounded-full shadow-lg px-8 py-4">
                <button
                  onClick={() => setShowMyComics(false)}
                  className={`p-3 rounded-full transition-colors ${
                    !showMyComics 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  title="Feed"
                >
                  <Home className="w-6 h-6" />
                </button>
                
                <button
                  onClick={() => setShowMyComics(true)}
                  className={`p-3 rounded-full transition-colors ${
                    showMyComics 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  title="My Comics"
                >
                  <BookOpen className="w-6 h-6" />
                </button>
              </div>
            )}
          </div>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}

export default App;