import React, { useState, useEffect } from 'react';
import { Sparkles, Layers, Compass, Flame, Film } from 'lucide-react';
import NetflixCarousel from './NetflixCarousel';
import MovieRow from './MovieRow';
import MovieCard from './MovieCard';
import { movieApi, recommendationApi } from '../api/client';
import { useAuth } from '../context/AuthContext';

const GENRES = [
  'All',
  'Science Fiction',
  'Horror',
  'Animation',
  'Crime',
  'Romance',
  'Action',
  'Comedy',
  'Drama',
  'Thriller',
  'Mystery'
];

export default function HomeView({ onMovieClick, onOpenAuthModal }) {
  const { currentUser } = useAuth();

  // Carousel movies (Top 5 featured)
  const [carouselMovies, setCarouselMovies] = useState([]);

  // Row 1: Recent Watches Centroid Recommendations
  const [recentWatchRecs, setRecentWatchRecs] = useState([]);
  const [recentWatchLoading, setRecentWatchLoading] = useState(true);
  const [recentWatchReason, setRecentWatchReason] = useState('');

  // Row 2: Prominent Trait / Cinema Spectrum
  const [traitMovies, setTraitMovies] = useState([]);
  const [traitTitle, setTraitTitle] = useState("Curator's Spectrum: High-Concept Visionaries");
  const [traitSubtitle, setTraitSubtitle] = useState("Iconic auteur cinema spanning neo-noir, cyberpunk, and mind-bending narratives");
  const [traitLoading, setTraitLoading] = useState(true);

  // Section 3: Genre Tabs
  const [activeGenre, setActiveGenre] = useState('All');
  const [genreMovies, setGenreMovies] = useState([]);
  const [genreLoading, setGenreLoading] = useState(true);
  const [genrePage, setGenrePage] = useState(0);
  const [hasMoreGenre, setHasMoreGenre] = useState(true);

  // Load Initial Data
  useEffect(() => {
    loadFeaturedCarousel();
  }, []);

  // Reload personalized rows when currentUser changes
  useEffect(() => {
    loadRecentWatchRecs();
    loadProminentTraitSpectrum();
  }, [currentUser]);

  // Reload genre movies when activeGenre changes
  useEffect(() => {
    setGenrePage(0);
    loadGenreMovies(activeGenre, 0, true);
  }, [activeGenre]);

  const loadFeaturedCarousel = async () => {
    try {
      // Load top popular movies with high ratings for carousel
      const featured = await movieApi.getTrending(8);
      if (featured && featured.length > 0) {
        setCarouselMovies(featured.slice(0, 5));
      }
    } catch (e) {
      console.error('Failed to load carousel movies', e);
    }
  };

  const loadRecentWatchRecs = async () => {
    setRecentWatchLoading(true);
    try {
      if (currentUser?.id) {
        const recs = await recommendationApi.getPersonalized(currentUser.id, 12);
        setRecentWatchRecs(recs || []);
        if (recs && recs.length > 0 && recs[0].recommendationReason) {
          setRecentWatchReason(recs[0].recommendationReason);
        } else {
          setRecentWatchReason("Computed from your 5 most recent watches with recency decay");
        }
      } else {
        // Logged out: show top rated curated films
        const topRated = await movieApi.getTopRated(12);
        setRecentWatchRecs(topRated || []);
        setRecentWatchReason("Trending picks — Sign in with any demo persona to unlock your personalized vector centroid");
      }
    } catch (e) {
      console.error('Failed to load recent watches recommendations', e);
    } finally {
      setRecentWatchLoading(false);
    }
  };

  const loadProminentTraitSpectrum = async () => {
    setTraitLoading(true);
    try {
      const email = currentUser?.email?.toLowerCase() || '';

      // Determine prominent trait based on active user / persona
      if (email.includes('maya') || email.includes('alice')) {
        setTraitTitle("Prominent Trait: Christopher Nolan & The Sci-Fi Spectrum");
        setTraitSubtitle("High-concept world-building, time dilation, and philosophical cyberpunk");
        const res = await movieApi.browse(0, 12, 'Science Fiction', '', 'rating');
        setTraitMovies(res.content || []);
      } else if (email.includes('alex') || email.includes('horror') || email.includes('ethan')) {
        setTraitTitle("Prominent Trait: Atmospheric Psychological Horror & Suspense");
        setTraitSubtitle("Haunting dread, claustrophobic sound design, and psychological twists");
        const res = await movieApi.browse(0, 12, 'Horror', '', 'popularity');
        setTraitMovies(res.content || []);
      } else if (email.includes('chloe') || email.includes('animation') || email.includes('bob')) {
        setTraitTitle("Prominent Trait: Golden Age Pixar & Whimsical Animation");
        setTraitSubtitle("Universal storytelling, vibrant world craft, and emotional heart");
        const res = await movieApi.browse(0, 12, 'Animation', '', 'rating');
        setTraitMovies(res.content || []);
      } else if (email.includes('marcus') || email.includes('crime') || email.includes('charlie')) {
        setTraitTitle("Prominent Trait: Gritty Neo-Noir & Mafia Masterpieces");
        setTraitSubtitle("Morally gray antiheroes, Scorsese realism, and criminal underworlds");
        const res = await movieApi.browse(0, 12, 'Crime', '', 'rating');
        setTraitMovies(res.content || []);
      } else if (email.includes('liam') || email.includes('romance') || email.includes('diana')) {
        setTraitTitle("Prominent Trait: Sweeping Romance & Heartfelt Epics");
        setTraitSubtitle("Passionate journeys, bittersweet longing, and unforgettable chemistry");
        const res = await movieApi.browse(0, 12, 'Romance', '', 'rating');
        setTraitMovies(res.content || []);
      } else {
        // Default Curator Spectrum
        setTraitTitle("Curator's Spectrum: High-Concept Visionaries & Neo-Noir");
        setTraitSubtitle("Cinema by auteur visionaries: Nolan, Tarantino, Fincher, and Kubrick");
        const res = await movieApi.getTopRated(12);
        setTraitMovies(res || []);
      }
    } catch (e) {
      console.error('Failed to load prominent trait spectrum', e);
    } finally {
      setTraitLoading(false);
    }
  };

  const loadGenreMovies = async (genre, page, replace = false) => {
    setGenreLoading(true);
    try {
      const g = genre === 'All' ? '' : genre;
      const res = await movieApi.browse(page, 18, g, '', 'popularity');
      const newMovies = res.content || [];
      if (replace) {
        setGenreMovies(newMovies);
      } else {
        setGenreMovies((prev) => [...prev, ...newMovies]);
      }
      setHasMoreGenre(!res.last && newMovies.length > 0);
    } catch (e) {
      console.error('Failed to load genre movies', e);
    } finally {
      setGenreLoading(false);
    }
  };

  const handleLoadMoreGenre = () => {
    const nextPage = genrePage + 1;
    setGenrePage(nextPage);
    loadGenreMovies(activeGenre, nextPage, false);
  };

  return (
    <div className="pb-16">
      
      {/* 1. Top Sliding Netflix Carousel */}
      <NetflixCarousel
        movies={carouselMovies}
        onOpenDetail={onMovieClick}
        onOpenAuthModal={onOpenAuthModal}
      />

      {/* 2. List 1: Based on Your Recent 5 Watches (Vector Centroid) */}
      <MovieRow
        title={currentUser ? "Based on Your Recent Watches" : "Curated for You — Top Recommendations"}
        subtitle={recentWatchReason}
        icon={Sparkles}
        badge={currentUser ? "768-D Centroid" : "Trending"}
        movies={recentWatchRecs}
        loading={recentWatchLoading}
        onMovieClick={onMovieClick}
        emptyMessage="Rate or mark films as watched to generate your personalized centroid vector!"
      />

      {/* 3. List 2: Based on Your Most Prominent Trait / Cinema Spectrum */}
      <MovieRow
        title={traitTitle}
        subtitle={traitSubtitle}
        icon={Layers}
        badge="Trait Spectrum"
        movies={traitMovies}
        loading={traitLoading}
        onMovieClick={onMovieClick}
      />

      {/* 4. Section 3: Navigate by Genre Tabs */}
      <div className="mt-14 pt-8 border-t border-lbBeige-border dark:border-lbDark-border">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-brand-green" />
            <div>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-lbBeige-textMain dark:text-lbDark-textMain">
                Explore by Genre
              </h2>
              <p className="text-xs text-lbBeige-textMuted dark:text-lbDark-textMuted mt-0.5">
                Browse our comprehensive catalog curated across all major cinematic movements
              </p>
            </div>
          </div>
        </div>

        {/* Horizontal Genre Selector Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-3 mb-6 scrollbar-none" style={{ scrollbarWidth: 'none' }}>
          {GENRES.map((genre) => (
            <button
              key={genre}
              onClick={() => setActiveGenre(genre)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all uppercase tracking-wider ${
                activeGenre === genre
                  ? 'bg-brand-rust text-white dark:bg-brand-green dark:text-black shadow-md scale-105'
                  : 'bg-lbBeige-surface border border-lbBeige-border text-lbBeige-textMuted hover:text-black dark:bg-lbDark-surface dark:border-lbDark-border dark:text-lbDark-textMuted dark:hover:text-white'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>

        {/* Genre Grid */}
        {genreLoading && genreMovies.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 py-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <div
                key={i}
                className="aspect-[2/3] rounded-lg animate-pulse bg-lbBeige-surface/60 dark:bg-lbDark-surface/60 border border-lbBeige-border/40 dark:border-lbDark-border/40"
              />
            ))}
          </div>
        ) : genreMovies.length === 0 ? (
          <div className="py-12 text-center rounded-xl border border-dashed border-lbBeige-border dark:border-lbDark-border text-sm text-lbBeige-textMuted dark:text-lbDark-textMuted">
            No films found in this genre.
          </div>
        ) : (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {genreMovies.map((movie) => (
                <MovieCard
                  key={movie.id}
                  movie={movie}
                  onClick={() => onMovieClick && onMovieClick(movie.id)}
                />
              ))}
            </div>

            {/* Load More Button */}
            {hasMoreGenre && (
              <div className="mt-10 text-center">
                <button
                  onClick={handleLoadMoreGenre}
                  disabled={genreLoading}
                  className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all
                    bg-lbBeige-surface border border-lbBeige-border hover:bg-lbBeige-hover text-lbBeige-textMain
                    dark:bg-lbDark-surface dark:border-lbDark-border dark:hover:bg-lbDark-hover dark:text-lbDark-textMain active:scale-95"
                >
                  {genreLoading ? 'Loading Movies...' : 'Load More Cinema'}
                </button>
              </div>
            )}
          </div>
        )}

      </div>

    </div>
  );
}
