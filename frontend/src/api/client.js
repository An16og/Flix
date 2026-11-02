import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const movieApi = {
  // Browse movies with pagination, search, genre, sort
  browse: async (page = 0, size = 20, genre = '', search = '', sortBy = 'popularity') => {
    const params = { page, size, sortBy };
    if (genre) params.genre = genre;
    if (search) params.search = search;
    const res = await api.get('/movies', { params });
    return res.data;
  },

  getTrending: async (limit = 12) => {
    const res = await api.get('/movies/trending', { params: { limit } });
    return res.data;
  },

  getTopRated: async (limit = 12) => {
    const res = await api.get('/movies/top-rated', { params: { limit } });
    return res.data;
  },

  getDetail: async (id) => {
    const res = await api.get(`/movies/${id}`);
    return res.data;
  },

  getGenres: async () => {
    const res = await api.get('/movies/genres');
    return res.data;
  },

  // Semantic search via Gemini embedding + pgvector cosine similarity
  semanticSearch: async (query, limit = 12) => {
    const res = await api.get('/movies/search', { params: { query, limit } });
    return res.data;
  },
};

export const recommendationApi = {
  // Centroid recommendations based on recent 5 watches with recency decay
  getPersonalized: async (userId, limit = 12) => {
    const res = await api.get(`/recommendations/user/${userId}`, { params: { limit } });
    return res.data;
  },

  // Content-based similarity to a given movie
  getSimilar: async (movieId, limit = 10) => {
    const res = await api.get(`/recommendations/similar/${movieId}`, { params: { limit } });
    return res.data;
  },
};

export const userApi = {
  login: async (email, password) => {
    const res = await api.post('/users/login', { usernameOrEmail: email, email, password });
    return res.data;
  },

  register: async (username, email, password, favoriteGenres = []) => {
    const res = await api.post('/users/register', { username, email, password, favoriteGenres });
    return res.data;
  },

  getProfile: async (id) => {
    const res = await api.get(`/users/${id}/profile`);
    return res.data;
  },

  updatePreferences: async (id, favoriteGenres) => {
    const res = await api.put(`/users/${id}/preferences`, favoriteGenres);
    return res.data;
  },
};

export const activityApi = {
  // Watchlist
  addToWatchlist: async (userId, movieId) => {
    const res = await api.post(`/users/${userId}/watchlist/${movieId}`);
    return res.data;
  },

  removeFromWatchlist: async (userId, movieId) => {
    const res = await api.delete(`/users/${userId}/watchlist/${movieId}`);
    return res.data;
  },

  getWatchlist: async (userId) => {
    const res = await api.get(`/users/${userId}/watchlist`);
    return res.data;
  },

  // Watched
  markAsWatched: async (userId, movieId) => {
    const res = await api.post(`/users/${userId}/watched/${movieId}`);
    return res.data;
  },

  getWatched: async (userId) => {
    const res = await api.get(`/users/${userId}/watched`);
    return res.data;
  },

  // Rating
  rateMovie: async (userId, movieId, rating) => {
    const res = await api.post(`/movies/${movieId}/rate`, { userId, rating });
    return res.data;
  },

  getUserRatings: async (userId) => {
    const res = await api.get(`/users/${userId}/ratings`);
    return res.data;
  },

  // Reviews
  addReview: async (userId, movieId, reviewText) => {
    const res = await api.post(`/movies/${movieId}/reviews`, { userId, reviewText });
    return res.data;
  },

  getMovieReviews: async (movieId) => {
    const res = await api.get(`/movies/${movieId}/reviews`);
    return res.data;
  },
};

export default api;
