import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import HeroBanner from './components/HeroBanner';
import ExploreView from './components/ExploreView';
import RecommendationsView from './components/RecommendationsView';
import CuratedView from './components/CuratedView';
import ProfileView from './components/ProfileView';
import SearchView from './components/SearchView';
import MovieDetailModal from './components/MovieDetailModal';
import AuthModal from './components/AuthModal';
import Footer from './components/Footer';
import { movieApi } from './api/client';
import { useAuth } from './context/AuthContext';

export default function App() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('explore'); // 'explore' | 'recommendations' | 'trending' | 'top-rated' | 'profile' | 'watchlist' | 'search'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedMovieId, setSelectedMovieId] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register'
  const [heroMovie, setHeroMovie] = useState(null);

  // Load a featured top movie for the HeroBanner on initial mount
  useEffect(() => {
    loadFeaturedHero();
  }, []);

  const loadFeaturedHero = async () => {
    try {
      // Try Inception (27205) or first trending
      const detail = await movieApi.getDetail(27205).catch(async () => {
        const trending = await movieApi.getTrending(1);
        if (trending && trending.length > 0) {
          return await movieApi.getDetail(trending[0].id);
        }
        return null;
      });
      if (detail) setHeroMovie(detail);
    } catch (e) {
      console.error('Could not load hero movie', e);
    }
  };

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
    <div className="min-h-screen flex flex-col font-sans selection:bg-brand-green selection:text-black">
      
      {/* Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearchSubmit={() => setActiveTab('search')}
        onOpenAuthModal={handleOpenAuthModal}
        onOpenMovieDetail={handleOpenMovieDetail}
      />

      {/* Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        
        {/* Hero banner shown on 'explore' tab */}
        {activeTab === 'explore' && heroMovie && (
          <HeroBanner
            movie={heroMovie}
            onOpenDetail={handleOpenMovieDetail}
            onOpenAuthModal={() => handleOpenAuthModal('register')}
          />
        )}

        {/* Dynamic Views */}
        {activeTab === 'explore' && (
          <ExploreView onMovieClick={handleOpenMovieDetail} />
        )}

        {activeTab === 'recommendations' && (
          <RecommendationsView
            onMovieClick={handleOpenMovieDetail}
            onOpenAuthModal={handleOpenAuthModal}
          />
        )}

        {activeTab === 'trending' && (
          <CuratedView
            type="trending"
            onMovieClick={handleOpenMovieDetail}
          />
        )}

        {activeTab === 'top-rated' && (
          <CuratedView
            type="top-rated"
            onMovieClick={handleOpenMovieDetail}
          />
        )}

        {activeTab === 'search' && (
          <SearchView
            query={searchQuery}
            onMovieClick={handleOpenMovieDetail}
          />
        )}

        {activeTab === 'profile' && (
          <ProfileView
            initialSubTab="watched"
            onMovieClick={handleOpenMovieDetail}
            onOpenAuthModal={handleOpenAuthModal}
          />
        )}

        {activeTab === 'watchlist' && (
          <ProfileView
            initialSubTab="watchlist"
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

      {/* Footer */}
      <Footer />

    </div>
  );
}
