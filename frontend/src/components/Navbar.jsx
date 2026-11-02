import React, { useState } from 'react';
import { 
  Compass, 
  Search, 
  User, 
  Moon, 
  Sun, 
  Bookmark, 
  Eye, 
  LogOut, 
  ChevronDown,
  Film,
  LogIn
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  onOpenAuthModal 
}) {
  const { theme, toggleTheme } = useTheme();
  const { currentUser, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const initials = currentUser?.username
    ? currentUser.username.substring(0, 2).toUpperCase()
    : 'U';

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-md border-b transition-colors duration-200
      bg-lbBeige-bg/95 border-lbBeige-border text-lbBeige-textMain
      dark:bg-lbDark-bg/95 dark:border-lbDark-border/80 dark:text-lbDark-textMain">
      
      {/* Subtle top gold shimmer line */}
      <div className="h-[1.5px] w-full bg-gradient-to-r from-transparent via-amber-400/40 to-transparent" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <button 
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-2.5 group focus:outline-none"
            >
              {/* Cinema Brand Logo */}
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-brand-rust text-white dark:bg-amber-400 dark:text-black shadow-md group-hover:scale-105 transition-transform">
                <Film className="w-4 h-4" />
              </div>
              <span className="font-black tracking-wider text-xl uppercase font-sans">
                Flix
              </span>
            </button>

            {/* Main Primary Navigation Tabs: Home, Search, Profile */}
            <nav className="flex items-center gap-1.5">
              <button
                onClick={() => setActiveTab('home')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === 'home'
                    ? 'bg-lbBeige-surface text-brand-rust dark:bg-lbDark-surface dark:text-amber-400 border border-amber-400/20 shadow-sm'
                    : 'text-lbBeige-textMuted hover:text-black dark:text-lbDark-textMuted dark:hover:text-white'
                }`}
              >
                <Compass className="w-4 h-4" />
                Home
              </button>

              <button
                onClick={() => setActiveTab('search')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === 'search'
                    ? 'bg-lbBeige-surface text-brand-rust dark:bg-lbDark-surface dark:text-amber-400 border border-amber-400/20 shadow-sm'
                    : 'text-lbBeige-textMuted hover:text-black dark:text-lbDark-textMuted dark:hover:text-white'
                }`}
              >
                <Search className="w-4 h-4" />
                Search
              </button>

              <button
                onClick={() => setActiveTab('profile')}
                className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${
                  activeTab === 'profile'
                    ? 'bg-lbBeige-surface text-brand-rust dark:bg-lbDark-surface dark:text-amber-400 border border-amber-400/20 shadow-sm'
                    : 'text-lbBeige-textMuted hover:text-black dark:text-lbDark-textMuted dark:hover:text-white'
                }`}
              >
                <User className="w-4 h-4" />
                Profile
              </button>
            </nav>
          </div>

          {/* Right Controls: Theme Switch & User Account */}
          <div className="flex items-center gap-3">
            
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-xl border transition-all text-lbBeige-textMuted hover:text-black dark:text-lbDark-textMuted dark:hover:text-white
                bg-lbBeige-surface border-lbBeige-border dark:bg-lbDark-surface dark:border-lbDark-border"
              title={`Switch to ${theme === 'dark' ? 'Beige' : 'Dark'} theme`}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-stone-700" />
              )}
            </button>

            {/* User Login / Profile Pill */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-xl border transition-all
                    bg-lbBeige-surface border-lbBeige-border hover:border-brand-rust
                    dark:bg-lbDark-surface dark:border-lbDark-border dark:hover:border-amber-400/60"
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs bg-gradient-to-tr from-amber-400 to-amber-500 text-black shadow-sm">
                    {initials}
                  </div>
                  <span className="text-xs font-semibold max-w-[100px] truncate">
                    {currentUser.username}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                </button>

                {dropdownOpen && (
                  <div
                    className="absolute right-0 mt-2 w-48 rounded-xl border shadow-xl py-1.5 z-50 animate-in fade-in
                      bg-lbBeige-surface border-lbBeige-border dark:bg-lbDark-surface dark:border-lbDark-border"
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <div className="px-4 py-2 border-b border-lbBeige-border dark:border-lbDark-border">
                      <p className="text-xs font-bold truncate">{currentUser.username}</p>
                      <p className="text-[10px] text-lbBeige-textMuted dark:text-lbDark-textMuted truncate">
                        {currentUser.email}
                      </p>
                    </div>

                    <button
                      onClick={() => {
                        setActiveTab('profile');
                        setDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs flex items-center gap-2 hover:bg-lbBeige-hover dark:hover:bg-lbDark-hover"
                    >
                      <User className="w-3.5 h-3.5 text-amber-400" />
                      View Profile
                    </button>

                    <button
                      onClick={() => {
                        logout();
                        setDropdownOpen(false);
                      }}
                      className="w-full px-4 py-2 text-left text-xs flex items-center gap-2 text-red-500 hover:bg-red-500/10"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={() => onOpenAuthModal && onOpenAuthModal('login')}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all
                  bg-brand-rust text-white hover:bg-orange-600 dark:bg-amber-400 dark:text-black dark:hover:bg-amber-300 shadow-sm"
              >
                <LogIn className="w-3.5 h-3.5" />
                Sign In
              </button>
            )}

          </div>

        </div>
      </div>
    </header>
  );
}
