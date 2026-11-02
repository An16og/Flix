import React, { useState } from 'react';
import { X, Lock, Mail, User, AlertCircle, Film, Check, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function AuthModal({ isOpen, onClose, initialMode = 'login' }) {
  const { login, register, error, demoProfiles } = useAuth();
  const [isRegister, setIsRegister] = useState(initialMode === 'register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [selectedGenres, setSelectedGenres] = useState(['Science Fiction', 'Action']);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  const ALL_GENRES = [
    'Action', 'Adventure', 'Animation', 'Comedy', 'Crime', 
    'Drama', 'Family', 'Fantasy', 'Horror', 'Mystery', 
    'Romance', 'Science Fiction', 'Thriller'
  ];

  const handleGenreToggle = (g) => {
    if (selectedGenres.includes(g)) {
      setSelectedGenres(selectedGenres.filter((item) => item !== g));
    } else {
      setSelectedGenres([...selectedGenres, g]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      if (isRegister) {
        if (!username.trim() || !email.trim() || !password.trim()) {
          throw new Error('Please fill all required fields');
        }
        await register(username.trim(), email.trim(), password, selectedGenres);
      } else {
        if (!email.trim() || !password.trim()) {
          throw new Error('Please enter both email and password');
        }
        await login(email.trim(), password);
      }
      onClose();
    } catch (err) {
      setFormError(err.message || 'Operation failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectMockProfile = async (p) => {
    setEmail(p.email);
    setPassword(p.password);
    setFormError('');
    setSubmitting(true);
    try {
      await login(p.email, p.password);
      onClose();
    } catch (err) {
      setFormError(err.message || 'Failed to sign in with mock profile');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-2xl border shadow-2xl p-6 transition-all
        bg-lbBeige-surface border-lbBeige-border text-lbBeige-textMain
        dark:bg-lbDark-surface dark:border-lbDark-border dark:text-lbDark-textMain">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg transition-colors
            hover:bg-lbBeige-hover dark:hover:bg-lbDark-hover"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Tab Header: Sign In vs Sign Up */}
        <div className="flex items-center gap-3 border-b border-lbBeige-border dark:border-lbDark-border pb-4 mb-5">
          <button
            type="button"
            onClick={() => { setIsRegister(false); setFormError(''); }}
            className={`text-base font-bold pb-1 transition-all ${
              !isRegister
                ? 'border-b-2 border-brand-rust text-brand-rust dark:border-amber-400 dark:text-amber-400 font-extrabold'
                : 'text-lbBeige-textMuted dark:text-lbDark-textMuted hover:text-black dark:hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setIsRegister(true); setFormError(''); }}
            className={`text-base font-bold pb-1 transition-all ${
              isRegister
                ? 'border-b-2 border-brand-rust text-brand-rust dark:border-amber-400 dark:text-amber-400 font-extrabold'
                : 'text-lbBeige-textMuted dark:text-lbDark-textMuted hover:text-black dark:hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Error message */}
        {(formError || error) && (
          <div className="mb-4 p-3 rounded-lg flex items-center gap-2 bg-rose-500/10 border border-rose-500/30 text-rose-500 dark:text-rose-400 text-xs">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{formError || error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {isRegister && (
            <div>
              <label className="block text-xs font-semibold mb-1">Username</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-lbBeige-textMuted dark:text-lbDark-textMuted" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="e.g. cinema_lover"
                  className="w-full pl-9 pr-3 py-2 rounded-lg text-xs font-medium border focus:outline-none transition-all
                    bg-lbBeige-card border-lbBeige-border focus:border-brand-rust
                    dark:bg-lbDark-bg dark:border-lbDark-border dark:focus:border-amber-400"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold mb-1">Email Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-lbBeige-textMuted dark:text-lbDark-textMuted" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alice@flix.com"
                className="w-full pl-9 pr-3 py-2 rounded-lg text-xs font-medium border focus:outline-none transition-all
                  bg-lbBeige-card border-lbBeige-border focus:border-brand-rust
                  dark:bg-lbDark-bg dark:border-lbDark-border dark:focus:border-amber-400"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-lbBeige-textMuted dark:text-lbDark-textMuted" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password123"
                className="w-full pl-9 pr-3 py-2 rounded-lg text-xs font-medium border focus:outline-none transition-all
                  bg-lbBeige-card border-lbBeige-border focus:border-brand-rust
                  dark:bg-lbDark-bg dark:border-lbDark-border dark:focus:border-amber-400"
              />
            </div>
          </div>

          {isRegister && (
            <div>
              <label className="block text-xs font-semibold mb-1.5">Choose Favorite Genres</label>
              <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto p-1">
                {ALL_GENRES.map((g) => {
                  const selected = selectedGenres.includes(g);
                  return (
                    <button
                      type="button"
                      key={g}
                      onClick={() => handleGenreToggle(g)}
                      className={`text-[10px] px-2.5 py-1 rounded-full border transition-all ${
                        selected
                          ? 'bg-amber-400 text-black font-bold border-amber-400'
                          : 'bg-lbBeige-card border-lbBeige-border dark:bg-lbDark-bg dark:border-lbDark-border'
                      }`}
                    >
                      {g}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full mt-2 py-2.5 rounded-lg text-xs font-bold transition-all bg-amber-400 text-black hover:bg-amber-300 disabled:opacity-50 shadow-md"
          >
            {submitting ? 'Authenticating...' : isRegister ? 'Register New Account' : 'Sign In'}
          </button>
        </form>

        {/* Mock Demonstration Accounts Card */}
        <div className="mt-6 pt-5 border-t border-lbBeige-border dark:border-lbDark-border">
          <div className="flex items-center gap-1.5 mb-2.5">
            <Film className="w-4 h-4 text-brand-rust dark:text-amber-400" />
            <span className="text-xs font-bold uppercase tracking-wider font-mono">
              Demo Profiles for Presentation
            </span>
          </div>
          <p className="text-[11px] text-lbBeige-textMuted dark:text-lbDark-textMuted mb-3">
            Click any seeded persona to instantly sign in as that user and test recommendations:
          </p>

          <div className="space-y-1.5">
            {demoProfiles.map((p) => (
              <button
                key={p.id}
                type="button"
                onClick={() => handleSelectMockProfile(p)}
                className="w-full flex items-center justify-between p-2 rounded-xl border text-left transition-all
                  bg-lbBeige-card border-lbBeige-border hover:border-brand-rust
                  dark:bg-lbDark-card dark:border-lbDark-border dark:hover:border-amber-400/80"
              >
                <div className="flex items-center gap-2.5">
                  <img src={p.avatar} alt={p.name} className="w-7 h-7 rounded-full object-cover ring-1 ring-zinc-400" />
                  <div>
                    <span className="text-xs font-bold block">{p.name} ({p.badge})</span>
                    <span className="text-[10px] font-mono text-lbBeige-textMuted dark:text-lbDark-textMuted">
                      {p.email} • {p.password}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold px-2 py-1 rounded bg-amber-400 text-black shrink-0 flex items-center gap-1">
                  Sign In <ArrowRight className="w-3 h-3" />
                </span>
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
