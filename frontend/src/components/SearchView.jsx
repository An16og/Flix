import React, { useState, useEffect } from 'react';
import { Search, Sparkles, Filter, AlertCircle } from 'lucide-react';
import { movieApi } from '../api/client';
import MovieCard from './MovieCard';

export default function SearchView({ query, onMovieClick }) {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchMode, setSearchMode] = useState('keyword'); // 'keyword' | 'semantic'
  const [error, setError] = useState(null);

  useEffect(() => {
    if (query) {
      executeSearch(query, searchMode);
    }
  }, [query, searchMode]);

  const executeSearch = async (searchTerm, mode) => {
    setLoading(true);
    setError(null);
    try {
      if (mode === 'semantic') {
        const data = await movieApi.semanticSearch(searchTerm, 18);
        setResults(data || []);
      } else {
        const pageData = await movieApi.browse(0, 24, '', searchTerm, 'popularity');
        setResults(pageData.content || []);
      }
    } catch (err) {
      console.error(err);
      if (mode === 'semantic') {
        setError('Semantic search requires Gemini API embeddings to be active. Falling back to keyword search.');
        // Fallback to keyword search
        try {
          const fallback = await movieApi.browse(0, 24, '', searchTerm, 'popularity');
          setResults(fallback.content || []);
          setSearchMode('keyword');
        } catch (e) {
          setError('Failed to fetch search results.');
        }
      } else {
        setError('Failed to fetch search results.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Search Header */}
      <div className="p-6 rounded-2xl border transition-all
        dark:bg-lbDark-surface dark:border-lbDark-border
        light:bg-lbBeige-surface light:border-lbBeige-border">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Search className="w-5 h-5 text-brand-green" />
              <h2 className="text-xl font-extrabold font-sans">
                Search Results for "{query}"
              </h2>
            </div>
            <p className="text-xs dark:text-lbDark-textMuted light:text-lbBeige-textMuted mt-1">
              Found {results.length} film matches
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-2 p-1 rounded-xl border
            dark:bg-lbDark-card dark:border-lbDark-border light:bg-lbBeige-card light:border-lbBeige-border">
            <button
              onClick={() => setSearchMode('keyword')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                searchMode === 'keyword'
                  ? 'bg-brand-green text-black'
                  : 'dark:text-lbDark-textMuted light:text-lbBeige-textMuted'
              }`}
            >
              Standard Title Search
            </button>
            <button
              onClick={() => setSearchMode('semantic')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                searchMode === 'semantic'
                  ? 'bg-brand-green text-black'
                  : 'dark:text-lbDark-textMuted light:text-lbBeige-textMuted'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              Gemini Vector Search
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 p-3 rounded-lg flex items-center gap-2 bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

      </div>

      {/* Results Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(12)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[2/3] w-full rounded-lg bg-zinc-800/40 mb-2" />
              <div className="h-3 w-3/4 bg-zinc-800/40 rounded mb-1" />
            </div>
          ))}
        </div>
      ) : results.length === 0 ? (
        <div className="p-16 text-center rounded-2xl border dark:border-lbDark-border light:border-lbBeige-border">
          <Search className="w-10 h-10 mx-auto mb-2 dark:text-lbDark-textMuted light:text-lbBeige-textMuted opacity-50" />
          <p className="text-sm font-bold">No movies found matching "{query}"</p>
          <p className="text-xs dark:text-lbDark-textMuted light:text-lbBeige-textMuted mt-1">
            Try searching for a different keyword or director name.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {results.map((m) => (
            <MovieCard
              key={m.id}
              movie={m}
              similarityScore={m.similarityScore}
              onClick={() => onMovieClick(m.id)}
            />
          ))}
        </div>
      )}

    </div>
  );
}
