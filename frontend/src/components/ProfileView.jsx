import React, { useState, useEffect } from 'react';
import { Eye, Bookmark, Star, Film, LogIn } from 'lucide-react';
import { activityApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import MovieCard from './MovieCard';

export default function ProfileView({ onMovieClick, onOpenAuthModal, initialSubTab = 'watched' }) {
  const { currentUser } = useAuth();
  const [subTab, setSubTab] = useState(initialSubTab); // 'watched', 'watchlist', 'ratings'
  const [watchedList, setWatchedList] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (currentUser?.id) {
      loadUserData(currentUser.id);
    } else {
      setLoading(false);
    }
  }, [currentUser?.id]);

  const loadUserData = async (userId) => {
    setLoading(true);
    try {
      const [watchedData, watchlistData, ratingsData] = await Promise.all([
        activityApi.getWatched(userId).catch(() => []),
        activityApi.getWatchlist(userId).catch(() => []),
        activityApi.getUserRatings(userId).catch(() => [])
      ]);
      setWatchedList(watchedData || []);
      setWatchlist(watchlistData || []);
      setRatings(ratingsData || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="p-16 text-center rounded-2xl border border-lbBeige-border dark:border-lbDark-border bg-lbBeige-surface dark:bg-lbDark-surface my-8">
        <Film className="w-12 h-12 mx-auto mb-3 text-brand-green" />
        <h2 className="text-lg font-bold font-sans">Please Sign In to View Your Film Diary</h2>
        <p className="text-xs text-lbBeige-textMuted dark:text-lbDark-textMuted mt-1 mb-6">
          Log films you've watched, build your watchlist, and rate your favorites.
        </p>
        <button
          onClick={() => onOpenAuthModal('login')}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-brand-green text-black hover:bg-emerald-400"
        >
          <LogIn className="w-4 h-4" />
          Sign In
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in">
      
      {/* Profile Header */}
      <div className="p-6 sm:p-8 rounded-2xl border transition-all
        bg-lbBeige-surface border-lbBeige-border
        dark:bg-lbDark-surface dark:border-lbDark-border">
        
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <img
            src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
            alt={currentUser.name}
            className="w-24 h-24 rounded-full object-cover ring-4 ring-brand-green/30 shadow-xl"
          />

          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
              <h1 className="text-2xl font-extrabold font-sans">
                {currentUser.name || currentUser.username}
              </h1>
              {currentUser.badge && (
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${currentUser.badgeColor}`}>
                  {currentUser.badge}
                </span>
              )}
            </div>

            <p className="text-xs font-mono text-lbBeige-textMuted dark:text-lbDark-textMuted mt-1">
              {currentUser.email} • Member since {currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString() : '2026'}
            </p>

            {currentUser.bio && (
              <p className="mt-3 text-xs leading-relaxed max-w-2xl text-zinc-700 dark:text-zinc-300">
                {currentUser.bio}
              </p>
            )}

            {/* Favorite Genres */}
            {currentUser.favoriteGenres && (
              <div className="mt-4 flex flex-wrap items-center justify-center sm:justify-start gap-1.5">
                <span className="text-[11px] font-mono text-lbBeige-textMuted dark:text-lbDark-textMuted mr-1">
                  Taste:
                </span>
                {(Array.isArray(currentUser.favoriteGenres) ? currentUser.favoriteGenres : JSON.parse(currentUser.favoriteGenres || '[]')).map((g, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] font-bold px-2 py-0.5 rounded-full border
                      bg-lbBeige-card border-lbBeige-border text-zinc-800
                      dark:bg-lbDark-card dark:border-lbDark-border dark:text-zinc-200"
                  >
                    {g}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Letterboxd-style Statistics Ribbon */}
        <div className="mt-8 pt-6 border-t grid grid-cols-3 gap-4 text-center border-lbBeige-border dark:border-lbDark-border">
          <div 
            onClick={() => setSubTab('watched')}
            className={`cursor-pointer p-3 rounded-xl transition-all ${
              subTab === 'watched' ? 'bg-brand-green/10 border border-brand-green/30' : 'hover:bg-zinc-500/5'
            }`}
          >
            <div className="text-2xl font-extrabold font-mono text-brand-green">
              {watchedList.length}
            </div>
            <div className="text-xs font-semibold uppercase tracking-wider text-lbBeige-textMuted dark:text-lbDark-textMuted mt-0.5">
              Films Logged
            </div>
          </div>

          <div 
            onClick={() => setSubTab('watchlist')}
            className={`cursor-pointer p-3 rounded-xl transition-all ${
              subTab === 'watchlist' ? 'bg-amber-400/10 border border-amber-400/30' : 'hover:bg-zinc-500/5'
            }`}
          >
            <div className="text-2xl font-extrabold font-mono text-amber-500 dark:text-amber-400">
              {watchlist.length}
            </div>
            <div className="text-xs font-semibold uppercase tracking-wider text-lbBeige-textMuted dark:text-lbDark-textMuted mt-0.5">
              In Watchlist
            </div>
          </div>

          <div 
            onClick={() => setSubTab('ratings')}
            className={`cursor-pointer p-3 rounded-xl transition-all ${
              subTab === 'ratings' ? 'bg-brand-blue/10 border border-brand-blue/30' : 'hover:bg-zinc-500/5'
            }`}
          >
            <div className="text-2xl font-extrabold font-mono text-brand-blue">
              {ratings.length}
            </div>
            <div className="text-xs font-semibold uppercase tracking-wider text-lbBeige-textMuted dark:text-lbDark-textMuted mt-0.5">
              Rated & Reviewed
            </div>
          </div>
        </div>

      </div>

      {/* SubTab Navigation */}
      <div className="flex items-center gap-2 border-b border-lbBeige-border dark:border-lbDark-border pb-3">
        <button
          onClick={() => setSubTab('watched')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            subTab === 'watched'
              ? 'bg-brand-green text-black'
              : 'text-lbBeige-textMuted hover:text-black dark:text-lbDark-textMuted dark:hover:text-white'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          Watched Films ({watchedList.length})
        </button>

        <button
          onClick={() => setSubTab('watchlist')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            subTab === 'watchlist'
              ? 'bg-amber-400 text-black'
              : 'text-lbBeige-textMuted hover:text-black dark:text-lbDark-textMuted dark:hover:text-white'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          Watchlist ({watchlist.length})
        </button>

        <button
          onClick={() => setSubTab('ratings')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
            subTab === 'ratings'
              ? 'bg-brand-blue text-black'
              : 'text-lbBeige-textMuted hover:text-black dark:text-lbDark-textMuted dark:hover:text-white'
          }`}
        >
          <Star className="w-3.5 h-3.5" />
          Ratings Log ({ratings.length})
        </button>
      </div>

      {/* Tab Content */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[2/3] w-full rounded-lg bg-zinc-300 dark:bg-zinc-800/40 mb-2" />
              <div className="h-3 w-3/4 bg-zinc-300 dark:bg-zinc-800/40 rounded mb-1" />
            </div>
          ))}
        </div>
      ) : subTab === 'watched' ? (
        watchedList.length === 0 ? (
          <p className="text-xs text-center py-12 text-lbBeige-textMuted dark:text-lbDark-textMuted">
            No films marked as watched yet.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {watchedList.map((m) => (
              <MovieCard
                key={m.id}
                movie={m}
                isWatched={true}
                onClick={() => onMovieClick(m.id)}
                onActivityChanged={() => loadUserData(currentUser.id)}
              />
            ))}
          </div>
        )
      ) : subTab === 'watchlist' ? (
        watchlist.length === 0 ? (
          <p className="text-xs text-center py-12 text-lbBeige-textMuted dark:text-lbDark-textMuted">
            Your watchlist is empty. Browse movies to add films to your queue.
          </p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {watchlist.map((m) => (
              <MovieCard
                key={m.id}
                movie={m}
                isInWatchlist={true}
                onClick={() => onMovieClick(m.id)}
                onActivityChanged={() => loadUserData(currentUser.id)}
              />
            ))}
          </div>
        )
      ) : (
        ratings.length === 0 ? (
          <p className="text-xs text-center py-12 text-lbBeige-textMuted dark:text-lbDark-textMuted">
            No ratings recorded yet.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ratings.map((r, idx) => (
              <div
                key={idx}
                onClick={() => onMovieClick(r.movieId)}
                className="cursor-pointer p-4 rounded-xl border flex items-center justify-between gap-4 transition-all
                  bg-lbBeige-card border-lbBeige-border hover:border-brand-rust
                  dark:bg-lbDark-card dark:border-lbDark-border dark:hover:border-brand-green"
              >
                <div>
                  <h4 className="font-bold text-sm">{r.title || `Movie #${r.movieId}`}</h4>
                  <p className="text-[11px] text-lbBeige-textMuted dark:text-lbDark-textMuted mt-0.5">
                    Rated on {r.updatedAt ? new Date(r.updatedAt).toLocaleDateString() : 'Recent'}
                  </p>
                </div>
                <div className="flex items-center gap-1 font-mono font-bold text-sm px-2.5 py-1 rounded-lg bg-amber-400 text-black">
                  <Star className="w-3.5 h-3.5 fill-black text-black" />
                  <span>{r.rating} / 5</span>
                </div>
              </div>
            ))}
          </div>
        )
      )}

    </div>
  );
}
