import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';

export default function MovieRow({
  title,
  subtitle,
  icon: Icon,
  badge,
  movies = [],
  loading = false,
  onMovieClick,
  emptyMessage = "No movies available in this category yet."
}) {
  const rowRef = useRef(null);

  const scroll = (direction) => {
    if (rowRef.current) {
      const scrollAmount = direction === 'left' ? -600 : 600;
      rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="mb-12 relative group/row">
      {/* Row Header */}
      <div className="flex items-end justify-between mb-4 px-1">
        <div>
          <div className="flex items-center gap-2">
            {Icon && <Icon className="w-4 h-4 text-brand-green dark:text-brand-green" />}
            <h2 className="text-lg sm:text-xl font-bold tracking-tight text-lbBeige-textMain dark:text-lbDark-textMain">
              {title}
            </h2>
            {badge && (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-brand-green/15 text-brand-green dark:bg-brand-green/20 dark:text-brand-green border border-brand-green/30">
                {badge}
              </span>
            )}
          </div>
          {subtitle && (
            <p className="text-xs text-lbBeige-textMuted dark:text-lbDark-textMuted mt-0.5 font-medium">
              {subtitle}
            </p>
          )}
        </div>

        {/* Navigation Arrows */}
        {movies.length > 4 && (
          <div className="hidden sm:flex items-center gap-1.5 opacity-80 group-hover/row:opacity-100 transition-opacity">
            <button
              onClick={() => scroll('left')}
              className="p-1.5 rounded-lg border transition-all active:scale-95
                bg-lbBeige-surface border-lbBeige-border hover:bg-lbBeige-hover text-lbBeige-textMain
                dark:bg-lbDark-surface dark:border-lbDark-border dark:hover:bg-lbDark-hover dark:text-lbDark-textMain"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-1.5 rounded-lg border transition-all active:scale-95
                bg-lbBeige-surface border-lbBeige-border hover:bg-lbBeige-hover text-lbBeige-textMain
                dark:bg-lbDark-surface dark:border-lbDark-border dark:hover:bg-lbDark-hover dark:text-lbDark-textMain"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* Row Body / Horizontal Scroller */}
      {loading ? (
        <div className="flex gap-4 overflow-x-hidden py-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="w-36 sm:w-44 flex-shrink-0 aspect-[2/3] rounded-lg animate-pulse 
                bg-lbBeige-surface/60 dark:bg-lbDark-surface/60 border border-lbBeige-border/40 dark:border-lbDark-border/40"
            />
          ))}
        </div>
      ) : movies.length === 0 ? (
        <div className="py-8 px-4 text-center rounded-xl border border-dashed border-lbBeige-border dark:border-lbDark-border text-xs text-lbBeige-textMuted dark:text-lbDark-textMuted">
          {emptyMessage}
        </div>
      ) : (
        <div
          ref={rowRef}
          className="flex gap-4 overflow-x-auto scrollbar-none scroll-smooth pb-3 pt-1 px-1 -mx-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {movies.map((movie) => (
            <div key={movie.id} className="w-36 sm:w-44 flex-shrink-0">
              <MovieCard
                movie={movie}
                similarityScore={movie.similarityScore}
                onClick={() => onMovieClick && onMovieClick(movie.id)}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
