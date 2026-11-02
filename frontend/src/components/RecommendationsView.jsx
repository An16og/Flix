import React, { useState, useEffect } from 'react';
import { Sparkles, RefreshCw, Cpu, Layers, Flame, LogIn } from 'lucide-react';
import { recommendationApi } from '../api/client';
import { useAuth } from '../context/AuthContext';
import MovieCard from './MovieCard';

export default function RecommendationsView({ onMovieClick, onOpenAuthModal }) {
  const { currentUser } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (currentUser?.id) {
      loadRecommendations(currentUser.id);
    } else {
      setLoading(false);
    }
  }, [currentUser?.id]);

  const loadRecommendations = async (userId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await recommendationApi.getPersonalized(userId, 18);
      setRecommendations(data || []);
    } catch (err) {
      console.error(err);
      setError('Unable to load personalized recommendations.');
    } finally {
      setLoading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="p-12 sm:p-16 text-center rounded-2xl border transition-all my-8
        bg-lbBeige-surface border-lbBeige-border dark:bg-lbDark-surface dark:border-lbDark-border">
        <div className="w-12 h-12 mx-auto rounded-2xl bg-brand-green/20 text-brand-green flex items-center justify-center mb-4">
          <Sparkles className="w-6 h-6" />
        </div>
        <h2 className="text-xl font-bold font-sans">
          Sign In for Personalized Centroid Recommendations
        </h2>
        <p className="mt-2 text-xs text-lbBeige-textMuted dark:text-lbDark-textMuted max-w-md mx-auto leading-relaxed">
          Flix computes a 768-dimensional weighted centroid vector across your 5 most recent watches, factoring in linear recency decay and your star ratings.
        </p>
        <div className="mt-6">
          <button
            onClick={() => onOpenAuthModal('login')}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider bg-brand-green text-black hover:bg-emerald-400 active:scale-95 transition-all shadow-md"
          >
            <LogIn className="w-4 h-4" />
            Sign In to Account
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in">
      
      {/* Header Banner */}
      <div className="p-6 rounded-2xl border transition-all
        bg-lbBeige-surface border-lbBeige-border
        dark:bg-lbDark-surface dark:border-lbDark-border">
        
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-brand-green/20 text-brand-green">
              <Sparkles className="w-5 h-5" />
            </span>
            <h2 className="text-2xl font-extrabold font-sans">
              Personalized For {currentUser.name || currentUser.username}
            </h2>
          </div>
          
          <p className="mt-1 text-xs text-lbBeige-textMuted dark:text-lbDark-textMuted max-w-3xl leading-relaxed">
            Derived dynamically from your <strong>last 5 watches</strong> in PostgreSQL using a 
            <strong> 768-dimensional weighted centroid vector</strong> matched via 
            <code> pgvector cosine distance (&lt;=&gt;)</code>.
          </p>

          {/* Seeded Watches / Anchor History */}
          {currentUser.recentWatchesPreview && (
            <div className="mt-3.5 flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-mono font-bold text-lbBeige-textMuted dark:text-lbDark-textMuted">
                Anchor Watches:
              </span>
              {currentUser.recentWatchesPreview.map((title, idx) => (
                <span
                  key={idx}
                  className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full border
                    bg-lbBeige-card border-lbBeige-border text-lbBeige-textMain
                    dark:bg-lbDark-card dark:border-lbDark-border dark:text-lbDark-textMain"
                >
                  #{idx + 1} {title}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Algorithm Formula Ribbon */}
        <div className="mt-5 pt-4 border-t flex flex-wrap items-center gap-4 text-[11px] border-lbBeige-border dark:border-lbDark-border text-lbBeige-textMuted dark:text-lbDark-textMuted">
          <div className="flex items-center gap-1.5">
            <Cpu className="w-3.5 h-3.5 text-brand-green" />
            <span><strong>Model:</strong> Gemini text-embedding-004 (768-d)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-brand-blue" />
            <span><strong>Decay:</strong> 1.0 down to 0.68</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Flame className="w-3.5 h-3.5 text-brand-orange" />
            <span><strong>Rating Multiplier:</strong> 0.75x to 1.25x</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span><strong>Hybrid Score:</strong> 0.60*Sim + 0.25*Rating + 0.15*Pop</span>
          </div>
        </div>

      </div>

      {/* Recommendations Grid */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-wider font-mono text-lbBeige-textMuted dark:text-lbDark-textMuted">
            Recommended Titles ({recommendations.length})
          </h3>
          <button
            onClick={() => loadRecommendations(currentUser?.id)}
            className="flex items-center gap-1 text-xs font-semibold text-lbBeige-textMuted dark:text-lbDark-textMuted hover:text-brand-green transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Refresh Vector
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[2/3] w-full rounded-lg bg-zinc-300 dark:bg-zinc-800/40 mb-2" />
                <div className="h-3 w-3/4 bg-zinc-300 dark:bg-zinc-800/40 rounded mb-1" />
                <div className="h-2 w-1/2 bg-zinc-300 dark:bg-zinc-800/40 rounded" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="p-8 text-center rounded-xl border border-lbBeige-border dark:border-lbDark-border">
            <p className="text-xs text-rose-500 mb-2">{error}</p>
            <button
              onClick={() => loadRecommendations(currentUser?.id)}
              className="px-4 py-2 rounded-lg text-xs font-bold bg-brand-green text-black"
            >
              Retry
            </button>
          </div>
        ) : recommendations.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-lbBeige-border dark:border-lbDark-border">
            <p className="text-sm font-semibold mb-1">No recommendations found yet.</p>
            <p className="text-xs text-lbBeige-textMuted dark:text-lbDark-textMuted">
              Log at least one film watch to activate your personalized centroid vector!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {recommendations.map((item) => (
              <MovieCard
                key={item.id}
                movie={item}
                similarityScore={item.similarityScore}
                onClick={() => onMovieClick(item.id)}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
