import React, { useState, useRef, useEffect } from 'react';
import { 
  Sparkles, 
  X, 
  Send, 
  Film, 
  Star, 
  MessageSquare, 
  ChevronRight, 
  Bot, 
  User,
  ExternalLink
} from 'lucide-react';
import { movieApi } from '../api/client';
import { getPosterUrl } from '../utils/imageUtils';

const QUICK_CHIPS = [
  "Recommend a mind-bending sci-fi like Interstellar",
  "Gritty 90s psychological thriller with a plot twist",
  "Whimsical animated movie with heartfelt story",
  "Classic mafia neo-noir crime masterpiece"
];

export default function RagBotModal({ onOpenMovieDetail }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Hello! I am your Flix AI Concierge, powered by Gemini 768-D embeddings and pgvector. Ask me anything about movie recommendations, plot themes, or director styles.",
      movies: []
    }
  ]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen]);

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text || !text.trim() || loading) return;

    const userMessage = { role: 'user', text: text.trim(), movies: [] };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Query semantic search endpoint powered by Gemini embeddings and pgvector
      const results = await movieApi.searchSemantic(text.trim(), 4);

      let replyText = "";
      if (results && results.length > 0) {
        replyText = `Based on your request, I searched our vector space and identified ${results.length} strong semantic matches:`;
      } else {
        replyText = "I couldn't find a direct vector match for that inquiry. Try asking about a specific theme, director, or favorite film title!";
      }

      const botMessage = {
        role: 'assistant',
        text: replyText,
        movies: results || []
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: "I had a momentary glitch connecting to the vector engine. Please try again in a moment!",
          movies: []
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Subtle Floating Button at Bottom Right */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-3 py-2.5 rounded-full shadow-xl transition-all duration-300
            bg-lbBeige-surface/95 border border-lbBeige-border text-lbBeige-textMain hover:border-brand-rust
            dark:bg-zinc-900/95 dark:border-zinc-700/80 dark:text-zinc-200 dark:hover:border-brand-green/80
            backdrop-blur-md active:scale-95 group"
          title="Flix AI Concierge"
          aria-label="Open AI Concierge"
        >
          <div className="relative">
            <Sparkles className="w-4 h-4 text-brand-rust dark:text-brand-green transition-transform group-hover:scale-110" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-brand-green animate-pulse" />
          </div>
          <span className="text-xs font-semibold tracking-wide pr-1">
            AI Concierge
          </span>
        </button>
      )}

      {/* Slide-Over Floating Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full max-w-[390px] h-[560px] rounded-2xl shadow-2xl border flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-300
          bg-lbBeige-bg border-lbBeige-border dark:bg-lbDark-bg dark:border-lbDark-border">
          
          {/* Header */}
          <div className="px-4 py-3.5 border-b flex items-center justify-between
            bg-lbBeige-surface/90 border-lbBeige-border dark:bg-lbDark-surface/90 dark:border-lbDark-border backdrop-blur-md">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-brand-green/20 text-brand-green">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-lbBeige-textMain dark:text-lbDark-textMain leading-none">
                  Flix AI Concierge
                </h3>
                <span className="text-[10px] text-lbBeige-textMuted dark:text-lbDark-textMuted font-mono">
                  Gemini Embeddings + pgvector
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg text-lbBeige-textMuted hover:text-black dark:text-lbDark-textMuted dark:hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 text-xs font-sans">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex gap-2.5 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.role === 'assistant' && (
                  <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center bg-brand-green/20 text-brand-green mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3 leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-brand-rust text-white dark:bg-brand-green dark:text-black font-medium'
                      : 'bg-lbBeige-surface border border-lbBeige-border text-lbBeige-textMain dark:bg-lbDark-surface dark:border-lbDark-border dark:text-lbDark-textMain'
                  }`}
                >
                  <p>{m.text}</p>

                  {/* Render Movie Cards Inside Assistant Message */}
                  {m.movies && m.movies.length > 0 && (
                    <div className="mt-3 space-y-2 pt-2 border-t border-black/10 dark:border-white/10">
                      {m.movies.map((movie) => {
                        const poster = getPosterUrl(movie);
                        const matchPct = movie.similarityScore
                          ? Math.round(movie.similarityScore * 100)
                          : null;

                        return (
                          <div
                            key={movie.id}
                            onClick={() => {
                              if (onOpenMovieDetail) onOpenMovieDetail(movie.id);
                            }}
                            className="flex items-center gap-2.5 p-2 rounded-xl cursor-pointer transition-all active:scale-95
                              bg-black/5 hover:bg-black/10 dark:bg-white/5 dark:hover:bg-white/10 group/card"
                          >
                            <img
                              src={poster}
                              alt={movie.title}
                              className="w-10 h-14 object-cover rounded-md flex-shrink-0 bg-zinc-800"
                              onError={(e) => {
                                e.target.src = "https://placehold.co/40x56/1e293b/ffffff?text=";
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="font-bold text-xs truncate group-hover/card:text-brand-rust dark:group-hover/card:text-brand-green">
                                {movie.title}
                              </h4>
                              <div className="flex items-center gap-2 mt-0.5">
                                {movie.voteAverage && (
                                  <span className="flex items-center gap-0.5 text-[10px] text-amber-500 font-mono font-bold">
                                    <Star className="w-2.5 h-2.5 fill-amber-500" />
                                    {Number(movie.voteAverage).toFixed(1)}
                                  </span>
                                )}
                                {matchPct && (
                                  <span className="text-[10px] px-1.5 py-0.2 rounded-full font-bold bg-brand-green/20 text-brand-green">
                                    {matchPct}% Match
                                  </span>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-zinc-400 group-hover/card:translate-x-0.5 transition-transform" />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {m.role === 'user' && (
                  <div className="w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center bg-zinc-700 text-white mt-0.5">
                    <User className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex gap-2.5 items-center text-xs text-lbBeige-textMuted dark:text-lbDark-textMuted">
                <div className="w-6 h-6 rounded-full flex items-center justify-center bg-brand-green/20 text-brand-green">
                  <Sparkles className="w-3 h-3 animate-spin" />
                </div>
                <span>Scanning 768-D vector space...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompt Chips */}
          <div className="px-3 py-2 border-t flex items-center gap-1.5 overflow-x-auto scrollbar-none bg-black/5 dark:bg-white/5" style={{ scrollbarWidth: 'none' }}>
            {QUICK_CHIPS.map((chip, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(chip)}
                disabled={loading}
                className="whitespace-nowrap px-2.5 py-1 rounded-full text-[10px] font-medium border transition-all active:scale-95
                  bg-lbBeige-surface border-lbBeige-border hover:bg-lbBeige-hover text-lbBeige-textMain
                  dark:bg-lbDark-surface dark:border-lbDark-border dark:hover:bg-lbDark-hover dark:text-lbDark-textMain"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Input Bar */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 border-t flex items-center gap-2 bg-lbBeige-surface/50 dark:bg-lbDark-surface/50"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask for recommendations..."
              disabled={loading}
              className="flex-1 px-3.5 py-2 rounded-xl text-xs border focus:outline-none focus:ring-1 transition-all
                bg-lbBeige-bg border-lbBeige-border text-lbBeige-textMain focus:ring-brand-rust
                dark:bg-lbDark-bg dark:border-lbDark-border dark:text-lbDark-textMain dark:focus:ring-brand-green"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 rounded-xl bg-brand-rust text-white hover:bg-orange-600 dark:bg-brand-green dark:text-black dark:hover:bg-emerald-400 disabled:opacity-40 transition-all"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
