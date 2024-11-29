import { useState } from 'react';
import { PenLine, Home, BookOpen, User } from 'lucide-react';
import { Reader } from './components/Reader';
import { Creator } from './components/Creator';
import { ComicGrid } from './components/ComicGrid';
import { Feed } from './components/media/Feed';
import { ProfilePage } from './components/Profile/ProfilePage';
import { useComicStore } from './store/useComicStore';
import { Comic } from './types';
import { useWallet } from '@solana/wallet-adapter-react';
import { WalletButton } from './components/wallet/WalletButton';

// Protected route wrapper component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { publicKey } = useWallet();
  
  if (!publicKey) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 p-8">
        <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
        <p className="text-gray-400 mb-6">Please connect your wallet to access this page</p>
        <WalletButton />
      </div>
    );
  }

  return <>{children}</>;
};

function App() {
  const { isCreatorMode, toggleCreatorMode, currentComic, setCurrentComic } = useComicStore();
  const [showMyComics, setShowMyComics] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const { publicKey } = useWallet();

  const handleCreateNew = () => {
    if (isCreatorMode) return;
    
    if (!publicKey) {
      return; // Early return if wallet is not connected
    }

    const newComic: Comic = {
      id: `draft-${Math.random().toString(36).substr(2, 9)}`,
      title: 'Untitled Comic',
      creator: 'Anonymous',
      creatorWallet: publicKey?.toBase58() || '',
      coverImage: '',
      coverType: 'image' as const,
      pages: [[]],
      pageTemplates: [],
      createdAt: new Date(),
      lastModified: new Date()
    };
    toggleCreatorMode();
    setCurrentComic(newComic);
    setShowMyComics(false);
    setShowProfile(false);
  };

  const handleLogoClick = () => {
    setCurrentComic(null);
    setShowMyComics(false);
    setShowProfile(false);
    if (isCreatorMode) {
      toggleCreatorMode();
    }
  };

  const handleMyComicsClick = () => {
    if (!publicKey) {
      setShowMyComics(true);
      setShowProfile(false);
      setCurrentComic(null);
      return;
    }
    setShowMyComics(true);
    setShowProfile(false);
    setCurrentComic(null);
  };

  const handleProfileClick = () => {
    if (!publicKey) {
      setShowProfile(true);
      setShowMyComics(false);
      setCurrentComic(null);
      return;
    }
    setShowProfile(true);
    setShowMyComics(false);
    setCurrentComic(null);
  };

  const renderContent = () => {
    if (showProfile) {
      return (
        <ProtectedRoute>
          <ProfilePage />
        </ProtectedRoute>
      );
    }
    if (showMyComics) {
      return (
        <ProtectedRoute>
          <ComicGrid onCreateNew={handleCreateNew} />
        </ProtectedRoute>
      );
    }
    if (isCreatorMode) {
      return (
        <ProtectedRoute>
          <Creator />
        </ProtectedRoute>
      );
    }
    if (currentComic && !isCreatorMode) {
      return <Reader />;
    }
    return <Feed />;
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <nav className="fixed top-0 inset-x-0 z-50 bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <button 
              onClick={handleLogoClick}
              className="flex items-center hover:opacity-80 transition-opacity"
            >
              <img src="/hon-logo.svg" alt="Hon" className="h-8" />
            </button>
            <div className="flex items-center space-x-4">
              <WalletButton />
              <button
                onClick={handleCreateNew}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium flex items-center space-x-2 transition-colors"
              >
                <PenLine size={16} />
                <span>Create Comic</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50">
        <div className="bg-white/10 backdrop-blur-md rounded-full px-2 py-1.5 flex items-center space-x-1">
          <button
            onClick={handleLogoClick}
            className={`p-2 rounded-full transition-colors ${!showMyComics && !showProfile && !currentComic ? 'bg-blue-500 text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
          >
            <Home size={20} />
          </button>
          <button
            onClick={handleMyComicsClick}
            className={`p-2 rounded-full transition-colors ${showMyComics ? 'bg-blue-500 text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
          >
            <BookOpen size={20} />
          </button>
          <button
            onClick={handleProfileClick}
            className={`p-2 rounded-full transition-colors ${showProfile ? 'bg-blue-500 text-white' : 'text-gray-300 hover:text-white hover:bg-white/10'}`}
          >
            <User size={20} />
          </button>
        </div>
      </div>

      <main className="pt-16 pb-16">
        {renderContent()}
      </main>
    </div>
  );
}

export default App;