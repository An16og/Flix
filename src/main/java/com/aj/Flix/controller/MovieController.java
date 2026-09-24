package com.aj.Flix.controller;

import com.aj.Flix.dto.MovieCardDto;
import com.aj.Flix.dto.MovieDetailDto;
import com.aj.Flix.dto.RecommendationItemDto;
import com.aj.Flix.service.MovieService;
import com.aj.Flix.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * REST controller for movie browsing, details, and natural-language semantic search.
 */
@RestController
@RequestMapping("/api/movies")
@RequiredArgsConstructor
@Slf4j
public class MovieController {

    private final MovieService movieService;
    private final RecommendationService recommendationService;

    /**
     * Browse movies with pagination, genre filter, search filter, and sorting.
     * Example:
     *   GET /api/movies?page=0&size=20&genre=Action&sortBy=popularity
     */
    @GetMapping
    public ResponseEntity<Page<MovieCardDto>> browseMovies(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            @RequestParam(required = false) String genre,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "popularity") String sortBy
    ) {
        Page<MovieCardDto> movies = movieService.browseMovies(page, size, genre, search, sortBy);
        return ResponseEntity.ok(movies);
    }

    /**
     * Get list of all standard movie genres for frontend filter dropdowns.
     * Example:
     *   GET /api/movies/genres
     */
    @GetMapping("/genres")
    public ResponseEntity<List<String>> getAllGenres() {
        return ResponseEntity.ok(movieService.getAllGenres());
    }

    /**
     * Get top trending movies (sorted by popularity with minimum vote threshold).
     * Example:
     *   GET /api/movies/trending?limit=15
     */
    @GetMapping("/trending")
    public ResponseEntity<List<MovieCardDto>> getTrendingMovies(
            @RequestParam(defaultValue = "12") int limit
    ) {
        if (limit < 1 || limit > 50) limit = 12;
        return ResponseEntity.ok(movieService.getTrendingMovies(limit));
    }

    /**
     * Get all-time top-rated movies (sorted by vote average with vote count > 200).
     * Example:
     *   GET /api/movies/top-rated?limit=15
     */
    @GetMapping("/top-rated")
    public ResponseEntity<List<MovieCardDto>> getTopRatedMovies(
            @RequestParam(defaultValue = "12") int limit
    ) {
        if (limit < 1 || limit > 50) limit = 12;
        return ResponseEntity.ok(movieService.getTopRatedMovies(limit));
    }

    /**
     * Get complete movie details including cast, director, keywords, and metadata.
     * Example:
     *   GET /api/movies/862
     */
    @GetMapping("/{id}")
    public ResponseEntity<MovieDetailDto> getMovieDetail(@PathVariable Integer id) {
        MovieDetailDto detail = movieService.getMovieDetail(id);
        return ResponseEntity.ok(detail);
    }

    /**
     * Semantic search endpoint using Gemini embeddings + pgvector cosine similarity.
     * Example:
     *   GET /api/movies/search?query=space+adventure+with+robots&limit=10
     */
    @GetMapping("/search")
    public ResponseEntity<List<RecommendationItemDto>> searchMovies(
            @RequestParam String query,
            @RequestParam(defaultValue = "10") int limit
    ) {
        if (query == null || query.isBlank()) {
            return ResponseEntity.badRequest().build();
        }
        if (limit < 1 || limit > 50) {
            limit = 10;
        }

        List<RecommendationItemDto> results = recommendationService.searchMovies(query, limit);
        return ResponseEntity.ok(results);
    }
}
