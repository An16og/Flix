/**
 * Safely resolves poster and backdrop URLs for TMDB / Kaggle movies.
 * Converts relative paths like '/q0R4crx2SehcEEQEkYObktdeFy.jpg' to full CDN URLs.
 * Provides crisp, multi-palette SVG cinema poster placeholders when missing.
 */

export function getPlaceholderPoster(movieOrTitle) {
  let title = 'Flix Cinema';
  let year = '';
  let genre = '';
  let rating = '';

  if (typeof movieOrTitle === 'string') {
    title = movieOrTitle || 'Flix Cinema';
  } else if (movieOrTitle && typeof movieOrTitle === 'object') {
    title = movieOrTitle.title || 'Flix Cinema';
    if (movieOrTitle.releaseDate) {
      year = movieOrTitle.releaseDate.split('-')[0];
    } else if (movieOrTitle.release_date) {
      year = movieOrTitle.release_date.split('-')[0];
    }
    if (Array.isArray(movieOrTitle.genres) && movieOrTitle.genres.length > 0) {
      genre = movieOrTitle.genres[0];
    }
    const vote = movieOrTitle.voteAverage || movieOrTitle.vote_average;
    if (vote && Number(vote) > 0) {
      rating = `★ ${Number(vote).toFixed(1)}`;
    }
  }

  // Generate deterministic palette based on title hash so missing posters look visually varied
  let hash = 0;
  for (let i = 0; i < title.length; i++) {
    hash = (hash << 5) - hash + title.charCodeAt(i);
    hash |= 0;
  }

  const palettes = [
    { c1: '%2318181b', c2: '%2309090b', accent: '%23e5a93c', line: '%2327272a' }, // Obsidian & Gold
    { c1: '%23111827', c2: '%23030712', accent: '%23f59e0b', line: '%231f2937' }, // Midnight Slate & Amber
    { c1: '%231c1917', c2: '%230c0a09', accent: '%23e5a93c', line: '%23292524' }, // Warm Charcoal & Gold
    { c1: '%23131b26', c2: '%23090d14', accent: '%23f59e0b', line: '%231e293b' }, // Deep Navy & Ochre
    { c1: '%231a1625', c2: '%230b0813', accent: '%23e5a93c', line: '%2328223a' }, // Deep Velvet & Gold
  ];
  const p = palettes[Math.abs(hash) % palettes.length];

  // Clean title & wrap into up to 3 lines (max 18 chars per line)
  const cleanTitle = title.replace(/[<>"'&]/g, '');
  const words = cleanTitle.split(' ');
  const lines = [];
  let currentLine = '';

  for (const w of words) {
    if ((currentLine + ' ' + w).trim().length <= 18) {
      currentLine = (currentLine + ' ' + w).trim();
    } else {
      if (currentLine) lines.push(currentLine);
      currentLine = w;
    }
    if (lines.length === 3) break;
  }
  if (currentLine && lines.length < 3) lines.push(currentLine);
  if (lines.length === 0) lines.push(cleanTitle.substring(0, 18));

  const startY = lines.length === 1 ? 390 : lines.length === 2 ? 375 : 360;
  const titleSvg = lines.map((l, idx) => {
    const y = startY + idx * 32;
    return `<text x="250" y="${y}" font-family="system-ui, -apple-system, sans-serif" font-size="23" font-weight="800" fill="%23f4f4f5" text-anchor="middle" letter-spacing="-0.5">${encodeURIComponent(l)}</text>`;
  }).join('');

  return `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="500" height="750" viewBox="0 0 500 750"><defs><linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="${p.c1}"/><stop offset="65%" stop-color="${p.c2}"/><stop offset="100%" stop-color="%23000000"/></linearGradient></defs><rect width="500" height="750" fill="url(%23bg)"/><rect x="24" y="24" width="452" height="702" rx="16" fill="none" stroke="${p.line}" stroke-width="2"/><rect x="32" y="32" width="436" height="686" rx="12" fill="none" stroke="${p.accent}" stroke-opacity="0.25" stroke-width="1"/><g transform="translate(210, 195)" fill="${p.accent}" opacity="0.95"><path d="M12 40 L68 40 C72 40 76 44 76 48 L76 72 C76 76 72 80 68 80 L12 80 C8 80 4 76 4 72 L4 48 C4 44 8 40 12 40 Z" fill-opacity="0.15" stroke="${p.accent}" stroke-width="3"/><circle cx="28" cy="60" r="10" fill="none" stroke="${p.accent}" stroke-width="3"/><circle cx="52" cy="60" r="10" fill="none" stroke="${p.accent}" stroke-width="3"/><circle cx="28" cy="60" r="3" fill="${p.accent}"/><circle cx="52" cy="60" r="3" fill="${p.accent}"/><path d="M22 38 L30 14 L50 14 L58 38 Z" fill="none" stroke="${p.accent}" stroke-width="3"/><circle cx="40" cy="22" r="4" fill="${p.accent}"/></g><g transform="translate(48, 64)"><text x="0" y="0" font-family="ui-monospace, monospace" font-size="11" font-weight="700" fill="${p.accent}" letter-spacing="3">FLIX ARCHIVE</text>${year ? `<text x="404" y="0" font-family="ui-monospace, monospace" font-size="12" font-weight="600" fill="%23a1a1aa" text-anchor="end">${year}</text>` : ''}</g>${titleSvg}<g transform="translate(250, 560)">${genre ? `<rect x="-70" y="-14" width="140" height="26" rx="13" fill="%2327272a" stroke="${p.accent}" stroke-opacity="0.4" stroke-width="1"/><text x="0" y="4" font-family="system-ui, sans-serif" font-size="11" font-weight="700" fill="%23e4e4e7" text-anchor="middle" letter-spacing="1">${encodeURIComponent(genre.toUpperCase())}</text>` : ''}${rating ? `<text x="0" y="${genre ? 44 : 10}" font-family="ui-monospace, monospace" font-size="14" font-weight="700" fill="${p.accent}" text-anchor="middle">${rating}</text>` : ''}</g><line x1="180" y1="670" x2="320" y2="670" stroke="${p.line}" stroke-width="1.5"/></svg>`.replace(/\n/g, '');
}

export function getPosterUrl(movie) {
  if (!movie) {
    return getPlaceholderPoster('Cinema');
  }

  // Check explicit full URL first
  if (movie.posterUrl && (movie.posterUrl.startsWith('http://') || movie.posterUrl.startsWith('https://'))) {
    if (!movie.posterUrl.includes('placehold.co')) {
      return movie.posterUrl;
    }
  }

  const rawPath = movie.posterPath || movie.poster_path;
  if (!rawPath || rawPath === 'null' || rawPath === 'undefined' || rawPath.trim() === '') {
    return getPlaceholderPoster(movie);
  }

  if (rawPath.startsWith('http://') || rawPath.startsWith('https://')) {
    return rawPath;
  }

  // Prepend TMDB CDN path
  const cleanPath = rawPath.startsWith('/') ? rawPath : `/${rawPath}`;
  return `https://image.tmdb.org/t/p/w500${cleanPath}`;
}

export function handlePosterError(e, movie) {
  if (e && e.currentTarget) {
    e.currentTarget.onerror = null;
    e.currentTarget.src = getPlaceholderPoster(movie);
  }
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
