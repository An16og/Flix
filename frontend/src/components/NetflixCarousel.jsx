import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Info, Bookmark, Star, Sparkles, Check, Film } from 'lucide-react';
import { getPosterUrl } from '../utils/imageUtils';
import { useAuth } from '../context/AuthContext';
import { activityApi } from '../api/client';

export default function NetflixCarousel({ movies = [], onOpenDetail, onOpenAuthModal }) {
  const { currentUser } = useAuth();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [watchlistStatus, setWatchlistStatus] = useState({});
  const [loadingAction, setLoadingAction] = useState(false);
  const timerRef = useRef(null);

  // Auto-slide every 5 seconds unless hovered
  useEffect(() => {
    if (movies.length <= 1 || isPaused) return;

    timerRef.current = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
    }, 5000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [movies.length, isPaused]);

  if (!movies || movies.length === 0) return null;

  const currentMovie = movies[currentIndex];
  const posterUrl = getPosterUrl(currentMovie);
  const releaseYear = currentMovie.releaseDate
    ? currentMovie.releaseDate.split('-')[0]
    : (currentMovie.release_date ? currentMovie.release_date.split('-')[0] : '2010');

  const voteAvg = currentMovie.voteAverage || currentMovie.vote_average || 8.2;
  const genres = Array.isArray(currentMovie.genres)
    ? currentMovie.genres.slice(0, 3)
    : ['Cinema', 'Drama'];

  const handlePrev = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);
  };

  const handleNext = (e) => {
    e.stopPropagation();
    setCurrentIndex((prev) => (prev + 1) % movies.length);
  };

  const handleToggleWatchlist = async (e) => {
    e.stopPropagation();
    if (!currentUser) {
      if (onOpenAuthModal) onOpenAuthModal('login');
      return;
    }
    const movieId = currentMovie.id;
    const isSaved = watchlistStatus[movieId];
    setLoadingAction(true);
    try {
      if (isSaved) {
        await activityApi.removeFromWatchlist(currentUser.id, movieId);
        setWatchlistStatus((prev) => ({ ...prev, [movieId]: false }));
      } else {
        await activityApi.addToWatchlist(currentUser.id, movieId);
        setWatchlistStatus((prev) => ({ ...prev, [movieId]: true }));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAction(false);
    }
  };

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden border shadow-2xl mb-12 transition-all group select-none
        border-lbBeige-border dark:border-lbDark-border h-[420px] sm:h-[480px] bg-black"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {/* Background Poster Image with Cinematic Backdrop Gradients */}
      <div className="absolute inset-0">
        <img
          key={currentMovie.id}
          src={posterUrl}
          alt={currentMovie.title}
          className="w-full h-full object-cover object-center opacity-30 filter brightness-75 scale-105 transition-all duration-700 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/85 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-green/10 via-transparent to-transparent opacity-60" />
      </div>

      {/* Content Overlay */}
      <div className="relative z-10 h-full flex flex-col justify-end p-6 sm:p-12 max-w-3xl text-white">
        
        {/* Top Badges */}
        <div className="flex flex-wrap items-center gap-2 mb-3">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-brand-green text-black flex items-center gap-1 shadow-sm">
            <Sparkles className="w-3 h-3" /> Featured Spotlight
          </span>

          <span className="flex items-center gap-1 text-xs font-bold font-mono px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-amber-400 border border-white/10">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            {Number(voteAvg).toFixed(1)} / 10
          </span>

          <span className="text-xs font-mono text-zinc-400 px-2 py-0.5 rounded bg-black/40">
            {releaseYear}
          </span>

          {genres.map((g, idx) => (
            <span
              key={idx}
              className="hidden sm:inline-block text-[11px] font-medium text-zinc-300 px-2 py-0.5 rounded bg-white/10 backdrop-blur-sm"
            >
              {g}
            </span>
          ))}
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight leading-tight line-clamp-2 drop-shadow-md">
          {currentMovie.title}
        </h1>

        {/* Overview Synopsis */}
        <p className="mt-2 text-xs sm:text-sm text-zinc-300 font-sans line-clamp-3 leading-relaxed max-w-2xl drop-shadow">
          {currentMovie.tagline ? `"${currentMovie.tagline}" — ` : ''}
          {currentMovie.overview || "An exceptional cinematic journey acclaimed by audiences and critics alike."}
        </p>

        {/* Interactive CTA Buttons */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            onClick={() => onOpenDetail(currentMovie.id)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider 
              bg-brand-green text-black hover:bg-emerald-400 active:scale-95 transition-all shadow-lg hover:shadow-emerald-500/25"
          >
            <Info className="w-4 h-4" />
            Film Details & Cast
          </button>

          <button
            onClick={handleToggleWatchlist}
            disabled={loadingAction}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider backdrop-blur-md border transition-all active:scale-95 ${
              watchlistStatus[currentMovie.id]
                ? 'bg-brand-green/20 text-brand-green border-brand-green/50'
                : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
            }`}
          >
            {watchlistStatus[currentMovie.id] ? (
              <>
                <Check className="w-4 h-4 text-brand-green" />
                In Watchlist
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4" />
                + Watchlist
              </>
            )}
          </button>
        </div>

      </div>

      {/* Sliding Arrow Controls */}
      <button
        onClick={handlePrev}
        aria-label="Previous Slide"
        className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white/70 hover:text-white backdrop-blur-sm border border-white/10 transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>

      <button
        onClick={handleNext}
        aria-label="Next Slide"
        className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-black/50 hover:bg-black/80 text-white/70 hover:text-white backdrop-blur-sm border border-white/10 transition-all opacity-0 group-hover:opacity-100"
      >
        <ChevronRight className="w-5 h-5" />
      </button>

      {/* Indicator Dots */}
      <div className="absolute bottom-4 right-6 z-20 flex items-center gap-1.5">
        {movies.map((m, idx) => (
          <button
            key={m.id || idx}
            onClick={() => setCurrentIndex(idx)}
            className={`transition-all rounded-full ${
              idx === currentIndex
                ? 'w-6 h-1.5 bg-brand-green shadow-sm'
                : 'w-1.5 h-1.5 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>

    </div>
  );
}
