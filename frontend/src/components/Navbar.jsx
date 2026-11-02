import React, { useState } from 'react';
import { 
  Search, 
  Sparkles, 
  Moon, 
  Sun, 
  Bookmark, 
  Eye, 
  LogOut, 
  ChevronDown,
  Flame,
  Trophy,
  Compass,
  UserPlus,
  LogIn
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  searchQuery, 
  setSearchQuery, 
  onSearchSubmit,
  onOpenAuthModal,
  onOpenMovieDetail
}) {
  const { theme, toggleTheme } = useTheme();
  const { currentUser, logout } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchInput, setSearchInput] = useState(searchQuery || '');

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchQuery(searchInput.trim());
      setActiveTab('search');
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md border-b transition-colors duration-200
      bg-lbBeige-bg/95 border-lbBeige-border text-lbBeige-textMain
      dark:bg-lbDark-bg/95 dark:border-lbDark-border dark:text-lbDark-textMain">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-6">
            <button 
              onClick={() => { setActiveTab('explore'); setSearchQuery(''); }}
              className="flex items-center gap-2.5 group focus:outline-none"
            >
              <div className="flex items-center -space-x-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-brand-orange ring-2 ring-lbBeige-bg dark:ring-lbDark-bg shadow-sm" />
                <span className="w-3.5 h-3.5 rounded-full bg-brand-green ring-2 ring-lbBeige-bg dark:ring-lbDark-bg shadow-sm" />
                <span className="w-3.5 h-3.5 rounded-full bg-brand-blue ring-2 ring-lbBeige-bg dark:ring-lbDark-bg shadow-sm" />
              </div>
              <span className="font-extrabold tracking-wider text-xl uppercase font-sans">
                Flix
              </span>
            </button>

            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <button
                onClick={() => setActiveTab('explore')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all ${
                  activeTab === 'explore'
                    ? 'bg-lbBeige-hover text-black dark:bg-lbDark-hover dark:text-white font-bold'
                    : 'text-lbBeige-textMuted hover:text-black dark:text-lbDark-textMuted dark:hover:text-white'
                }`}
              >
                <Compass className="w-3.5 h-3.5" />
                Explore
              </button>

              <button
                onClick={() => setActiveTab('recommendations')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all ${
                  activeTab === 'recommendations'
                    ? 'bg-lbBeige-hover text-brand-rust dark:bg-lbDark-hover dark:text-brand-green font-bold'
                    : 'text-lbBeige-textMuted hover:text-brand-rust dark:text-lbDark-textMuted dark:hover:text-brand-green'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-brand-green" />
                For You
              </button>

              <button
                onClick={() => setActiveTab('trending')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all ${
                  activeTab === 'trending'
                    ? 'bg-lbBeige-hover text-black dark:bg-lbDark-hover dark:text-white font-bold'
                    : 'text-lbBeige-textMuted hover:text-black dark:text-lbDark-textMuted dark:hover:text-white'
                }`}
              >
                <Flame className="w-3.5 h-3.5 text-brand-orange" />
                Trending
              </button>

              <button
                onClick={() => setActiveTab('top-rated')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold uppercase tracking-wider transition-all ${
                  activeTab === 'top-rated'
                    ? 'bg-lbBeige-hover text-black dark:bg-lbDark-hover dark:text-white font-bold'
                    : 'text-lbBeige-textMuted hover:text-black dark:text-lbDark-textMuted dark:hover:text-white'
                }`}
              >
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                Top Rated
              </button>
            </nav>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-md mx-2 hidden sm:block">
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-lbBeige-textMuted dark:text-lbDark-textMuted" />
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search movies, genres, or directors..."
                className="w-full pl-9 pr-4 py-1.5 rounded-full text-xs font-medium transition-all focus:outline-none focus:ring-1 
                  bg-lbBeige-surface border border-lbBeige-border focus:border-brand-rust text-lbBeige-textMain placeholder:text-lbBeige-textMuted
                  dark:bg-lbDark-surface dark:border-lbDark-border dark:focus:border-brand-green dark:text-white placeholder:dark:text-lbDark-textMuted"
              />
            </form>
          </div>

          {/* Right Controls: Theme Switcher & User Auth */}
          <div className="flex items-center gap-3">
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              title={theme === 'dark' ? 'Switch to Editorial Beige' : 'Switch to Letterboxd Dark'}
              className="p-2 rounded-lg border transition-all text-xs flex items-center gap-1.5
                border-lbBeige-border bg-lbBeige-surface text-lbBeige-textMuted hover:text-black hover:border-zinc-400
                dark:border-lbDark-border dark:bg-lbDark-surface dark:text-lbDark-textMuted dark:hover:text-white dark:hover:border-zinc-400"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-4 h-4 text-amber-400" />
                  <span className="hidden xl:inline font-mono text-[11px]">Beige</span>
                </>
              ) : (
                <>
                  <Moon className="w-4 h-4 text-cyan-600" />
                  <span className="hidden xl:inline font-mono text-[11px]">Slate</span>
                </>
              )}
            </button>

            {/* User Profile / Menu or Sign In */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center gap-2 p-1 pl-2 rounded-full border transition-all
                    border-lbBeige-border bg-lbBeige-surface hover:border-zinc-400
                    dark:border-lbDark-border dark:bg-lbDark-surface dark:hover:border-zinc-400"
                >
                  <img
                    src={currentUser.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80'}
                    alt={currentUser.name || currentUser.username}
                    className="w-6 h-6 rounded-full object-cover ring-1 ring-brand-green"
                  />
                  <span className="text-xs font-bold hidden sm:inline max-w-[90px] truncate">
                    {currentUser.name ? currentUser.name.split(' ')[0] : currentUser.username}
                  </span>
                  <ChevronDown className="w-3 h-3 text-lbBeige-textMuted dark:text-lbDark-textMuted mr-1" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-64 rounded-xl shadow-2xl border p-2 z-50 animate-in fade-in slide-in-from-top-2
                      bg-lbBeige-surface border-lbBeige-border text-lbBeige-textMain
                      dark:bg-lbDark-surface dark:border-lbDark-border dark:text-lbDark-textMain"
                  >
                    <div className="p-3 border-b border-lbBeige-border dark:border-lbDark-border">
                      <div className="flex items-center gap-2">
                        <img
                          src={currentUser.avatar}
                          alt="avatar"
                          className="w-9 h-9 rounded-full object-cover ring-1 ring-brand-green"
                        />
                        <div className="truncate">
                          <p className="font-bold text-xs truncate">{currentUser.name || currentUser.username}</p>
                          <p className="text-[11px] text-lbBeige-textMuted dark:text-lbDark-textMuted truncate">{currentUser.email}</p>
                        </div>
                      </div>
                      {currentUser.badge && (
                        <span className={`mt-2 inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full border ${currentUser.badgeColor || 'border-zinc-500/20'}`}>
                          {currentUser.badge}
                        </span>
                      )}
                    </div>

                    <div className="py-1">
                      <button
                        onClick={() => { setActiveTab('profile'); setUserDropdownOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors
                          hover:bg-lbBeige-hover dark:hover:bg-lbDark-hover"
                      >
                        <Eye className="w-4 h-4 text-brand-blue" />
                        My Film Diary & Watched
                      </button>

                      <button
                        onClick={() => { setActiveTab('watchlist'); setUserDropdownOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors
                          hover:bg-lbBeige-hover dark:hover:bg-lbDark-hover"
                      >
                        <Bookmark className="w-4 h-4 text-amber-500" />
                        Watchlist
                      </button>

                      <button
                        onClick={() => { setActiveTab('recommendations'); setUserDropdownOpen(false); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium rounded-lg transition-colors
                          hover:bg-lbBeige-hover dark:hover:bg-lbDark-hover"
                      >
                        <Sparkles className="w-4 h-4 text-brand-green" />
                        Personalized Recommendations
                      </button>
                    </div>

                    <div className="border-t pt-1 border-lbBeige-border dark:border-lbDark-border">
                      <button
                        onClick={() => { logout(); setUserDropdownOpen(false); }}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-500 rounded-lg hover:bg-rose-500/10 transition-colors font-semibold"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuthModal('login')}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all border border-lbBeige-border dark:border-lbDark-border hover:bg-lbBeige-hover dark:hover:bg-lbDark-hover"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onOpenAuthModal('register')}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-brand-green text-black hover:bg-emerald-400"
                >
                  Sign Up
                </button>
              </div>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
