import React, { useState, useRef, useEffect } from 'react';
import { 
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
import { getPosterUrl, handlePosterError } from '../utils/imageUtils';

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
      text: "Hello! I am your Flix Cinema Concierge. Ask me anything about movie recommendations, plot themes, or director styles.",
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
        replyText = `Based on what you're looking for, here are ${results.length} great film recommendations:`;
      } else {
        replyText = "I couldn't find an exact match for that inquiry. Try asking about a specific theme, director, or favorite film title!";
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
          text: "I had a momentary connection glitch. Please try again in a moment!",
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
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-3.5 py-2.5 rounded-full shadow-xl transition-all duration-300
            bg-lbBeige-surface/95 border border-lbBeige-border text-lbBeige-textMain hover:border-brand-rust
            dark:bg-zinc-900/95 dark:border-zinc-700/80 dark:text-zinc-200 dark:hover:border-amber-400/80
            backdrop-blur-md active:scale-95 group"
          title="Cinema Concierge"
          aria-label="Open Cinema Concierge"
        >
          <div className="relative">
            <Film className="w-4 h-4 text-brand-rust dark:text-amber-400 transition-transform group-hover:scale-110" />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-amber-400" />
          </div>
          <span className="text-xs font-semibold tracking-wide hidden sm:inline">
            Cinema Concierge
          </span>
        </button>
      )}

      {/* RAG Bot Chat Drawer / Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full sm:w-96 max-h-[580px] h-[85vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4
          bg-lbBeige-surface border-lbBeige-border text-lbBeige-textMain
          dark:bg-lbDark-surface dark:border-lbDark-border dark:text-lbDark-textMain">
          
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-lbBeige-border dark:border-lbDark-border bg-black/5 dark:bg-black/20">
            <div className="flex items-center gap-2">
              <div className="p-1.5 rounded-lg bg-amber-400/20 text-amber-400">
                <Film className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold leading-tight">Flix Concierge</h3>
                <p className="text-[10px] text-lbBeige-textMuted dark:text-lbDark-textMuted">
                  AI Film Discovery Guide
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg text-lbBeige-textMuted hover:text-black dark:text-lbDark-textMuted dark:hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-brand-rust text-white dark:bg-amber-400 dark:text-black font-medium'
                      : 'bg-lbBeige-card dark:bg-lbDark-card border border-lbBeige-border dark:border-lbDark-border shadow-sm'
                  }`}
                >
                  <p>{msg.text}</p>
                </div>

                {/* Attached Movie Cards if assistant returned recommendations */}
                {msg.movies && msg.movies.length > 0 && (
                  <div className="mt-2.5 w-full grid grid-cols-2 gap-2">
                    {msg.movies.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => {
                          if (onOpenMovieDetail) onOpenMovieDetail(m.id);
                        }}
                        className="group p-2 rounded-xl border cursor-pointer transition-all active:scale-95
                          bg-lbBeige-bg border-lbBeige-border hover:border-brand-rust
                          dark:bg-lbDark-bg dark:border-lbDark-border dark:hover:border-amber-400/80"
                      >
                        <div className="aspect-[2/3] w-full rounded-lg overflow-hidden bg-zinc-900 mb-1.5">
                          <img
                            src={getPosterUrl(m)}
                            alt={m.title}
                            className="w-full h-full object-cover transition-transform group-hover:scale-105"
                            onError={(e) => handlePosterError(e, m)}
                          />
                        </div>
                        <p className="text-[11px] font-bold truncate group-hover:text-amber-400">
                          {m.title}
                        </p>
                        <div className="flex items-center justify-between text-[10px] text-lbBeige-textMuted dark:text-lbDark-textMuted mt-0.5">
                          <span>{m.releaseDate ? m.releaseDate.split('-')[0] : ''}</span>
                          {m.voteAverage > 0 && (
                            <span className="flex items-center gap-0.5 text-amber-400 font-bold">
                              ★ {Number(m.voteAverage).toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div className="flex items-center gap-2 text-xs text-lbBeige-textMuted dark:text-lbDark-textMuted p-2">
                <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
                <span>Consulting recommendation index...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggested Prompts (when only initial message) */}
          {messages.length === 1 && (
            <div className="px-3 pb-2 pt-1 border-t border-lbBeige-border/50 dark:border-lbDark-border/50">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-lbBeige-textMuted dark:text-lbDark-textMuted mb-1.5">
                Quick Prompts:
              </p>
              <div className="flex flex-col gap-1">
                {QUICK_CHIPS.slice(0, 2).map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(chip)}
                    className="text-left text-[11px] px-2.5 py-1 rounded-lg border text-lbBeige-textMuted hover:text-black dark:text-lbDark-textMuted dark:hover:text-white
                      bg-lbBeige-bg border-lbBeige-border dark:bg-lbDark-bg dark:border-lbDark-border dark:hover:border-amber-400/40 truncate"
                  >
                    "{chip}"
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="p-3 border-t border-lbBeige-border dark:border-lbDark-border bg-black/5 dark:bg-black/20 flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about movies, directors, themes..."
              className="flex-1 px-3 py-2 rounded-xl text-xs border focus:outline-none transition-all
                bg-lbBeige-bg border-lbBeige-border focus:border-brand-rust
                dark:bg-lbDark-bg dark:border-lbDark-border dark:focus:border-amber-400"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2 rounded-xl text-black bg-amber-400 hover:bg-amber-300 disabled:opacity-40 transition-all shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
