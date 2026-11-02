import React, { useState } from 'react';
import Navbar from './components/Navbar';
import HomeView from './components/HomeView';
import SearchView from './components/SearchView';
import ProfileView from './components/ProfileView';
import MovieDetailModal from './components/MovieDetailModal';
import AuthModal from './components/AuthModal';
import RagBotModal from './components/RagBotModal';
import Footer from './components/Footer';

export default function App() {
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'search' | 'profile'
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register'

  const handleOpenMovieDetail = (id) => {
    setSelectedMovieId(id);
  };

  const handleCloseMovieDetail = () => {
    setSelectedMovieId(null);
  };

  const handleOpenAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen relative flex flex-col font-sans selection:bg-amber-400 selection:text-black">
      
      {/* Ambient Cinema Lighting & Depth */}
      <div className="cinema-ambient-bg" />
      <div className="cinema-grain-overlay" />

      {/* Main UI Container */}
      <div className="relative z-10 flex flex-col min-h-screen">
        
        {/* Navigation Bar */}
        <Navbar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenAuthModal={handleOpenAuthModal}
        />

        {/* Main Content Area */}
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
          
          {/* 1. Home Tab: Netflix sliding carousel + Recent 5 watches recs + Prominent trait spectrum + Genre tabs */}
          {activeTab === 'home' && (
            <HomeView
              onMovieClick={handleOpenMovieDetail}
              onOpenAuthModal={handleOpenAuthModal}
            />
          )}

          {/* 2. Search Tab: Search bar + Recent Searches + Smart Story & Title search */}
          {activeTab === 'search' && (
            <SearchView
              onMovieClick={handleOpenMovieDetail}
            />
          )}

          {/* 3. Profile Tab: Profile info + Persona switch + Watchlist + Watched history */}
          {activeTab === 'profile' && (
            <ProfileView
              onMovieClick={handleOpenMovieDetail}
              onOpenAuthModal={handleOpenAuthModal}
            />
          )}

        </main>

        {/* Global Modals */}
        {selectedMovieId && (
          <MovieDetailModal
            movieId={selectedMovieId}
            onClose={handleCloseMovieDetail}
            onMovieSelected={handleOpenMovieDetail}
          />
        )}

        <AuthModal
          isOpen={isAuthModalOpen}
          initialMode={authModalMode}
          onClose={() => setIsAuthModalOpen(false)}
        />

        {/* Subtle RAG Bot floating assistant */}
        <RagBotModal
          onOpenMovieDetail={handleOpenMovieDetail}
        />

        {/* Footer */}
        <Footer />

      </div>

    </div>
  );
}
