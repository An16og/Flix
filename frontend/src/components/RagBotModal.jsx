import React, { useState, useRef, useEffect } from 'react';
import { 
  X, 
  Send, 
  Film, 
  Star, 
  Sparkles,
  RotateCcw,
  Bot
} from 'lucide-react';
import { chatApi } from '../api/client';
import { getPosterUrl, handlePosterError } from '../utils/imageUtils';

const DEFAULT_SUGGESTIONS = [
  "Why is Christopher Nolan's storytelling so compelling?",
  "Recommend superhero blockbusters like Batman and Deadpool",
  "Explain the difference between film noir and neo-noir",
  "Recommend mind-bending sci-fi like Interstellar"
];

// Helper to render basic markdown bold and paragraphs safely
function FormattedMessage({ text }) {
  if (!text) return null;
  const paragraphs = text.split('\n\n');

  return (
    <div className="space-y-2">
      {paragraphs.map((p, pIdx) => {
        // Format **bold text**
        const parts = p.split(/(\*\*.*?\*\*)/g);
        return (
          <p key={pIdx} className="leading-relaxed">
            {parts.map((part, idx) => {
              if (part.startsWith('**') && part.endsWith('**')) {
                return (
                  <strong key={idx} className="font-extrabold text-amber-400">
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              return part;
            })}
          </p>
        );
      })}
    </div>
  );
}

export default function RagBotModal({ onOpenMovieDetail }) {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestedPrompts, setSuggestedPrompts] = useState(DEFAULT_SUGGESTIONS);
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      text: "Hello! I am your Flix Cinema Concierge. I can discuss directors and film techniques, explain complex endings and themes, analyze characters, or recommend movies tailored to your specific taste.\n\nWhat kind of film or cinematic question are you in the mood for today?",
      movies: []
    }
  ]);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, loading]);

  const handleResetChat = () => {
    setMessages([
      {
        role: 'assistant',
        text: "Hello! I am your Flix Cinema Concierge. I can discuss directors and film techniques, explain complex endings and themes, analyze characters, or recommend movies tailored to your specific taste.\n\nWhat kind of film or cinematic question are you in the mood for today?",
        movies: []
      }
    ]);
    setSuggestedPrompts(DEFAULT_SUGGESTIONS);
  };

  const handleSend = async (textToSend) => {
    const text = textToSend || input;
    if (!text || !text.trim() || loading) return;

    const trimmed = text.trim();
    const userMessage = { role: 'user', text: trimmed, movies: [] };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      // Build conversation history array for context
      const history = messages.slice(-4).map((m) => `${m.role}: ${m.text}`);

      // Call our dynamic AI Cinema Concierge backend endpoint
      const response = await chatApi.sendMessage(trimmed, history);

      const botMessage = {
        role: 'assistant',
        text: response.reply || "That is a fascinating area of cinema. Here are some standout films that explore this theme:",
        movies: response.recommendedMovies || []
      };

      setMessages((prev) => [...prev, botMessage]);

      if (response.suggestedPrompts && response.suggestedPrompts.length > 0) {
        setSuggestedPrompts(response.suggestedPrompts);
      }
    } catch (err) {
      console.error('Chat error', err);
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          text: "I experienced a momentary connection pause. Please try asking your question again!",
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
          className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full shadow-xl transition-all duration-300
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

      {/* Dynamic Cinema Chat Drawer / Modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-full sm:w-[420px] max-h-[640px] h-[85vh] rounded-2xl border shadow-2xl flex flex-col overflow-hidden animate-in fade-in slide-in-from-bottom-4
          bg-lbBeige-surface border-lbBeige-border text-lbBeige-textMain
          dark:bg-lbDark-surface dark:border-lbDark-border dark:text-lbDark-textMain">
          
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-lbBeige-border dark:border-lbDark-border bg-black/5 dark:bg-black/30 backdrop-blur-md">
            <div className="flex items-center gap-2.5">
              <div className="p-1.5 rounded-lg bg-amber-400/20 text-amber-400">
                <Film className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold leading-tight flex items-center gap-1.5">
                  Flix Concierge
                  <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-400/15 text-amber-400 uppercase tracking-wider">
                    AI Scholar
                  </span>
                </h3>
                <p className="text-[10px] text-lbBeige-textMuted dark:text-lbDark-textMuted">
                  Conversational Film Analysis & Discovery
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={handleResetChat}
                title="Reset Conversation"
                className="p-1.5 rounded-lg text-lbBeige-textMuted hover:text-black dark:text-lbDark-textMuted dark:hover:text-white transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsOpen(false)}
                title="Close"
                className="p-1.5 rounded-lg text-lbBeige-textMuted hover:text-black dark:text-lbDark-textMuted dark:hover:text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Messages Stream */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
              >
                <div
                  className={`max-w-[90%] rounded-2xl px-4 py-2.5 text-xs ${
                    msg.role === 'user'
                      ? 'bg-brand-rust text-white dark:bg-amber-400 dark:text-black font-semibold shadow-sm'
                      : 'bg-lbBeige-card dark:bg-lbDark-card border border-lbBeige-border dark:border-lbDark-border shadow-md'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                  ) : (
                    <FormattedMessage text={msg.text} />
                  )}
                </div>

                {/* Attached Interactive Movie Cards if returned */}
                {msg.movies && msg.movies.length > 0 && (
                  <div className="mt-3 w-full grid grid-cols-2 gap-2.5">
                    {msg.movies.slice(0, 4).map((m) => (
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
                          <span>{m.releaseDate ? m.releaseDate.split('-')[0] : 'Cinema'}</span>
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
                <span className="font-mono text-[11px]">Consulting film archives...</span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Dynamic Follow-Up Suggested Chips */}
          {suggestedPrompts && suggestedPrompts.length > 0 && (
            <div className="px-3 pb-2 pt-1 border-t border-lbBeige-border/50 dark:border-lbDark-border/50 bg-black/5 dark:bg-black/10">
              <p className="text-[9px] font-semibold uppercase tracking-wider text-lbBeige-textMuted dark:text-lbDark-textMuted mb-1.5 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> Explore Next:
              </p>
              <div className="flex flex-col gap-1 max-h-24 overflow-y-auto">
                {suggestedPrompts.slice(0, 3).map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(chip)}
                    className="text-left text-[11px] px-2.5 py-1.5 rounded-lg border text-lbBeige-textMuted hover:text-black dark:text-zinc-300 dark:hover:text-white
                      bg-lbBeige-bg border-lbBeige-border dark:bg-lbDark-bg dark:border-lbDark-border dark:hover:border-amber-400/50 truncate transition-colors"
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
              placeholder="Ask anything: film trivia, director styles, themes..."
              className="flex-1 px-3.5 py-2.5 rounded-xl text-xs border focus:outline-none transition-all
                bg-lbBeige-bg border-lbBeige-border focus:border-brand-rust
                dark:bg-lbDark-bg dark:border-lbDark-border dark:focus:border-amber-400"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-2.5 rounded-xl text-black bg-amber-400 hover:bg-amber-300 disabled:opacity-40 transition-all shadow-md active:scale-95"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>

        </div>
      )}
    </>
  );
}
