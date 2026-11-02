import React, { createContext, useContext, useState, useEffect } from 'react';
import { userApi } from '../api/client';

export const DEMO_PROFILES = [
  {
    id: 1,
    name: 'Maya Lin',
    username: 'Maya Lin',
    email: 'maya.lin@example.com',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    badge: 'Sci-Fi Specialist',
    badgeColor: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
    favoriteGenres: ['Science Fiction', 'Action', 'Adventure'],
    recentWatchesPreview: ['Inception', 'Interstellar', 'The Matrix', 'The Dark Knight', 'Alien'],
    bio: 'Fascinated by high-concept physics, time dilation, and cybernetic realities.',
  },
  {
    id: 2,
    name: 'Chloe Dubois',
    username: 'Chloe Dubois',
    email: 'chloe.dubois@example.com',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
    badge: 'Animation Lover',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    favoriteGenres: ['Animation', 'Family', 'Comedy'],
    recentWatchesPreview: ['Toy Story', 'Finding Nemo', 'The Lion King', 'Monsters, Inc.', 'Up'],
    bio: 'Championing 3D storytelling, Pixar tear-jerkers, and timeless family classics.',
  },
  {
    id: 3,
    name: 'Marcus Chen',
    username: 'Marcus Chen',
    email: 'marcus.chen@example.com',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80',
    badge: 'Crime & Mob Purist',
    badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    favoriteGenres: ['Crime', 'Drama', 'Thriller'],
    recentWatchesPreview: ['The Godfather', 'GoodFellas', 'Pulp Fiction', 'Fight Club', 'The Dark Knight'],
    bio: 'Drawn to Scorsese, Coppola, morally grey antiheroes, and neon-lit gritty neo-noir.',
  },
  {
    id: 4,
    name: 'Liam O\'Connor',
    username: 'Liam O\'Connor',
    email: 'liam.oconnor@example.com',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
    badge: 'Romance & Drama',
    badgeColor: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    favoriteGenres: ['Romance', 'Comedy', 'Drama'],
    recentWatchesPreview: ['Titanic', 'Forrest Gump', 'Notting Hill', 'Toy Story', 'Finding Nemo'],
    bio: 'Hopeless romantic who appreciates sweeping emotional scores and 90s comfort cinema.',
  },
  {
    id: 5,
    name: 'Alex Vance',
    username: 'Alex Vance',
    email: 'alex.vance@example.com',
    password: 'password123',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&w=160&q=80',
    badge: 'Horror & Suspense',
    badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
    favoriteGenres: ['Horror', 'Mystery', 'Thriller'],
    recentWatchesPreview: ['The Shining', 'Psycho', 'Alien', 'Halloween', 'Fight Club'],
    bio: 'Thrilled by atmospheric dread, psychological tension, Kubrick framing, and slashers.',
  },
];

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // Default to Alice Walker (id 1) for seamless demo, or load from localStorage
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('flix_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // Fallback
      }
    }
    return null;
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync user state with localStorage
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('flix_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('flix_user');
    }
  }, [currentUser]);

  // Quick switch to one of the 5 demo personas
  const selectDemoPersona = async (personaId) => {
    setLoading(true);
    setError(null);
    try {
      const match = DEMO_PROFILES.find((p) => p.id === personaId) || DEMO_PROFILES[0];
      // Fetch fresh profile from backend if available
      try {
        const liveProfile = await userApi.getProfile(match.id);
        const combined = { ...match, ...liveProfile };
        setCurrentUser(combined);
      } catch (err) {
        // Backend might be offline or using defaults, use local persona
        setCurrentUser(match);
      }
    } catch (err) {
      setError(err.message || 'Failed to switch persona');
    } finally {
      setLoading(false);
    }
  };

  // Standard login via backend
  const login = async (email, password) => {
    setLoading(true);
    setError(null);
    try {
      const profile = await userApi.login(email, password);
      // Attach demo details if matches
      const demoMatch = DEMO_PROFILES.find((p) => p.email.toLowerCase() === email.toLowerCase());
      const mergedUser = {
        ...(demoMatch || {}),
        ...profile,
      };
      setCurrentUser(mergedUser);
      return mergedUser;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Login failed';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  // Standard register
  const register = async (username, email, password, favoriteGenres) => {
    setLoading(true);
    setError(null);
    try {
      const profile = await userApi.register(username, email, password, favoriteGenres);
      const newUser = {
        ...profile,
        name: username,
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=160&q=80',
        badge: 'Film Explorer',
        badgeColor: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      };
      setCurrentUser(newUser);
      return newUser;
    } catch (err) {
      const message = err.response?.data?.message || err.message || 'Registration failed';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const refreshProfile = async () => {
    if (!currentUser?.id) return;
    try {
      const fresh = await userApi.getProfile(currentUser.id);
      setCurrentUser((prev) => ({ ...prev, ...fresh }));
    } catch (e) {
      // Ignore if offline
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        error,
        demoProfiles: DEMO_PROFILES,
        selectDemoPersona,
        login,
        register,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
