import React, { useState, useEffect } from 'react';
import { 
  Bookmark, 
  Eye, 
  Star, 
  User, 
  Sparkles, 
  Film, 
  LogOut, 
  Clock, 
  Award, 
  TrendingUp,
  UserCheck
} from 'lucide-react';
import MovieCard from './MovieCard';
import { activityApi } from '../api/client';
import { useAuth } from '../context/AuthContext';

const DEMO_PERSONAS = [
  { id: 1, name: 'Maya Lin', email: 'maya.lin@example.com', taste: 'Sci-Fi Specialist', badge: 'Sci-Fi' },
  { id: 5, name: 'Alex Vance', email: 'alex.vance@example.com', taste: 'Horror & Suspense Buff', badge: 'Horror' },
  { id: 2, name: 'Chloe Dubois', email: 'chloe.dubois@example.com', taste: 'Animation & Pixar Lover', badge: 'Animation' },
  { id: 3, name: 'Marcus Chen', email: 'marcus.chen@example.com', taste: 'Crime & Mob Cinema Purist', badge: 'Crime' },
  { id: 4, name: 'Liam O\'Connor', email: 'liam.oconnor@example.com', taste: 'Romance & Heartfelt Epics', badge: 'Romance' }
];

export default function ProfileView({ onMovieClick, onOpenAuthModal }) {
  const { currentUser, login, logout } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState('watchlist'); // 'watchlist' | 'watched'
  const [watchlist, setWatchlist] = useState([]);
  const [watched, setWatched] = useState([]);
  const [loading, setLoading] = useState(false);
  const [switchingPersona, setSwitchingPersona] = useState(false);

  useEffect(() => {
    if (currentUser?.id) {
      loadUserData(currentUser.id);
    }
  }, [currentUser]);

  const loadUserData = async (userId) => {
    setLoading(true);
    try {
      const [wl, wt] = await Promise.all([
        activityApi.getWatchlist(userId).catch(() => []),
        activityApi.getWatched(userId).catch(() => [])
      ]);
      setWatchlist(wl || []);
      setWatched(wt || []);
    } catch (err) {
      console.error('Error loading user profile lists', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchPersona = async (persona) => {
    setSwitchingPersona(true);
    try {
      await login(persona.email, 'password123');
    } catch (e) {
      console.error(e);
    } finally {
      setSwitchingPersona(false);
    }
  };

  const handleActivityChanged = () => {
    if (currentUser?.id) {
      loadUserData(currentUser.id);
    }
  };

  // Determine user taste badge
  const email = currentUser?.email?.toLowerCase() || '';
  let tasteTitle = 'Cinema Connoisseur';
  if (email.includes('maya') || email.includes('alice')) tasteTitle = 'Sci-Fi & Cyberpunk Specialist';
  else if (email.includes('alex') || email.includes('ethan')) tasteTitle = 'Horror & Psychological Thriller';
  else if (email.includes('chloe') || email.includes('bob')) tasteTitle = 'Pixar & Animation Enthusiast';
  else if (email.includes('marcus') || email.includes('charlie')) tasteTitle = 'Neo-Noir & Mob Cinema Purist';
  else if (email.includes('liam') || email.includes('diana')) tasteTitle = 'Romantic Drama & Classics';

  if (!currentUser) {
    return (
      <div className="py-12 max-w-4xl mx-auto text-center pb-24">
        <div className="p-10 rounded-2xl border bg-lbBeige-surface border-lbBeige-border dark:bg-lbDark-surface dark:border-lbDark-border shadow-xl">
          <User className="w-12 h-12 mx-auto text-amber-400 mb-4" />
          <h2 className="text-2xl font-black text-lbBeige-textMain dark:text-lbDark-textMain mb-2">
            Welcome to Your Flix Profile
          </h2>
          <p className="text-sm text-lbBeige-textMuted dark:text-lbDark-textMuted max-w-md mx-auto mb-8">
            Sign in or choose one of our demonstration personas to preview your personalized watchlist, logging history, and tailored recommendations.
          </p>

          <button
            onClick={() => onOpenAuthModal && onOpenAuthModal('login')}
            className="px-6 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-amber-400 text-black hover:bg-amber-300 active:scale-95 transition-all shadow-md mb-8"
          >
            Sign In / Register
          </button>

          <div className="pt-8 border-t border-lbBeige-border dark:border-lbDark-border text-left">
            <p className="text-xs font-bold uppercase tracking-wider text-lbBeige-textMuted dark:text-lbDark-textMuted mb-4 text-center">
              Or Instant 1-Click Demo Personas:
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {DEMO_PERSONAS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSwitchPersona(p)}
                  className="p-3.5 rounded-xl border text-left transition-all active:scale-95 hover:border-amber-400
                    bg-lbBeige-bg border-lbBeige-border dark:bg-lbDark-bg dark:border-lbDark-border"
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-lbBeige-textMain dark:text-lbDark-textMain">
                      {p.name}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-400/20 text-amber-400">
                      {p.badge}
                    </span>
                  </div>
                  <p className="text-xs text-lbBeige-textMuted dark:text-lbDark-textMuted">
                    {p.taste}
                  </p>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const initials = currentUser.username
    ? currentUser.username.substring(0, 2).toUpperCase()
    : 'FX';

  return (
    <div className="py-6 max-w-6xl mx-auto pb-24">
      
      {/* Profile Header Card */}
      <div className="p-6 sm:p-8 rounded-2xl border mb-8 bg-lbBeige-surface border-lbBeige-border dark:bg-lbDark-surface dark:border-lbDark-border shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          
          {/* User Details */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-extrabold text-xl text-black bg-gradient-to-tr from-amber-400 via-amber-500 to-amber-300 shadow-md ring-4 ring-amber-400/20">
              {initials}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-black tracking-tight text-lbBeige-textMain dark:text-lbDark-textMain">
                  {currentUser.username}
                </h1>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-400/15 text-amber-400 border border-amber-400/30">
                  {tasteTitle}
                </span>
              </div>
              <p className="text-xs text-lbBeige-textMuted dark:text-lbDark-textMuted mt-0.5 font-mono">
                {currentUser.email}
              </p>
            </div>
          </div>

          {/* Stats Badges */}
          <div className="flex items-center gap-4 sm:gap-6 border-t sm:border-t-0 sm:border-l border-lbBeige-border dark:border-lbDark-border pt-4 sm:pt-0 sm:pl-6">
            <div className="text-center">
              <span className="block text-2xl font-black text-lbBeige-textMain dark:text-lbDark-textMain font-mono">
                {watchlist.length}
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-lbBeige-textMuted dark:text-lbDark-textMuted flex items-center gap-1">
                <Bookmark className="w-3 h-3 text-brand-orange" /> Watchlist
              </span>
            </div>

            <div className="text-center">
              <span className="block text-2xl font-black text-lbBeige-textMain dark:text-lbDark-textMain font-mono">
                {watched.length}
              </span>
              <span className="text-[11px] font-bold uppercase tracking-wider text-lbBeige-textMuted dark:text-lbDark-textMuted flex items-center gap-1">
                <Eye className="w-3 h-3 text-amber-400" /> Watched
              </span>
            </div>

            <button
              onClick={logout}
              className="p-2.5 rounded-xl border text-lbBeige-textMuted hover:text-red-500 hover:border-red-500/50 dark:text-lbDark-textMuted dark:hover:text-red-400 transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>

        </div>

        {/* 1-Click Demo Persona Switcher */}
        <div className="mt-6 pt-5 border-t border-lbBeige-border/60 dark:border-lbDark-border/60">
          <p className="text-[11px] font-bold uppercase tracking-wider text-lbBeige-textMuted dark:text-lbDark-textMuted mb-2 flex items-center gap-1.5">
            <UserCheck className="w-3.5 h-3.5 text-amber-400" /> Quick Switch Demonstration Persona:
          </p>
          <div className="flex flex-wrap gap-2">
            {DEMO_PERSONAS.map((p) => {
              const isSelected = currentUser?.email === p.email;
              return (
                <button
                  key={p.id}
                  onClick={() => handleSwitchPersona(p)}
                  disabled={switchingPersona || isSelected}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-brand-rust text-white dark:bg-amber-400 dark:text-black shadow-md font-bold'
                      : 'bg-lbBeige-bg border border-lbBeige-border text-lbBeige-textMain hover:border-amber-400 dark:bg-lbDark-bg dark:border-lbDark-border dark:text-lbDark-textMain dark:hover:border-amber-400/50'
                  }`}
                >
                  <span>{p.name}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-black/20 text-white dark:text-black' : 'bg-white/10 text-zinc-400'}`}>
                    {p.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

      </div>

      {/* Sub Tabs: Watchlist vs Watched */}
      <div className="flex items-center gap-2 mb-6 border-b border-lbBeige-border dark:border-lbDark-border pb-3">
        <button
          onClick={() => setActiveSubTab('watchlist')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
            activeSubTab === 'watchlist'
              ? 'bg-brand-rust text-white dark:bg-amber-400 dark:text-black shadow-sm'
              : 'text-lbBeige-textMuted hover:text-black dark:text-lbDark-textMuted dark:hover:text-white'
          }`}
        >
          <Bookmark className="w-3.5 h-3.5" />
          Watchlist ({watchlist.length})
        </button>

        <button
          onClick={() => setActiveSubTab('watched')}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
            activeSubTab === 'watched'
              ? 'bg-brand-rust text-white dark:bg-amber-400 dark:text-black shadow-sm'
              : 'text-lbBeige-textMuted hover:text-black dark:text-lbDark-textMuted dark:hover:text-white'
          }`}
        >
          <Eye className="w-3.5 h-3.5" />
          Watched History ({watched.length})
        </button>
      </div>

      {/* Sub Tab Content */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] rounded-xl animate-pulse bg-lbBeige-surface/60 dark:bg-lbDark-surface/60 border border-lbBeige-border/40 dark:border-lbDark-border/40"
            />
          ))}
        </div>
      ) : activeSubTab === 'watchlist' ? (
        watchlist.length === 0 ? (
          <div className="py-16 text-center rounded-2xl border border-dashed border-lbBeige-border dark:border-lbDark-border">
            <Bookmark className="w-8 h-8 mx-auto text-lbBeige-textMuted dark:text-lbDark-textMuted mb-2 opacity-50" />
            <p className="text-sm font-semibold text-lbBeige-textMain dark:text-lbDark-textMain">
              Your watchlist is empty.
            </p>
            <p className="text-xs text-lbBeige-textMuted dark:text-lbDark-textMuted mt-1">
              Click "+ Watchlist" on any movie card or detail modal to save titles you want to watch.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {watchlist.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                isInWatchlist={true}
                onActivityChanged={handleActivityChanged}
                onClick={() => onMovieClick && onMovieClick(movie.id)}
              />
            ))}
          </div>
        )
      ) : (
        watched.length === 0 ? (
          <div className="py-16 text-center rounded-2xl border border-dashed border-lbBeige-border dark:border-lbDark-border">
            <Eye className="w-8 h-8 mx-auto text-lbBeige-textMuted dark:text-lbDark-textMuted mb-2 opacity-50" />
            <p className="text-sm font-semibold text-lbBeige-textMain dark:text-lbDark-textMain">
              No watched movies logged yet.
            </p>
            <p className="text-xs text-lbBeige-textMuted dark:text-lbDark-textMuted mt-1">
              Mark films as watched to calibrate your personalized recommendation profile.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {watched.map((movie) => (
              <MovieCard
                key={movie.id}
                movie={movie}
                isWatched={true}
                onActivityChanged={handleActivityChanged}
                onClick={() => onMovieClick && onMovieClick(movie.id)}
              />
            ))}
          </div>
        )
      )}

    </div>
  );
}
