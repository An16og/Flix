import React from 'react';
import { Database, Moon, Sun } from 'lucide-react';
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
              <div className="flex items-center -space-x-1">
                <span className="w-2.5 h-2.5 rounded-full bg-brand-orange" />
                <span className="w-2.5 h-2.5 rounded-full bg-brand-green" />
                <span className="w-2.5 h-2.5 rounded-full bg-brand-blue" />
              </div>
              <span className="font-extrabold text-sm tracking-wider uppercase text-black dark:text-white">
                Flix Recommendation System
              </span>
            </div>
            <p className="text-[11px] mt-1 text-center md:text-left">
              Cinematic exploration powered by PostgreSQL 18, pgvector & Gemini 768-d Centroid Embeddings.
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
                  <Moon className="w-3.5 h-3.5 text-cyan-600" />
                  <span>Theme: Beige Editorial</span>
                </>
              )}
            </button>

            <span className="text-zinc-400 dark:text-zinc-600">•</span>

            <div className="flex items-center gap-1">
              <Database className="w-3.5 h-3.5 text-emerald-500" />
              <span className="font-mono text-[11px]">API: localhost:8081</span>
            </div>
          </div>

        </div>

        <div className="mt-6 pt-6 border-t text-center text-[10px] border-lbBeige-border dark:border-lbDark-border">
          Built with Spring Boot 4, PostgreSQL pgvector & React. Designed with minimal Letterboxd aesthetics for movie lovers.
        </div>
      </div>
    </footer>
  );
}
