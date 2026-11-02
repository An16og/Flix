import React, { useState, useEffect } from 'react';
import { 
  X, 
  Star, 
  Eye, 
  Bookmark, 
  MessageSquare, 
  Clock, 
  ExternalLink,
  Send,
  Check,
  Film
} from 'lucide-react';
import { movieApi, recommendationApi, activityApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { getPosterUrl, getProfileUrl, getPlaceholderPoster, handlePosterError } from '../utils/imageUtils';

export default function MovieDetailModal({ movieId, onClose, onMovieSelected }) {
  const { currentUser } = useAuth();
  const [movie, setMovie] = useState(null);
  const [similarMovies, setSimilarMovies] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [watched, setWatched] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [userRating, setUserRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewText, setReviewText] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [posterError, setPosterError] = useState(false);

  useEffect(() => {
    if (!movieId) return;
    loadMovieDetails();
  }, [movieId]);

  const loadMovieDetails = async () => {
    setLoading(true);
    setPosterError(false);
    try {
      const [detailData, similarData, reviewData] = await Promise.all([
        movieApi.getDetail(movieId),
        recommendationApi.getSimilar(movieId, 6).catch(() => []),
        activityApi.getMovieReviews(movieId).catch(() => [])
      ]);
      setMovie(detailData);
      setSimilarMovies(similarData);
      setReviews(reviewData);

      // Check user interaction status
      if (currentUser?.id) {
        try {
          const [watchedList, watchlistData, ratings] = await Promise.all([
            activityApi.getWatched(currentUser.id).catch(() => []),
            activityApi.getWatchlist(currentUser.id).catch(() => []),
            activityApi.getUserRatings(currentUser.id).catch(() => [])
          ]);
          setWatched(watchedList.some((m) => m.id === movieId));
          setInWatchlist(watchlistData.some((m) => m.id === movieId));
          const existingRate = ratings.find((r) => r.movieId === movieId);
          if (existingRate) setUserRating(existingRate.rating);
        } catch (e) {
          // Ignore
        }
      }
    } catch (err) {
      console.error('Failed to load movie details', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleWatched = async () => {
    if (!currentUser?.id) return;
    try {
      await activityApi.markAsWatched(currentUser.id, movieId);
      setWatched(true);
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleWatchlist = async () => {
    if (!currentUser?.id) return;
    try {
      if (inWatchlist) {
        await activityApi.removeFromWatchlist(currentUser.id, movieId);
        setInWatchlist(false);
      } else {
        await activityApi.addToWatchlist(currentUser.id, movieId);
        setInWatchlist(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleRate = async (rateVal) => {
    if (!currentUser?.id) return;
    try {
      setUserRating(rateVal);
      await activityApi.rateMovie(currentUser.id, movieId, rateVal);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!currentUser?.id || !reviewText.trim() || submittingReview) return;
    setSubmittingReview(true);
    try {
      const newReview = await activityApi.addReview(currentUser.id, movieId, reviewText.trim());
      setReviews([newReview, ...reviews]);
      setReviewText('');
    } catch (e) {
      console.error(e);
    } finally {
      setSubmittingReview(false);
    }
  };

  if (!movieId) return null;

  const posterUrl = getPosterUrl(movie);
  const releaseYear = movie?.releaseDate ? movie.releaseDate.split('-')[0] : '';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl border shadow-2xl transition-all
        bg-lbBeige-surface border-lbBeige-border text-lbBeige-textMain
        dark:bg-lbDark-surface dark:border-lbDark-border dark:text-lbDark-textMain">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 text-white/90 hover:bg-black/90 transition-all backdrop-blur-sm"
        >
          <X className="w-5 h-5" />
        </button>

        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
            <p className="text-xs font-mono text-lbBeige-textMuted dark:text-lbDark-textMuted">
              Fetching cinematic metadata...
            </p>
          </div>
        ) : movie ? (
          <div>
            {/* Cinematic Hero Backdrop */}
            <div className="relative w-full h-56 sm:h-72 overflow-hidden bg-black/95">
              <img
                src={posterUrl}
                alt={movie.title}
                className="w-full h-full object-cover opacity-25 filter blur-lg scale-110"
                onError={(e) => handlePosterError(e, movie)}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-lbBeige-surface dark:from-lbDark-surface via-transparent to-black/60" />
            </div>

            {/* Main Content Area */}
            <div className="px-6 pb-8 -mt-28 relative z-10">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                
                {/* Poster */}
                <div className="w-36 sm:w-48 aspect-[2/3] shrink-0 rounded-xl overflow-hidden border-2 shadow-2xl
                  border-lbBeige-border dark:border-lbDark-border bg-zinc-900">
                  {!posterError ? (
                    <img 
                      src={posterUrl} 
                      alt={movie.title} 
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        setPosterError(true);
                        handlePosterError(e, movie);
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex flex-col justify-between p-4 bg-gradient-to-br from-zinc-900 to-black text-white select-none border border-white/10">
                      <span className="text-[10px] font-mono text-amber-400 font-bold uppercase tracking-wider">Flix Archive</span>
                      <h2 className="font-sans font-extrabold text-base leading-tight my-auto text-zinc-100">{movie.title}</h2>
                      <span className="text-[10px] font-mono text-amber-400">★ {movie.voteAverage ? Number(movie.voteAverage).toFixed(1) : ''}</span>
                    </div>
                  )}
                </div>

                {/* Header Information */}
                <div className="flex-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                      {movie.title}
                    </h1>
                    {releaseYear && (
                      <span className="text-lg font-light text-lbBeige-textMuted dark:text-lbDark-textMuted">
                        ({releaseYear})
                      </span>
                    )}
                  </div>

                  {/* Director & Metadata */}
                  <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-lbBeige-textMuted dark:text-lbDark-textMuted font-medium">
                    {movie.director && (
                      <span>Directed by <strong className="text-black dark:text-white">{movie.director}</strong></span>
                    )}
                    {movie.runtime && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {movie.runtime} mins
                      </span>
                    )}
                    {movie.imdbId && (
                      <a
                        href={`https://www.imdb.com/title/${movie.imdbId}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 font-bold text-amber-500 dark:text-amber-400 hover:underline"
                      >
                        IMDb <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>

                  {/* Tagline */}
                  {movie.tagline && (
                    <p className="mt-3 text-xs italic opacity-85 border-l-2 pl-2.5 border-brand-rust dark:border-amber-400">
                      "{movie.tagline}"
                    </p>
                  )}

                  {/* Genres Chips */}
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {movie.genres && movie.genres.map((g, idx) => (
                      <span
                        key={idx}
                        className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border
                          bg-lbBeige-card border-lbBeige-border text-lbBeige-textMain
                          dark:bg-lbDark-card dark:border-lbDark-border dark:text-lbDark-textMain"
                      >
                        {g}
                      </span>
                    ))}
                  </div>

                  {/* Action Toolbar */}
                  <div className="mt-5 p-3 rounded-xl border flex flex-wrap items-center justify-between gap-4
                    bg-lbBeige-card border-lbBeige-border
                    dark:bg-lbDark-card dark:border-lbDark-border">
                    
                    <div className="flex items-center gap-2">
                      {/* Watched Toggle */}
                      <button
                        onClick={handleToggleWatched}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          watched
                            ? 'bg-amber-400 text-black shadow-sm'
                            : 'border border-lbBeige-border hover:bg-lbBeige-hover dark:border-lbDark-border dark:hover:bg-lbDark-hover'
                        }`}
                      >
                        {watched ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Eye className="w-3.5 h-3.5" />}
                        {watched ? 'Watched' : 'Watch'}
                      </button>

                      {/* Watchlist Toggle */}
                      <button
                        onClick={handleToggleWatchlist}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                          inWatchlist
                            ? 'bg-amber-400 text-black shadow-sm'
                            : 'border border-lbBeige-border hover:bg-lbBeige-hover dark:border-lbDark-border dark:hover:bg-lbDark-hover'
                        }`}
                      >
                        <Bookmark className="w-3.5 h-3.5" />
                        {inWatchlist ? 'In Watchlist' : 'Watchlist'}
                      </button>
                    </div>

                    {/* Star Rating Selector (1 to 5 stars) */}
                    <div className="flex items-center gap-1">
                      <span className="text-[11px] font-medium mr-1 text-lbBeige-textMuted dark:text-lbDark-textMuted">
                        Your Rate:
                      </span>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          onClick={() => handleRate(star)}
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          className="p-1 transition-transform hover:scale-125"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              (hoverRating || userRating) >= star
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-zinc-400 dark:text-zinc-600'
                            }`}
                          />
                        </button>
                      ))}
                      {userRating > 0 && (
                        <span className="text-xs font-bold font-mono ml-1 text-amber-500 dark:text-amber-400">
                          {userRating}/5
                        </span>
                      )}
                    </div>

                  </div>

                </div>

              </div>

              {/* Overview / Synopsis */}
              <div className="mt-8">
                <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-lbBeige-textMuted dark:text-lbDark-textMuted mb-2">
                  Synopsis
                </h3>
                <p className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-300 font-sans">
                  {movie.overview || 'No synopsis available for this film.'}
                </p>
              </div>

              {/* Top Cast Section */}
              {movie.topCast && movie.topCast.length > 0 && (
                <div className="mt-8">
                  <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-lbBeige-textMuted dark:text-lbDark-textMuted mb-3">
                    Principal Cast
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
                    {movie.topCast.slice(0, 5).map((actor, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2.5 p-2 rounded-lg border
                          bg-lbBeige-card border-lbBeige-border
                          dark:bg-lbDark-card dark:border-lbDark-border"
                      >
                        <img
                          src={getProfileUrl(actor.profilePath)}
                          alt={actor.name}
                          className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-zinc-500/30"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80';
                          }}
                        />
                        <div className="truncate">
                          <p className="text-xs font-bold truncate">{actor.name}</p>
                          <p className="text-[10px] text-lbBeige-textMuted dark:text-lbDark-textMuted truncate">
                            {actor.character || 'Cast'}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Content-Based Similar Recommendations */}
              {similarMovies && similarMovies.length > 0 && (
                <div className="mt-8">
                  <div className="flex items-center gap-2 mb-3">
                    <Film className="w-4 h-4 text-amber-400" />
                    <h3 className="text-xs font-bold font-mono uppercase tracking-wider text-lbBeige-textMuted dark:text-lbDark-textMuted">
                      More Like This
                    </h3>
                  </div>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {similarMovies.slice(0, 6).map((sim) => (
                      <div
                        key={sim.id}
                        onClick={() => onMovieSelected && onMovieSelected(sim.id)}
                        className="cursor-pointer group flex flex-col"
                      >
                        <div className="aspect-[2/3] w-full rounded-xl overflow-hidden border transition-all duration-300
                          bg-lbBeige-surface border-lbBeige-border group-hover:border-brand-rust
                          dark:bg-lbDark-surface dark:border-lbDark-border group-hover:dark:border-amber-400 group-hover:scale-105">
                          <img
                            src={getPosterUrl(sim)}
                            alt={sim.title}
                            className="w-full h-full object-cover"
                            onError={(e) => handlePosterError(e, sim)}
                          />
                        </div>
                        <p className="mt-1 text-[11px] font-semibold truncate group-hover:underline">
                          {sim.title}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Reviews Section */}
              <div className="mt-10 pt-6 border-t border-lbBeige-border dark:border-lbDark-border">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-brand-blue" />
                    <h3 className="text-sm font-bold font-sans">
                      Community Reviews ({reviews.length})
                    </h3>
                  </div>
                </div>

                {/* Add Review Input */}
                {currentUser ? (
                  <form onSubmit={handleSubmitReview} className="mb-6">
                    <div className="relative">
                      <textarea
                        rows={3}
                        value={reviewText}
                        onChange={(e) => setReviewText(e.target.value)}
                        placeholder={`Write your thoughts on ${movie.title}...`}
                        className="w-full p-3 pr-20 rounded-xl text-xs border focus:outline-none transition-all resize-none
                          bg-lbBeige-card border-lbBeige-border focus:border-brand-rust
                          dark:bg-lbDark-card dark:border-lbDark-border dark:focus:border-amber-400"
                      />
                      <button
                        type="submit"
                        disabled={submittingReview || !reviewText.trim()}
                        className="absolute right-3 bottom-3.5 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all bg-amber-400 text-black hover:bg-amber-300 disabled:opacity-50 shadow-sm"
                      >
                        <Send className="w-3 h-3" />
                        Post
                      </button>
                    </div>
                  </form>
                ) : (
                  <p className="text-xs italic text-lbBeige-textMuted dark:text-lbDark-textMuted mb-4">
                    Sign in to leave your review.
                  </p>
                )}

                {/* Reviews List */}
                <div className="space-y-3">
                  {reviews.length === 0 ? (
                    <p className="text-xs text-lbBeige-textMuted dark:text-lbDark-textMuted">
                      No reviews yet for this movie. Be the first to log your review!
                    </p>
                  ) : (
                    reviews.map((rev) => (
                      <div
                        key={rev.id}
                        className="p-3.5 rounded-xl border bg-lbBeige-card border-lbBeige-border dark:bg-lbDark-card dark:border-lbDark-border"
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-xs">
                              {rev.username || 'Film Critic'}
                            </span>
                          </div>
                          <span className="text-[10px] text-lbBeige-textMuted dark:text-lbDark-textMuted">
                            {rev.createdAt ? new Date(rev.createdAt).toLocaleDateString() : 'Recent'}
                          </span>
                        </div>
                        <p className="text-xs leading-relaxed opacity-90 font-sans italic">
                          "{rev.reviewText}"
                        </p>
                      </div>
                    ))
                  )}
                </div>

              </div>

            </div>
          </div>
        ) : null}

      </div>
    </div>
  );
}
