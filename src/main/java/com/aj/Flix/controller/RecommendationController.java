package com.aj.Flix.controller;

import com.aj.Flix.dto.RecommendationItemDto;
import com.aj.Flix.service.EmbeddingPipelineService;
import com.aj.Flix.service.RecommendationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/recommendations")
@RequiredArgsConstructor
@Slf4j
public class RecommendationController {

    private final RecommendationService recommendationService;
    private final EmbeddingPipelineService embeddingPipelineService;

    /**
     * Personalized recommendations tailored to the user's ratings and watchlist.
     * Example:
     *   GET /api/recommendations/user/1?limit=10
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<RecommendationItemDto>> getPersonalizedRecommendations(
            @PathVariable Integer userId,
            @RequestParam(defaultValue = "10") int limit
    ) {
        if (limit < 1 || limit > 50) limit = 10;
        List<RecommendationItemDto> recommendations =
                recommendationService.getPersonalizedRecommendations(userId, limit);
        return ResponseEntity.ok(recommendations);
    }

    /**
     * Content-based recommendations: returns movies semantically similar to a given movie.
     * Example:
     *   GET /api/recommendations/similar/862?limit=10
     */
    @GetMapping("/similar/{movieId}")
    public ResponseEntity<List<RecommendationItemDto>> getSimilarMovies(
            @PathVariable Integer movieId,
            @RequestParam(defaultValue = "10") int limit
    ) {
        if (limit < 1 || limit > 50) limit = 10;
        List<RecommendationItemDto> similar =
                recommendationService.getSimilarMovies(movieId, limit);
        return ResponseEntity.ok(similar);
    }

    /**
     * Trigger background ETL pipeline to generate embeddings for all movies missing them.
     * Example:
     *   POST /api/recommendations/pipeline/generate
     */
    @PostMapping("/pipeline/generate")
    public ResponseEntity<Map<String, String>> triggerBatchEmbedding() {
        log.info("Triggering background embedding pipeline...");
        embeddingPipelineService.generateEmbeddingsForAllMovies();
        return ResponseEntity.accepted().body(Map.of(
                "status", "ACCEPTED",
                "message", "Embedding pipeline started in the background."
        ));
    }

    /**
     * Generate embedding for a single movie immediately.
     * Example:
     *   POST /api/recommendations/pipeline/embed-movie/862
     */
    @PostMapping("/pipeline/embed-movie/{movieId}")
    public ResponseEntity<Map<String, Object>> embedSingleMovie(@PathVariable Integer movieId) {
        boolean success = embeddingPipelineService.embedSingleMovie(movieId);
        return ResponseEntity.ok(Map.of(
                "movieId", movieId,
                "success", success,
                "message", success ? "Embedding generated and saved." : "Failed to generate embedding."
        ));
    }
}
