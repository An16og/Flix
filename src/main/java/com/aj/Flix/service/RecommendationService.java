package com.aj.Flix.service;

import com.aj.Flix.dto.MovieCardDto;
import com.aj.Flix.dto.RecommendationItemDto;
import com.aj.Flix.entity.AppUser;
import com.aj.Flix.entity.Movie;
import com.aj.Flix.entity.UserMovieActivity;
import com.aj.Flix.projection.MovieSearchResultView;
import com.aj.Flix.repository.AppUserRepository;
import com.aj.Flix.repository.MovieRepository;
import com.aj.Flix.repository.UserMovieActivityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RecommendationService {

    private final MovieRepository movieRepository;
    private final UserMovieActivityRepository activityRepository;
    private final AppUserRepository userRepository;
    private final GeminiClientService geminiClientService;
    private final EmbeddingPipelineService embeddingPipelineService;
    private final MovieService movieService;

    /**
     * FR-14, FR-15, FR-17: Content-based movie-to-movie similarity using pgvector.
     */
    public List<RecommendationItemDto> getSimilarMovies(Integer movieId, int limit) {
        Movie targetMovie = movieRepository.findById(movieId)
                .orElseThrow(() -> new IllegalArgumentException("Movie not found: " + movieId));

        // Ensure the target movie has an embedding (generate on-demand if missing)
        if (targetMovie.getEmbedding() == null) {
            log.info("Movie id={} '{}' missing embedding — generating on-demand...", movieId, targetMovie.getTitle());
            boolean success = embeddingPipelineService.embedSingleMovie(movieId);
            if (success) {
                targetMovie = movieRepository.findById(movieId).orElse(targetMovie);
            }
        }

        if (targetMovie.getEmbedding() == null) {
            log.warn("Could not generate embedding for movie id={}. Falling back to genre match.", movieId);
            return fallbackGenreRecommendations(targetMovie, limit);
        }

        String queryVectorStr = vectorToString(targetMovie.getEmbedding());
        List<MovieSearchResultView> results = movieRepository.findSimilarMoviesExcluding(
                queryVectorStr, List.of(movieId), limit);

        String targetTitle = targetMovie.getTitle();
        return results.stream().map(r -> RecommendationItemDto.builder()
                .id(r.getId())
                .title(r.getTitle())
                .posterPath(r.getPosterPath())
                .posterUrl(MovieService.buildPosterUrl(r.getPosterPath()))
                .voteAverage(r.getVoteAverage())
                .voteCount(r.getVoteCount())
                .popularity(r.getPopularity())
                .similarityScore(roundScore(r.getSimilarityScore()))
                .hybridScore(roundScore(calculateHybridScore(r.getSimilarityScore(), r.getVoteAverage(), r.getVoteCount())))
                .recommendationReason("Similar storyline, theme, and genres to '" + targetTitle + "'")
                .build()
        ).toList();
    }

    /**
     * FR-16, FR-17, FR-18, FR-19, FR-20: Personalized recommendations using
     * User Preference Profile Centroid Vector computed from the user's RECENT 5 WATCHES.
     *
     * How it works:
     * 1. Fetches the user's top 5 most recent watched/rated movies (ordered by updatedAt DESC).
     * 2. Applies a recency decay weight (1.0 for most recent down to ~0.7 for 5th) combined with user rating.
     * 3. Calculates the normalized centroid embedding vector across the recent 5 watches.
     * 4. Queries pgvector cosine distance to retrieve top candidate movies matching this centroid.
     * 5. Excludes all previously watched/rated movies to ensure new discovery.
     * 6. Applies hybrid ranking (similarity + IMDb rating + popularity) with transparent explainability.
     */
    public List<RecommendationItemDto> getPersonalizedRecommendations(Integer userId, int limit) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        // 1. Fetch user's recent 5 watches/ratings (ordered by updatedAt DESC)
        List<UserMovieActivity> recentWatches = activityRepository.findRecentWatches(
                userId, PageRequest.of(0, 5));

        // All previously watched/rated movie IDs to exclude from recommendations
        List<Integer> allWatchedOrRatedIds = activityRepository.findWatchedOrRatedMovieIds(userId);
        List<Integer> excludeIds = new ArrayList<>(allWatchedOrRatedIds);

        // 2. Check for Cold Start (user hasn't watched or rated anything)
        if (recentWatches.isEmpty()) {
            List<Integer> watchlistIds = activityRepository.findWatchlistMovieIds(userId);
            if (watchlistIds.isEmpty()) {
                log.info("Cold start for user id={}: returning popular curated recommendations", userId);
                return coldStartRecommendations(user, limit);
            }
            // If they only have watchlist items, use the recent watchlist items as anchor
            List<Movie> watchlistMovies = movieRepository.findAllById(watchlistIds);
            for (int i = 0; i < Math.min(5, watchlistMovies.size()); i++) {
                UserMovieActivity fakeAct = new UserMovieActivity();
                fakeAct.setMovieId(watchlistMovies.get(i).getId());
                fakeAct.setStatus("WATCHLIST");
                recentWatches.add(fakeAct);
            }
        }

        // 3. Compute weights with recency decay for the 5 watches
        // position 0 (most recent) -> 1.0, position 4 -> 0.68
        Map<Integer, Double> movieWeights = new LinkedHashMap<>();
        for (int i = 0; i < recentWatches.size(); i++) {
            UserMovieActivity act = recentWatches.get(i);
            double recencyFactor = 1.0 - (i * 0.08); // recency decay

            double ratingMultiplier = 1.0;
            if (act.getRating() != null) {
                // 5.0 -> 1.2x, 4.0 -> 1.0x, 3.0 -> 0.8x
                ratingMultiplier = Math.max(0.5, act.getRating() / 4.0);
            }

            double finalWeight = recencyFactor * ratingMultiplier;
            movieWeights.put(act.getMovieId(), finalWeight);
        }

        // 4. Load movies and their vector embeddings (generate on-demand if missing)
        List<Movie> anchorMovies = movieRepository.findAllById(movieWeights.keySet());
        Map<Integer, Movie> movieMap = anchorMovies.stream()
                .collect(Collectors.toMap(Movie::getId, m -> m));

        List<float[]> vectors = new ArrayList<>();
        List<Double> weights = new ArrayList<>();
        List<String> anchorTitles = new ArrayList<>();

        for (Map.Entry<Integer, Double> entry : movieWeights.entrySet()) {
            Integer movieId = entry.getKey();
            Double weight = entry.getValue();
            Movie movie = movieMap.get(movieId);
            if (movie == null) continue;

            if (movie.getEmbedding() == null) {
                // Ensure anchor movie has an embedding
                log.info("Generating on-demand embedding for anchor movie id={} '{}'", movieId, movie.getTitle());
                embeddingPipelineService.embedSingleMovie(movieId);
                movie = movieRepository.findById(movieId).orElse(movie);
            }

            if (movie.getEmbedding() != null) {
                vectors.add(movie.getEmbedding());
                weights.add(weight);
                anchorTitles.add(movie.getTitle());
            }
        }

        if (vectors.isEmpty()) {
            return coldStartRecommendations(user, limit);
        }

        // 5. Calculate Normalized Preference Centroid Vector across the recent watches
        float[] userPreferenceVector = computeWeightedCentroid(vectors, weights);
        String prefVectorStr = vectorToString(userPreferenceVector);

        // Guard against empty exclude list for SQL NOT IN clause
        if (excludeIds.isEmpty()) {
            excludeIds.add(-1);
        }

        // 6. Candidate Retrieval: Retrieve 2x candidates from pgvector via cosine distance
        int candidateCount = Math.max(limit * 2, 20);
        List<MovieSearchResultView> candidates = movieRepository.findSimilarMoviesExcluding(
                prefVectorStr, excludeIds, candidateCount);

        // 7. Explainability Note: explicitly mention the recent watches that shaped this centroid
        String anchorSummary;
        if (anchorTitles.size() <= 3) {
            anchorSummary = String.join(", ", anchorTitles);
        } else {
            anchorSummary = String.join(", ", anchorTitles.subList(0, 3)) + " and " + (anchorTitles.size() - 3) + " others";
        }
        String reason = "Centroid match based on your recent watches: " + anchorSummary;

        return candidates.stream()
                .map(c -> {
                    double sim = c.getSimilarityScore() != null ? c.getSimilarityScore() : 0.0;
                    double hybrid = calculateHybridScore(sim, c.getVoteAverage(), c.getVoteCount());
                    return RecommendationItemDto.builder()
                            .id(c.getId())
                            .title(c.getTitle())
                            .posterPath(c.getPosterPath())
                            .posterUrl(MovieService.buildPosterUrl(c.getPosterPath()))
                            .voteAverage(c.getVoteAverage())
                            .voteCount(c.getVoteCount())
                            .popularity(c.getPopularity())
                            .similarityScore(roundScore(sim))
                            .hybridScore(roundScore(hybrid))
                            .recommendationReason(reason)
                            .build();
                })
                .sorted((a, b) -> Double.compare(b.getHybridScore(), a.getHybridScore()))
                .limit(limit)
                .toList();
    }

    /**
     * FR-05 & FR-21: Natural language semantic search using pgvector.
     */
    public List<RecommendationItemDto> searchMovies(String query, int limit) {
        float[] queryVector = geminiClientService.getEmbedding(query);
        if (queryVector == null) {
            throw new IllegalStateException("Failed to generate embedding for query: " + query);
        }

        String vectorStr = vectorToString(queryVector);
        List<MovieSearchResultView> results = movieRepository.findSimilarMovies(vectorStr, limit);

        return results.stream().map(r -> RecommendationItemDto.builder()
                .id(r.getId())
                .title(r.getTitle())
                .posterPath(r.getPosterPath())
                .posterUrl(MovieService.buildPosterUrl(r.getPosterPath()))
                .voteAverage(r.getVoteAverage())
                .voteCount(r.getVoteCount())
                .popularity(r.getPopularity())
                .similarityScore(roundScore(r.getSimilarityScore()))
                .hybridScore(roundScore(calculateHybridScore(r.getSimilarityScore(), r.getVoteAverage(), r.getVoteCount())))
                .recommendationReason("Semantic match for '" + query + "'")
                .build()
        ).toList();
    }

    /**
     * Computes the normalized weighted centroid of multiple embedding vectors.
     */
    private float[] computeWeightedCentroid(List<float[]> vectors, List<Double> weights) {
        int dim = vectors.get(0).length;
        float[] centroid = new float[dim];
        double totalWeight = 0.0;

        for (int i = 0; i < vectors.size(); i++) {
            float[] vec = vectors.get(i);
            double w = weights.get(i);
            totalWeight += w;

            for (int d = 0; d < dim; d++) {
                centroid[d] += (float) (vec[d] * w);
            }
        }

        if (totalWeight > 0.0) {
            for (int d = 0; d < dim; d++) {
                centroid[d] /= totalWeight;
            }
        }

        // L2 Normalization
        double norm = 0.0;
        for (float val : centroid) {
            norm += val * val;
        }
        norm = Math.sqrt(norm);

        if (norm > 0.0) {
            for (int d = 0; d < dim; d++) {
                centroid[d] /= norm;
            }
        }

        return centroid;
    }

    /**
     * Hybrid ranking score combining:
     * - Vector Cosine Similarity (60%)
     * - IMDb Rating normalized (25%)
     * - Vote count / popularity logarithmic factor (15%)
     */
    private double calculateHybridScore(Double similarity, Double voteAverage, Integer voteCount) {
        double simScore = similarity != null ? Math.max(0.0, similarity) : 0.0;
        double ratingScore = voteAverage != null ? Math.min(1.0, voteAverage / 10.0) : 0.5;
        double countScore = voteCount != null ? Math.min(1.0, Math.log1p(voteCount) / 10.0) : 0.3;

        return (0.60 * simScore) + (0.25 * ratingScore) + (0.15 * countScore);
    }

    private List<RecommendationItemDto> coldStartRecommendations(AppUser user, int limit) {
        Page<Movie> topMovies = movieRepository.findPopularMovies(100, PageRequest.of(0, limit));
        return topMovies.getContent().stream().map(m -> RecommendationItemDto.builder()
                .id(m.getId())
                .title(m.getTitle())
                .posterPath(m.getPosterPath())
                .posterUrl(MovieService.buildPosterUrl(m.getPosterPath()))
                .voteAverage(m.getVoteAverage())
                .voteCount(m.getVoteCount())
                .popularity(m.getPopularity())
                .similarityScore(1.0)
                .hybridScore(roundScore((m.getVoteAverage() != null ? m.getVoteAverage() / 10.0 : 0.5)))
                .recommendationReason("Top trending movie on Flix")
                .build()
        ).toList();
    }

    private List<RecommendationItemDto> fallbackGenreRecommendations(Movie movie, int limit) {
        List<String> genres = movieService.parseNames(movie.getGenres());
        String primaryGenre = genres.isEmpty() ? "Drama" : genres.get(0);
        Page<Movie> matches = movieRepository.findByGenresContainingIgnoreCase(primaryGenre, PageRequest.of(0, limit + 1));

        return matches.getContent().stream()
                .filter(m -> !m.getId().equals(movie.getId()))
                .limit(limit)
                .map(m -> RecommendationItemDto.builder()
                        .id(m.getId())
                        .title(m.getTitle())
                        .posterPath(m.getPosterPath())
                        .posterUrl(MovieService.buildPosterUrl(m.getPosterPath()))
                        .voteAverage(m.getVoteAverage())
                        .voteCount(m.getVoteCount())
                        .popularity(m.getPopularity())
                        .similarityScore(0.7)
                        .hybridScore(roundScore((m.getVoteAverage() != null ? m.getVoteAverage() / 10.0 : 0.5)))
                        .recommendationReason("Matches genre '" + primaryGenre + "'")
                        .build()
                ).toList();
    }

    private String vectorToString(float[] vector) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < vector.length; i++) {
            if (i > 0) sb.append(',');
            sb.append(vector[i]);
        }
        return sb.toString();
    }

    private double roundScore(Double val) {
        if (val == null) return 0.0;
        return Math.round(val * 1000.0) / 1000.0;
    }
}
