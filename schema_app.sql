-- 1. Enable pgvector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Add embedding column to movies_metadata (768 dimensions for Gemini text-embedding-004)
ALTER TABLE movies_metadata ADD COLUMN IF NOT EXISTS embedding vector(768);

-- 3. Application Users table
CREATE TABLE IF NOT EXISTS app_users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    favorite_genres TEXT, -- JSON or comma-separated list of preferred genres
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. User Movie Activity (Watchlist, Watched, and User Ratings)
CREATE TABLE IF NOT EXISTS user_movie_activity (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    movie_id INT NOT NULL REFERENCES movies_metadata(id) ON DELETE CASCADE,
    status VARCHAR(50) NOT NULL, -- 'WATCHLIST', 'WATCHED', 'RATED'
    rating NUMERIC(3, 1),        -- User rating from 1.0 to 5.0
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_user_movie_status UNIQUE (user_id, movie_id, status)
);

-- 5. User Movie Reviews
CREATE TABLE IF NOT EXISTS movie_reviews (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL REFERENCES app_users(id) ON DELETE CASCADE,
    movie_id INT NOT NULL REFERENCES movies_metadata(id) ON DELETE CASCADE,
    review_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Indexes for high-performance querying
CREATE INDEX IF NOT EXISTS idx_activity_user ON user_movie_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_movie ON user_movie_activity(movie_id);
CREATE INDEX IF NOT EXISTS idx_reviews_movie ON movie_reviews(movie_id);
