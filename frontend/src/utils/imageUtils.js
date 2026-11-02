/**
 * Safely resolves poster and backdrop URLs for TMDB / Kaggle movies.
 * Converts relative paths like '/q0R4crx2SehcEEQEkYObktdeFy.jpg' to full CDN URLs.
 * Provides a crisp, offline SVG cinema poster placeholder when missing.
 */

export function getPlaceholderPoster(title = 'Movie') {
  const safeTitle = (title || 'Flix Cinema').length > 26 
    ? (title || 'Flix Cinema').substring(0, 24) + '...' 
    : (title || 'Flix Cinema');

  const clean = safeTitle.replace(/[<>"'&]/g, '');

  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="500" height="750" viewBox="0 0 500 750"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="%231a202c"/><stop offset="50%" stop-color="%23111827"/><stop offset="100%" stop-color="%23000000"/></linearGradient></defs><rect width="500" height="750" fill="url(%23bg)"/><rect x="24" y="24" width="452" height="702" rx="16" fill="none" stroke="%23374151" stroke-width="2"/><g transform="translate(205, 260)" fill="%234b5563"><path d="M45 0 C20.1 0 0 20.1 0 45 C0 69.9 20.1 90 45 90 C69.9 90 90 69.9 90 45 C90 20.1 69.9 0 45 0 Z M45 16 C61 16 74 29 74 45 C74 61 61 74 45 74 C29 74 16 61 16 45 C16 29 29 16 45 16 Z"/><circle cx="45" cy="45" r="12"/></g><text x="250" y="420" font-family="system-ui, -apple-system, sans-serif" font-size="22" font-weight="700" fill="%23f3f4f6" text-anchor="middle">${encodeURIComponent(clean)}</text><text x="250" y="460" font-family="ui-monospace, monospace" font-size="12" font-weight="600" fill="%2300e054" letter-spacing="3" text-anchor="middle">FLIX ARCHIVE</text></svg>`;
}

export function getPosterUrl(movie) {
  if (!movie) {
    return getPlaceholderPoster('Cinema');
  }

  const title = movie.title || 'Movie';

  // Check explicit full URL first
  if (movie.posterUrl && (movie.posterUrl.startsWith('http://') || movie.posterUrl.startsWith('https://'))) {
    if (!movie.posterUrl.includes('placehold.co')) {
      return movie.posterUrl;
    }
  }

  const rawPath = movie.posterPath || movie.poster_path;
  if (!rawPath || rawPath === 'null' || rawPath === 'undefined' || rawPath.trim() === '') {
    return getPlaceholderPoster(title);
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
