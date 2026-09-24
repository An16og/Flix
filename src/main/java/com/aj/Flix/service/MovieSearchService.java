package com.aj.Flix.service;

import com.aj.Flix.projection.MovieSearchResultView;
import com.aj.Flix.repository.MovieRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Service for the semantic search feature.
 *
 * Converts a natural-language query string into a Gemini embedding vector,
 * then delegates the KNN cosine-distance search to the native pgvector query
 * in MovieRepository.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class MovieSearchService {

    private final MovieRepository movieRepository;
    private final GeminiClientService geminiClientService;

    /**
     * Performs a semantic similarity search against the movies_metadata table.
     *
     * @param query Natural-language search string (e.g. "space opera with a robot")
     * @param limit Maximum number of results to return.
     * @return      Ordered list of lightweight MovieSearchResultView projections.
     */
    public List<MovieSearchResultView> search(String query, int limit) {
        log.info("Semantic search: query='{}', limit={}", query, limit);

        float[] queryVector = geminiClientService.getEmbedding(query);
        if (queryVector == null) {
            throw new IllegalStateException("Failed to generate embedding for search query.");
        }

        // Convert float[] → "0.1,0.2,..." for the native SQL CAST(... as vector)
        String vectorString = floatArrayToString(queryVector);
        return movieRepository.findSimilarMovies(vectorString, limit);
    }

    /**
     * Converts a float array to the comma-separated string that Postgres's
     * CAST(text as vector) operator expects (no surrounding brackets needed
     * because pgvector's text input format accepts plain CSV as well).
     *
     * Example: [0.1f, -0.2f] → "0.1,-0.2"
     */
    private String floatArrayToString(float[] vector) {
        StringBuilder sb = new StringBuilder();
        for (int i = 0; i < vector.length; i++) {
            if (i > 0) sb.append(',');
            sb.append(vector[i]);
        }
        return sb.toString();
    }
}
