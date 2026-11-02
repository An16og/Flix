import React from 'react';
import { Database, Moon, Sun, Film } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function Footer() {
  const { theme, toggleTheme } = useTheme();

  return (
    <footer className="mt-20 border-t transition-colors duration-200
      bg-lbBeige-surface/60 border-lbBeige-border text-lbBeige-textMuted
      dark:bg-lbDark-surface/60 dark:border-lbDark-border dark:text-lbDark-textMuted">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Brand Info */}
          <div className="flex flex-col items-center md:items-start">
            <div className="flex items-center gap-2">
              <Film className="w-4 h-4 text-brand-rust dark:text-amber-400" />
              <span className="font-extrabold text-sm tracking-wider uppercase text-black dark:text-white">
                Flix Cinema
              </span>
            </div>
            <p className="text-[11px] mt-1 text-center md:text-left">
              Cinematic exploration & tailored recommendations designed for film lovers.
            </p>
          </div>

          {/* Controls & API status */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-medium">
            <button
              onClick={toggleTheme}
              className="flex items-center gap-1.5 hover:opacity-80 transition-opacity"
            >
              {theme === 'dark' ? (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400" />
                  <span>Theme: Slate Dark</span>
                </>
              ) : (
                <>
                  <Moon className="w-3.5 h-3.5 text-stone-700" />
                  <span>Theme: Beige Editorial</span>
                </>
              )}
            </button>

            <span className="text-zinc-400 dark:text-zinc-600">•</span>

            <div className="flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-amber-400" />
              <span className="font-mono text-[11px]">System Ready</span>
            </div>
          </div>

        </div>

        <div className="mt-6 pt-6 border-t text-center text-[10px] border-lbBeige-border dark:border-lbDark-border">
          Designed with minimal cinema aesthetics for movie lovers.
        </div>
      </div>
    </footer>
  );
}
