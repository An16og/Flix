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
  Sparkles,
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
      dark:bg-lbDark-bg/95 dark:border-lbDark-border dark:text-lbDark-textMain">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Brand */}
          <div className="flex items-center gap-8">
            <button 
              onClick={() => setActiveTab('home')}
              className="flex items-center gap-2.5 group focus:outline-none"
            >
              {/* Letterboxd-style multi-color dots */}
              <div className="flex items-center -space-x-1.5">
                <span className="w-3.5 h-3.5 rounded-full bg-brand-orange ring-2 ring-lbBeige-bg dark:ring-lbDark-bg shadow-sm" />
                <span className="w-3.5 h-3.5 rounded-full bg-brand-green ring-2 ring-lbBeige-bg dark:ring-lbDark-bg shadow-sm" />
                <span className="w-3.5 h-3.5 rounded-full bg-brand-blue ring-2 ring-lbBeige-bg dark:ring-lbDark-bg shadow-sm" />
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
                    ? 'bg-lbBeige-surface text-brand-rust dark:bg-lbDark-surface dark:text-brand-green shadow-sm'
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
                    ? 'bg-lbBeige-surface text-brand-rust dark:bg-lbDark-surface dark:text-brand-green shadow-sm'
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
                    ? 'bg-lbBeige-surface text-brand-rust dark:bg-lbDark-surface dark:text-brand-green shadow-sm'
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
              title={theme === 'dark' ? 'Switch to Editorial Beige' : 'Switch to Letterboxd Dark'}
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="w-4 h-4 text-amber-400" />
              ) : (
                <Moon className="w-4 h-4 text-zinc-600" />
              )}
            </button>

            {/* User Dropdown or Sign In */}
            {currentUser ? (
              <div className="relative">
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl border transition-all active:scale-95
                    bg-lbBeige-surface border-lbBeige-border hover:border-brand-rust
                    dark:bg-lbDark-surface dark:border-lbDark-border dark:hover:border-brand-green"
                >
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs bg-brand-green text-black">
                    {initials}
                  </div>
                  <span className="hidden sm:inline text-xs font-bold">
                    {currentUser.username}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                </button>

                {dropdownOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-48 rounded-2xl shadow-xl border p-1.5 z-50 text-xs
                      bg-lbBeige-surface border-lbBeige-border text-lbBeige-textMain
                      dark:bg-lbDark-surface dark:border-lbDark-border dark:text-lbDark-textMain"
                    onMouseLeave={() => setDropdownOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-lbBeige-border/50 dark:border-lbDark-border/50">
                      <p className="font-bold truncate">{currentUser.username}</p>
                      <p className="text-[11px] text-lbBeige-textMuted dark:text-lbDark-textMuted truncate font-mono">
                        {currentUser.email}
                      </p>
                    </div>

                    <button
                      onClick={() => { setActiveTab('profile'); setDropdownOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left hover:bg-lbBeige-hover dark:hover:bg-lbDark-hover mt-1"
                    >
                      <User className="w-3.5 h-3.5" />
                      View Profile & Stats
                    </button>

                    <button
                      onClick={() => { logout(); setDropdownOpen(false); }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-red-500 hover:bg-red-500/10 mt-1"
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
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-sm active:scale-95
                  bg-brand-rust text-white hover:bg-orange-600
                  dark:bg-brand-green dark:text-black dark:hover:bg-emerald-400"
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
