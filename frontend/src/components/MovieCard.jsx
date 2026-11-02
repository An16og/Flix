import React, { useState } from 'react';
import { Star, Eye, Bookmark, Sparkles, Check, Film } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { activityApi } from '../api/client';
import { getPosterUrl } from '../utils/imageUtils';

export default function MovieCard({ 
  movie, 
  onClick, 
  similarityScore, 
  isWatched = false, 
  isInWatchlist = false,
  onActivityChanged 
}) {
  const { currentUser } = useAuth();
  const [watched, setWatched] = useState(isWatched);
  const [inWatchlist, setInWatchlist] = useState(isInWatchlist);
  const [actionLoading, setActionLoading] = useState(false);
  const [imgError, setImgError] = useState(false);

  // Safe poster resolution
  const posterUrl = getPosterUrl(movie);

  // Extract year from release date if string
  const releaseYear = movie.releaseDate 
    ? movie.releaseDate.split('-')[0] 
    : (movie.release_date ? movie.release_date.split('-')[0] : null);

  const voteAverage = movie.voteAverage || movie.vote_average || 0;

  // Primary genre for styling
  const genreList = Array.isArray(movie.genres) ? movie.genres : [];
  const primaryGenre = genreList.length > 0 ? genreList[0] : null;

  const handleToggleWatched = async (e) => {
    e.stopPropagation();
    if (!currentUser?.id || actionLoading) return;
    setActionLoading(true);
    try {
      await activityApi.markAsWatched(currentUser.id, movie.id);
      setWatched(true);
      if (onActivityChanged) onActivityChanged();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleWatchlist = async (e) => {
    e.stopPropagation();
    if (!currentUser?.id || actionLoading) return;
    setActionLoading(true);
    try {
      if (inWatchlist) {
        await activityApi.removeFromWatchlist(currentUser.id, movie.id);
        setInWatchlist(false);
      } else {
        await activityApi.addToWatchlist(currentUser.id, movie.id);
        setInWatchlist(true);
      }
      if (onActivityChanged) onActivityChanged();
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div
      onClick={() => onClick && onClick(movie)}
      className="group relative cursor-pointer flex flex-col transition-all duration-300 focus:outline-none"
    >
      {/* Poster Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden rounded-lg border transition-all duration-300
        bg-lbBeige-surface border-lbBeige-border dark:bg-lbDark-surface dark:border-lbDark-border 
        group-hover:border-brand-rust dark:group-hover:border-brand-green 
        group-hover:shadow-[0_8px_25px_-6px_rgba(191,83,44,0.3)] dark:group-hover:shadow-[0_8px_25px_-6px_rgba(0,224,84,0.3)]">
        
        {!imgError ? (
          <img
            src={posterUrl}
            alt={movie.title}
            loading="lazy"
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
            onError={() => setImgError(true)}
          />
        ) : (
          /* Typographic Letterboxd Art Poster when CDN image is missing/404 */
          <div className="w-full h-full flex flex-col justify-between p-3.5 bg-gradient-to-br from-zinc-800 via-zinc-900 to-black text-white select-none">
            <div className="flex items-center justify-between">
              <span className="p-1 rounded bg-white/10 text-white/70">
                <Film className="w-3.5 h-3.5" />
              </span>
              {releaseYear && (
                <span className="font-mono text-[10px] text-zinc-400 font-semibold tracking-wider">
                  {releaseYear}
                </span>
              )}
            </div>

            <div className="my-auto py-2">
              <h3 className="font-serif font-extrabold text-sm sm:text-base leading-tight tracking-tight line-clamp-3 text-zinc-100">
                {movie.title}
              </h3>
              {primaryGenre && (
                <span className="inline-block mt-2 text-[9px] font-semibold uppercase tracking-widest px-1.5 py-0.5 rounded bg-brand-green/20 text-brand-green border border-brand-green/30">
                  {primaryGenre}
                </span>
              )}
            </div>

            <div className="flex items-center justify-between text-[10px] font-mono text-zinc-400 border-t border-white/10 pt-1.5">
              <span>Flix Cinema</span>
              {voteAverage > 0 && (
                <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                  ★ {voteAverage.toFixed(1)}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Hover Overlay with Quick Actions */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-between p-2.5">
          
          {/* Top Badges (Similarity / Year) */}
          <div className="flex items-center justify-between w-full">
            {similarityScore ? (
              <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-brand-green/90 text-black shadow-sm">
                <Sparkles className="w-2.5 h-2.5" />
                {Math.round(similarityScore * 100)}% match
              </span>
            ) : releaseYear ? (
              <span className="text-[10px] font-mono font-medium px-1.5 py-0.5 rounded bg-black/60 text-white/90 backdrop-blur-sm">
                {releaseYear}
              </span>
            ) : <span />}

            {/* Rating Pill */}
            {voteAverage > 0 && (
              <div className="flex items-center gap-1 text-[11px] font-bold px-1.5 py-0.5 rounded bg-amber-400 text-black shadow-sm">
                <Star className="w-3 h-3 fill-black text-black" />
                <span>{voteAverage.toFixed(1)}</span>
              </div>
            )}
          </div>

          {/* Bottom Quick Action Icons */}
          <div className="flex items-center justify-end gap-1.5">
            <button
              title={watched ? "Watched" : "Mark as Watched"}
              onClick={handleToggleWatched}
              className={`p-1.5 rounded-full backdrop-blur-md transition-all ${
                watched
                  ? 'bg-brand-green text-black scale-110'
                  : 'bg-black/60 text-white/80 hover:bg-brand-green hover:text-black'
              }`}
            >
              {watched ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Eye className="w-3.5 h-3.5" />}
            </button>

            <button
              title={inWatchlist ? "Remove from Watchlist" : "Add to Watchlist"}
              onClick={handleToggleWatchlist}
              className={`p-1.5 rounded-full backdrop-blur-md transition-all ${
                inWatchlist
                  ? 'bg-amber-400 text-black scale-110'
                  : 'bg-black/60 text-white/80 hover:bg-amber-400 hover:text-black'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

      </div>

      {/* Title & Metadata below card */}
      <div className="mt-1.5 px-0.5">
        <h4 className="text-xs font-semibold leading-snug truncate transition-colors
          text-lbBeige-textMain group-hover:text-brand-rust
          dark:text-lbDark-textMain dark:group-hover:text-brand-green">
          {movie.title}
        </h4>
        <div className="flex items-center justify-between text-[11px] mt-0.5 
          text-lbBeige-textMuted dark:text-lbDark-textMuted">
          <span>{releaseYear || 'Cinema'}</span>
          {voteAverage > 0 && (
            <span className="flex items-center gap-0.5 font-medium">
              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
              {voteAverage.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
