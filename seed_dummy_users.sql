-- Seed 5 realistic dummy users and their recent 5 movie watches, ratings, watchlists, and reviews

-- Password for all dummy users is: password123
-- BCrypt hash: $2a$10$7EqJtq98hPqEX7fNZaFWoOhi5smO7k1jV/V7lP2kE4y3v76q0U3Gy

-- 1. Insert 5 Dummy Users
INSERT INTO app_users (id, username, email, password_hash, favorite_genres, created_at)
VALUES 
    (1, 'alice_scifi', 'alice@flix.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhi5smO7k1jV/V7lP2kE4y3v76q0U3Gy', '["Science Fiction", "Action", "Adventure"]', NOW() - INTERVAL '30 days'),
    (2, 'bob_animation', 'bob@flix.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhi5smO7k1jV/V7lP2kE4y3v76q0U3Gy', '["Animation", "Family", "Comedy"]', NOW() - INTERVAL '25 days'),
    (3, 'charlie_crime', 'charlie@flix.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhi5smO7k1jV/V7lP2kE4y3v76q0U3Gy', '["Crime", "Drama", "Thriller"]', NOW() - INTERVAL '20 days'),
    (4, 'diana_romcom', 'diana@flix.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhi5smO7k1jV/V7lP2kE4y3v76q0U3Gy', '["Romance", "Comedy", "Drama"]', NOW() - INTERVAL '15 days'),
    (5, 'ethan_horror', 'ethan@flix.com', '$2a$10$7EqJtq98hPqEX7fNZaFWoOhi5smO7k1jV/V7lP2kE4y3v76q0U3Gy', '["Horror", "Mystery", "Thriller"]', NOW() - INTERVAL '10 days')
ON CONFLICT (id) DO UPDATE SET 
    username = EXCLUDED.username,
    email = EXCLUDED.email,
    password_hash = EXCLUDED.password_hash,
    favorite_genres = EXCLUDED.favorite_genres;

-- Adjust sequence for app_users
SELECT setval('app_users_id_seq', (SELECT MAX(id) FROM app_users));

-- 2. Insert Recent 5 Watches & Ratings for Alice (Sci-Fi / Nolan / Mind-Bending)
-- Inception (27205), Interstellar (157336), The Matrix (603), The Dark Knight (155), Alien (348)
INSERT INTO user_movie_activity (user_id, movie_id, status, rating, updated_at)
VALUES 
    (1, 27205, 'WATCHED', 5.0, NOW() - INTERVAL '1 hour'),
    (1, 27205, 'RATED', 5.0, NOW() - INTERVAL '1 hour'),
    (1, 157336, 'WATCHED', 5.0, NOW() - INTERVAL '1 day'),
    (1, 157336, 'RATED', 5.0, NOW() - INTERVAL '1 day'),
    (1, 603, 'WATCHED', 4.5, NOW() - INTERVAL '2 days'),
    (1, 603, 'RATED', 4.5, NOW() - INTERVAL '2 days'),
    (1, 155, 'WATCHED', 4.5, NOW() - INTERVAL '3 days'),
    (1, 155, 'RATED', 4.5, NOW() - INTERVAL '3 days'),
    (1, 348, 'WATCHED', 4.0, NOW() - INTERVAL '4 days'),
    (1, 348, 'RATED', 4.0, NOW() - INTERVAL '4 days'),
    (1, 550, 'WATCHLIST', NULL, NOW() - INTERVAL '5 days') -- Watchlist: Fight Club
ON CONFLICT (user_id, movie_id, status) DO UPDATE SET 
    rating = EXCLUDED.rating,
    updated_at = EXCLUDED.updated_at;

-- 3. Insert Recent 5 Watches & Ratings for Bob (Pixar & Disney Animation)
-- Toy Story (862), Finding Nemo (12), The Lion King (8587), Monsters, Inc. (585), Up (14160)
INSERT INTO user_movie_activity (user_id, movie_id, status, rating, updated_at)
VALUES 
    (2, 862, 'WATCHED', 5.0, NOW() - INTERVAL '2 hours'),
    (2, 862, 'RATED', 5.0, NOW() - INTERVAL '2 hours'),
    (2, 12, 'WATCHED', 4.5, NOW() - INTERVAL '1 day'),
    (2, 12, 'RATED', 4.5, NOW() - INTERVAL '1 day'),
    (2, 8587, 'WATCHED', 5.0, NOW() - INTERVAL '3 days'),
    (2, 8587, 'RATED', 5.0, NOW() - INTERVAL '3 days'),
    (2, 585, 'WATCHED', 4.0, NOW() - INTERVAL '4 days'),
    (2, 585, 'RATED', 4.0, NOW() - INTERVAL '4 days'),
    (2, 14160, 'WATCHED', 4.5, NOW() - INTERVAL '5 days'),
    (2, 14160, 'RATED', 4.5, NOW() - INTERVAL '5 days'),
    (2, 808, 'WATCHLIST', NULL, NOW() - INTERVAL '6 days') -- Watchlist: Shrek
ON CONFLICT (user_id, movie_id, status) DO UPDATE SET 
    rating = EXCLUDED.rating,
    updated_at = EXCLUDED.updated_at;

-- 4. Insert Recent 5 Watches & Ratings for Charlie (Crime & Classic Drama)
-- The Godfather (238), GoodFellas (769), Pulp Fiction (680), Fight Club (550), The Dark Knight (155)
INSERT INTO user_movie_activity (user_id, movie_id, status, rating, updated_at)
VALUES 
    (3, 238, 'WATCHED', 5.0, NOW() - INTERVAL '3 hours'),
    (3, 238, 'RATED', 5.0, NOW() - INTERVAL '3 hours'),
    (3, 769, 'WATCHED', 4.5, NOW() - INTERVAL '1 day'),
    (3, 769, 'RATED', 4.5, NOW() - INTERVAL '1 day'),
    (3, 680, 'WATCHED', 5.0, NOW() - INTERVAL '2 days'),
    (3, 680, 'RATED', 5.0, NOW() - INTERVAL '2 days'),
    (3, 550, 'WATCHED', 4.5, NOW() - INTERVAL '3 days'),
    (3, 550, 'RATED', 4.5, NOW() - INTERVAL '3 days'),
    (3, 155, 'WATCHED', 4.0, NOW() - INTERVAL '4 days'),
    (3, 155, 'RATED', 4.0, NOW() - INTERVAL '4 days'),
    (3, 348, 'WATCHLIST', NULL, NOW() - INTERVAL '5 days') -- Watchlist: Alien
ON CONFLICT (user_id, movie_id, status) DO UPDATE SET 
    rating = EXCLUDED.rating,
    updated_at = EXCLUDED.updated_at;

-- 5. Insert Recent 5 Watches & Ratings for Diana (Romance & Feel-Good)
-- Titanic (597), Forrest Gump (13), Notting Hill (509), Toy Story (862), Finding Nemo (12)
INSERT INTO user_movie_activity (user_id, movie_id, status, rating, updated_at)
VALUES 
    (4, 597, 'WATCHED', 4.5, NOW() - INTERVAL '1 hour'),
    (4, 597, 'RATED', 4.5, NOW() - INTERVAL '1 hour'),
    (4, 13, 'WATCHED', 5.0, NOW() - INTERVAL '2 days'),
    (4, 13, 'RATED', 5.0, NOW() - INTERVAL '2 days'),
    (4, 509, 'WATCHED', 4.0, NOW() - INTERVAL '3 days'),
    (4, 509, 'RATED', 4.0, NOW() - INTERVAL '3 days'),
    (4, 862, 'WATCHED', 4.0, NOW() - INTERVAL '4 days'),
    (4, 862, 'RATED', 4.0, NOW() - INTERVAL '4 days'),
    (4, 12, 'WATCHED', 4.0, NOW() - INTERVAL '5 days'),
    (4, 12, 'RATED', 4.0, NOW() - INTERVAL '5 days'),
    (4, 8587, 'WATCHLIST', NULL, NOW() - INTERVAL '6 days') -- Watchlist: The Lion King
ON CONFLICT (user_id, movie_id, status) DO UPDATE SET 
    rating = EXCLUDED.rating,
    updated_at = EXCLUDED.updated_at;

-- 6. Insert Recent 5 Watches & Ratings for Ethan (Horror & Psychological Thriller)
-- The Shining (694), Psycho (539), Alien (348), Halloween (948), Fight Club (550)
INSERT INTO user_movie_activity (user_id, movie_id, status, rating, updated_at)
VALUES 
    (5, 694, 'WATCHED', 5.0, NOW() - INTERVAL '2 hours'),
    (5, 694, 'RATED', 5.0, NOW() - INTERVAL '2 hours'),
    (5, 539, 'WATCHED', 4.5, NOW() - INTERVAL '1 day'),
    (5, 539, 'RATED', 4.5, NOW() - INTERVAL '1 day'),
    (5, 348, 'WATCHED', 4.5, NOW() - INTERVAL '2 days'),
    (5, 348, 'RATED', 4.5, NOW() - INTERVAL '2 days'),
    (5, 948, 'WATCHED', 4.0, NOW() - INTERVAL '4 days'),
    (5, 948, 'RATED', 4.0, NOW() - INTERVAL '4 days'),
    (5, 550, 'WATCHED', 4.0, NOW() - INTERVAL '5 days'),
    (5, 550, 'RATED', 4.0, NOW() - INTERVAL '5 days'),
    (5, 27205, 'WATCHLIST', NULL, NOW() - INTERVAL '6 days') -- Watchlist: Inception
ON CONFLICT (user_id, movie_id, status) DO UPDATE SET 
    rating = EXCLUDED.rating,
    updated_at = EXCLUDED.updated_at;

-- 7. Insert Sample Reviews
INSERT INTO movie_reviews (user_id, movie_id, review_text, created_at)
VALUES 
    (1, 27205, 'Inception is a mind-bending masterpiece by Christopher Nolan! The visual effects and Hans Zimmer score are unmatched.', NOW() - INTERVAL '1 hour'),
    (2, 862, 'Toy Story never gets old! A timeless classic that revolutionized 3D computer animation.', NOW() - INTERVAL '2 hours'),
    (3, 238, 'The absolute gold standard of cinematic storytelling. Marlon Brando and Al Pacino deliver perfection.', NOW() - INTERVAL '3 hours'),
    (4, 597, 'Heartbreaking and visually breathtaking. DiCaprio and Winslet have undeniable chemistry.', NOW() - INTERVAL '1 hour'),
    (5, 694, 'Jack Nicholson''s performance is pure terror. Stanley Kubrick''s psychological horror is an eerie, terrifying tour de force.', NOW() - INTERVAL '2 hours')
ON CONFLICT DO NOTHING;
