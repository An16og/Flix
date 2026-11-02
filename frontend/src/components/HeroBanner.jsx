import React from 'react';
import { Bookmark, Info, Star, Sparkles, UserPlus } from 'lucide-react';
import { getPosterUrl } from '../utils/imageUtils';
import { useAuth } from '../context/AuthContext';

export default function HeroBanner({ movie, onOpenDetail, onOpenAuthModal }) {
  const { currentUser } = useAuth();
  if (!movie) return null;

  const posterUrl = getPosterUrl(movie);
  const releaseYear = movie.releaseDate ? movie.releaseDate.split('-')[0] : '2010';

  return (
    <div className="relative w-full rounded-2xl overflow-hidden border shadow-2xl mb-10 transition-all
      border-lbBeige-border dark:border-lbDark-border">
      
      {/* Background with cinematic gradient */}
      <div className="absolute inset-0 bg-black">
        <img
          src={posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover opacity-35 filter brightness-75 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-transparent" />
      </div>

      {/* Hero Content */}
      <div className="relative z-10 px-6 sm:px-12 py-12 sm:py-16 max-w-3xl text-white">
        
        {/* Top Tag */}
        <div className="flex items-center gap-2 mb-3">
          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest bg-brand-green text-black flex items-center gap-1 shadow-sm">
            <Sparkles className="w-3 h-3" /> Featured Premiere
          </span>
          {movie.voteAverage && (
            <span className="flex items-center gap-1 text-xs font-bold font-mono px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-amber-400">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {movie.voteAverage.toFixed(1)} / 10
            </span>
          )}
          <span className="text-xs font-mono text-zinc-400">{releaseYear}</span>
        </div>

        {/* Title */}
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
          {movie.title}
        </h1>

        {/* Tagline or Overview */}
        <p className="mt-2 text-xs sm:text-sm text-zinc-300 font-sans line-clamp-3 leading-relaxed max-w-2xl">
          {movie.tagline ? `"${movie.tagline}" — ` : ''}{movie.overview}
        </p>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            onClick={() => onOpenDetail(movie.id)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-brand-green text-black hover:bg-emerald-400 active:scale-95 transition-all shadow-lg"
          >
            <Info className="w-4 h-4" />
            Film Details & Cast
          </button>

          {!currentUser && (
            <button
              onClick={onOpenAuthModal}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/20 active:scale-95 transition-all"
            >
              <UserPlus className="w-4 h-4 text-brand-green" />
              Sign In / Sign Up
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
