/**
 * Safely resolves poster and backdrop URLs for TMDB / Kaggle movies.
 * Converts relative paths like '/q0R4crx2SehcEEQEkYObktdeFy.jpg' to full CDN URLs.
 */
export function getPosterUrl(movie) {
  if (!movie) {
    return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=80';
  }

  // Check explicit full URL first
  if (movie.posterUrl && (movie.posterUrl.startsWith('http://') || movie.posterUrl.startsWith('https://'))) {
    return movie.posterUrl;
  }

  const rawPath = movie.posterPath || movie.poster_path;
  if (!rawPath || rawPath === 'null' || rawPath === 'undefined') {
    return 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&q=80';
  }

  if (rawPath.startsWith('http://') || rawPath.startsWith('https://')) {
    return rawPath;
  }

  // Prepend TMDB CDN path
  const cleanPath = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
  return `https://image.tmdb.org/t/p/w500${cleanPath}`;
}

export function getProfileUrl(path) {
  if (!path || path === 'null') {
    return 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=120&q=80';
  }
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `https://image.tmdb.org/t/p/w185${cleanPath}`;
}
