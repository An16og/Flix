import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Clock, X, Trash2, Film, ArrowRight } from 'lucide-react';
import MovieCard from './MovieCard';
import { movieApi } from '../api/client';

const SUGGESTED_PROMPTS = [
  "Mind-bending time dilation and paradoxes",
  "Gritty 90s neo-noir mob crime drama",
  "Atmospheric psychological horror with twists",
  "Heartwarming Pixar animated journey",
  "Cyberpunk dystopian future with rogue AI",
  "Christopher Nolan nonlinear storytelling"
];

const RECENT_SEARCHES_KEY = 'flix_recent_searches';

export default function SearchView({ initialQuery = '', onMovieClick }) {
  const [query, setQuery] = useState(initialQuery);
  const [searchMode, setSearchMode] = useState('semantic'); // 'semantic' | 'keyword'
  const [recentSearches, setRecentSearches] = useState([]);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchedQuery, setSearchedQuery] = useState('');

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(RECENT_SEARCHES_KEY) || '[]');
      if (Array.isArray(saved)) {
        setRecentSearches(saved);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Execute initial query if provided from external trigger
  useEffect(() => {
    if (initialQuery && initialQuery.trim()) {
      setQuery(initialQuery);
      executeSearch(initialQuery.trim(), searchMode);
    }
  }, [initialQuery]);

  const saveRecentSearch = (text) => {
    if (!text || !text.trim()) return;
    const clean = text.trim();
    setRecentSearches((prev) => {
      const filtered = prev.filter((s) => s.toLowerCase() !== clean.toLowerCase());
      const updated = [clean, ...filtered].slice(0, 8); // keep last 8
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const removeRecentSearch = (e, textToRemove) => {
    e.stopPropagation();
    setRecentSearches((prev) => {
      const updated = prev.filter((s) => s !== textToRemove);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
      return updated;
    });
  };

  const clearAllRecent = () => {
    setRecentSearches([]);
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  };

  const executeSearch = async (searchTerm, mode) => {
    if (!searchTerm || !searchTerm.trim()) return;
    const targetQuery = searchTerm.trim();
    setLoading(true);
    setSearchedQuery(targetQuery);
    saveRecentSearch(targetQuery);

    try {
      if (mode === 'semantic') {
        const data = await movieApi.searchSemantic(targetQuery, 18);
        setResults(data || []);
      } else {
        const res = await movieApi.browse(0, 18, '', targetQuery, 'popularity');
        setResults(res.content || []);
      }
    } catch (err) {
      console.error('Search error', err);
      // Fallback to keyword search if semantic fails
      try {
        const res = await movieApi.browse(0, 18, '', targetQuery, 'popularity');
        setResults(res.content || []);
      } catch (e2) {
        setResults([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    executeSearch(query, searchMode);
  };

  const handleChipClick = (chipText) => {
    setQuery(chipText);
    executeSearch(chipText, searchMode);
  };

  return (
    <div className="py-6 max-w-6xl mx-auto pb-24">
      
      {/* Search Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-lbBeige-textMain dark:text-lbDark-textMain mb-2">
          Search Flix Cinema
        </h1>
        <p className="text-xs sm:text-sm text-lbBeige-textMuted dark:text-lbDark-textMuted">
          Discover movies using natural language semantic matching or traditional keyword titles
        </p>
      </div>

      {/* Search Bar & Mode Toggle */}
      <div className="max-w-2xl mx-auto mb-8">
        <form onSubmit={handleSubmit} className="relative flex items-center">
          <div className="absolute left-4 text-lbBeige-textMuted dark:text-lbDark-textMuted">
            {searchMode === 'semantic' ? (
              <Sparkles className="w-5 h-5 text-brand-green" />
            ) : (
              <Search className="w-5 h-5" />
            )}
          </div>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={
              searchMode === 'semantic'
                ? "Describe what you want: e.g. 'mind-bending sci-fi with time travel'..."
                : "Search title: e.g. 'Inception', 'Pulp Fiction'..."
            }
            className="w-full pl-12 pr-28 py-3.5 rounded-2xl border text-sm transition-all focus:outline-none focus:ring-2 shadow-sm
              bg-lbBeige-surface border-lbBeige-border text-lbBeige-textMain focus:ring-brand-rust/30
              dark:bg-lbDark-surface dark:border-lbDark-border dark:text-lbDark-textMain dark:focus:ring-brand-green/30"
          />

          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-20 p-1 text-lbBeige-textMuted hover:text-black dark:text-lbDark-textMuted dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute right-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all
              bg-brand-rust text-white hover:bg-orange-600 disabled:opacity-40
              dark:bg-brand-green dark:text-black dark:hover:bg-emerald-400"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {/* Mode Switcher */}
        <div className="flex items-center justify-between mt-3 px-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchMode('semantic')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                searchMode === 'semantic'
                  ? 'bg-brand-green/20 text-brand-green border border-brand-green/40 font-bold'
                  : 'text-lbBeige-textMuted dark:text-lbDark-textMuted hover:text-black dark:hover:text-white'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-brand-green" />
              AI Semantic Vector Search
            </button>

            <button
              type="button"
              onClick={() => setSearchMode('keyword')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                searchMode === 'keyword'
                  ? 'bg-brand-rust/20 text-brand-rust border border-brand-rust/40 font-bold'
                  : 'text-lbBeige-textMuted dark:text-lbDark-textMuted hover:text-black dark:hover:text-white'
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              Keyword Match
            </button>
          </div>

          <span className="text-[11px] text-lbBeige-textMuted dark:text-lbDark-textMuted hidden sm:inline">
            {searchMode === 'semantic' ? 'Gemini 768-D Embedding' : 'Exact SQL ILIKE'}
          </span>
        </div>
      </div>

      {/* Recent Searches Section */}
      {recentSearches.length > 0 && (
        <div className="max-w-2xl mx-auto mb-8 p-4 rounded-xl border bg-lbBeige-surface/40 border-lbBeige-border/60 dark:bg-lbDark-surface/40 dark:border-lbDark-border/60">
          <div className="flex items-center justify-between mb-2.5">
            <span className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-lbBeige-textMuted dark:text-lbDark-textMuted">
              <Clock className="w-3.5 h-3.5" /> Recent Searches
            </span>
            <button
              onClick={clearAllRecent}
              className="text-[11px] text-lbBeige-textMuted hover:text-red-500 dark:text-lbDark-textMuted dark:hover:text-red-400 flex items-center gap-1 transition-colors"
            >
              <Trash2 className="w-3 h-3" /> Clear
            </button>
          </div>

          <div className="flex flex-wrap gap-2">
            {recentSearches.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleChipClick(item)}
                className="group flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all
                  bg-lbBeige-surface border border-lbBeige-border hover:border-brand-rust text-lbBeige-textMain
                  dark:bg-lbDark-surface dark:border-lbDark-border dark:hover:border-brand-green dark:text-lbDark-textMain"
              >
                <span>{item}</span>
                <button
                  onClick={(e) => removeRecentSearch(e, item)}
                  className="opacity-50 hover:opacity-100 p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10"
                  aria-label="Remove"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Inspiration Prompts */}
      {results.length === 0 && !loading && (
        <div className="max-w-2xl mx-auto mb-12">
          <p className="text-xs font-semibold uppercase tracking-wider text-lbBeige-textMuted dark:text-lbDark-textMuted mb-2.5">
            Try Asking AI
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTED_PROMPTS.map((prompt, idx) => (
              <button
                key={idx}
                onClick={() => handleChipClick(prompt)}
                className="text-left text-xs px-3 py-1.5 rounded-xl border transition-all active:scale-95
                  bg-lbBeige-surface/70 border-lbBeige-border hover:bg-lbBeige-hover text-lbBeige-textMain
                  dark:bg-lbDark-surface/70 dark:border-lbDark-border dark:hover:bg-lbDark-hover dark:text-lbDark-textMain"
              >
                "{prompt}"
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results Header */}
      {searchedQuery && (
        <div className="flex items-center justify-between mb-6 pb-2 border-b border-lbBeige-border dark:border-lbDark-border">
          <h2 className="text-lg font-bold text-lbBeige-textMain dark:text-lbDark-textMain flex items-center gap-2">
            Results for <span className="text-brand-rust dark:text-brand-green">"{searchedQuery}"</span>
          </h2>
          <span className="text-xs text-lbBeige-textMuted dark:text-lbDark-textMuted font-mono">
            {results.length} movies found
          </span>
        </div>
      )}

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {Array.from({ length: 12 }).map((_, i) => (
            <div
              key={i}
              className="aspect-[2/3] rounded-lg animate-pulse bg-lbBeige-surface/60 dark:bg-lbDark-surface/60 border border-lbBeige-border/40 dark:border-lbDark-border/40"
            />
          ))}
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {results.map((movie) => (
            <MovieCard
              key={movie.id}
              movie={movie}
              similarityScore={movie.similarityScore}
              onClick={() => onMovieClick && onMovieClick(movie.id)}
            />
          ))}
        </div>
      ) : searchedQuery ? (
        <div className="py-16 text-center rounded-2xl border border-dashed border-lbBeige-border dark:border-lbDark-border">
          <Film className="w-10 h-10 mx-auto text-lbBeige-textMuted dark:text-lbDark-textMuted mb-2 opacity-50" />
          <p className="text-sm font-semibold text-lbBeige-textMain dark:text-lbDark-textMain">
            No cinematic matches found
          </p>
          <p className="text-xs text-lbBeige-textMuted dark:text-lbDark-textMuted mt-1">
            Try adjusting your search terms or switching between Semantic Vector Search and Keyword Match.
          </p>
        </div>
      ) : null}

    </div>
  );
}
