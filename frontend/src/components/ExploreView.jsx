import React, { useState, useEffect } from 'react';
import { Filter, ArrowUpDown, ChevronLeft, ChevronRight, SlidersHorizontal, RefreshCw } from 'lucide-react';
import { movieApi } from '../api/client';
import MovieCard from './MovieCard';

export default function ExploreView({ onMovieClick }) {
  const [movies, setMovies] = useState([]);
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState('');
  const [sortBy, setSortBy] = useState('popularity');
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadGenres();
  }, []);

  useEffect(() => {
    loadMovies();
  }, [page, selectedGenre, sortBy]);

  const loadGenres = async () => {
    try {
      const data = await movieApi.getGenres();
      setGenres(data || []);
    } catch (err) {
      console.error(err);
    }
  };

  const loadMovies = async () => {
    setLoading(true);
    try {
      const data = await movieApi.browse(page, 24, selectedGenre, '', sortBy);
      setMovies(data.content || []);
      setTotalPages(data.totalPages || 1);
      setTotalElements(data.totalElements || 0);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenreChange = (genre) => {
    setSelectedGenre(genre === selectedGenre ? '' : genre);
    setPage(0);
  };

  const handleSortChange = (e) => {
    setSortBy(e.target.value);
    setPage(0);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      
      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-xl border
        dark:bg-lbDark-surface dark:border-lbDark-border
        light:bg-lbBeige-surface light:border-lbBeige-border">
        
        {/* Left: Total counter */}
        <div>
          <h2 className="text-lg font-bold font-sans">
            Catalog Browse
          </h2>
          <p className="text-xs dark:text-lbDark-textMuted light:text-lbBeige-textMuted">
            Showing {totalElements.toLocaleString()} movies in PostgreSQL
          </p>
        </div>

        {/* Right: Sort Dropdown & Quick Genre Count */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 dark:text-lbDark-textMuted light:text-lbBeige-textMuted" />
            <span className="text-xs font-semibold">Sort by:</span>
            <select
              value={sortBy}
              onChange={handleSortChange}
              className="px-3 py-1.5 rounded-lg text-xs font-semibold border focus:outline-none transition-all
                dark:bg-lbDark-card dark:border-lbDark-border dark:focus:border-brand-green
                light:bg-lbBeige-card light:border-lbBeige-border light:focus:border-brand-rust"
            >
              <option value="popularity">Most Popular</option>
              <option value="voteAverage">Top Rated</option>
              <option value="title">Title (A-Z)</option>
            </select>
          </div>
        </div>

      </div>

      {/* Genre Filter Pills */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-none">
        <button
          onClick={() => handleGenreChange('')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold shrink-0 transition-all border ${
            selectedGenre === ''
              ? 'bg-brand-green text-black border-brand-green'
              : 'dark:bg-lbDark-card dark:border-lbDark-border dark:text-lbDark-textMuted dark:hover:text-white light:bg-lbBeige-card light:border-lbBeige-border light:text-lbBeige-textMuted'
          }`}
        >
          All Genres
        </button>

        {genres.map((g) => (
          <button
            key={g}
            onClick={() => handleGenreChange(g)}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 transition-all border ${
              selectedGenre === g
                ? 'bg-brand-green text-black border-brand-green font-bold'
                : 'dark:bg-lbDark-card dark:border-lbDark-border dark:text-lbDark-textMuted dark:hover:text-white light:bg-lbBeige-card light:border-lbBeige-border light:text-lbBeige-textMuted'
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Movie Grid */}
      {loading ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {[...Array(24)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="aspect-[2/3] w-full rounded-lg bg-zinc-800/40 mb-2" />
              <div className="h-3 w-3/4 bg-zinc-800/40 rounded mb-1" />
              <div className="h-2 w-1/2 bg-zinc-800/40 rounded" />
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {movies.map((m) => (
            <MovieCard
              key={m.id}
              movie={m}
              onClick={() => onMovieClick(m.id)}
            />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      <div className="pt-6 border-t flex items-center justify-between dark:border-lbDark-border light:border-lbBeige-border">
        <p className="text-xs font-medium dark:text-lbDark-textMuted light:text-lbBeige-textMuted">
          Page <strong>{page + 1}</strong> of <strong>{totalPages}</strong>
        </p>

        <div className="flex items-center gap-2">
          <button
            disabled={page === 0 || loading}
            onClick={() => setPage(page - 1)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all disabled:opacity-30
              dark:border-lbDark-border dark:hover:bg-lbDark-hover light:border-lbBeige-border light:hover:bg-lbBeige-hover"
          >
            <ChevronLeft className="w-4 h-4" /> Previous
          </button>

          <button
            disabled={page >= totalPages - 1 || loading}
            onClick={() => setPage(page + 1)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all disabled:opacity-30
              dark:border-lbDark-border dark:hover:bg-lbDark-hover light:border-lbBeige-border light:hover:bg-lbBeige-hover"
          >
            Next <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}
