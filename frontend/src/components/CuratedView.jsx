import React, { useState, useEffect } from 'react';
import { Flame, Trophy, Sparkles } from 'lucide-react';
import { movieApi } from '../api/client';
import MovieCard from './MovieCard';

export default function CuratedView({ type = 'trending', onMovieClick }) {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMovies();
  }, [type]);

  const loadMovies = async () => {
    setLoading(true);
    try {
      const data = type === 'trending' 
        ? await movieApi.getTrending(24) 
        : await movieApi.getTopRated(24);
      setMovies(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const isTrending = type === 'trending';

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Header */}
      <div className="p-6 rounded-2xl border transition-all
        dark:bg-lbDark-surface dark:border-lbDark-border
        light:bg-lbBeige-surface light:border-lbBeige-border">
        <div className="flex items-center gap-2.5">
          <span className={`p-2 rounded-xl ${isTrending ? 'bg-brand-orange/20 text-brand-orange' : 'bg-amber-400/20 text-amber-400'}`}>
            {isTrending ? <Flame className="w-5 h-5" /> : <Trophy className="w-5 h-5" />}
          </span>
          <div>
            <h2 className="text-xl font-extrabold font-sans">
              {isTrending ? 'Trending Popular Cinema' : 'All-Time Highest Rated (Letterboxd Favorites)'}
            </h2>
            <p className="text-xs dark:text-lbDark-textMuted light:text-lbBeige-textMuted mt-0.5">
              {isTrending 
                ? 'The most watched, discussed, and logged films across the database.' 
                : 'Cinematic masterworks holding the highest average vote scores with significant vote volume.'}
            </p>
          </div>
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(24)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[2/3] w-full rounded-lg bg-zinc-800/40 mb-2" />
              <div className="h-3 w-3/4 bg-zinc-800/40 rounded mb-1" />
              <div className="h-2 w-1/2 bg-zinc-800/40 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {movies.map((m) => (
            <MovieCard
              key={m.id}
              movie={m}
              onClick={() => onMovieClick(m.id)}
            />
          ))}
        </div>
      )}

    </div>
  );
}
