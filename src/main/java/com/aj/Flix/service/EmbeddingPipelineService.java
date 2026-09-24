package com.aj.Flix.service;

import com.aj.Flix.entity.Movie;
import com.aj.Flix.projection.MovieEmbeddingView;
import com.aj.Flix.repository.MovieRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

/**
 * ETL pipeline that iterates over all movies lacking an embedding,
 * calls the Gemini API to generate a vector, and writes it back to the DB.
 *
 * Key design decisions:
 *  - Runs @Async so the HTTP trigger returns immediately (fire-and-forget).
 *  - Processes movies in batches of BATCH_SIZE (default 50) to stay within
 *    Gemini's rate limits; a Thread.sleep between batches adds back-pressure.
 *  - Uses the MovieEmbeddingView projection to avoid loading every column.
 *  - Fetches the full Movie entity for the save-back (only id + embedding needed).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmbeddingPipelineService {

    private static final int BATCH_SIZE = 50;
    private static final long BATCH_DELAY_MS = 1_000L; // 1 s between batches

    private final MovieRepository movieRepository;
    private final GeminiClientService geminiClientService;

    /**
     * Launches the full embedding pipeline asynchronously.
     *
     * The method iterates page-by-page over movies where embedding IS NULL.
     * After each batch it sleeps BATCH_DELAY_MS to respect Gemini rate limits.
     *
     * Note: @Async requires @EnableAsync on your main application class or a
     * @Configuration class. Add @EnableAsync to FlixApplication if not present.
     */
    @Async
    public void generateEmbeddingsForAllMovies() {
        log.info("=== Embedding pipeline started ===");
        int page = 0;
        int totalProcessed = 0;
        int totalFailed = 0;

        while (true) {
            Pageable pageable = PageRequest.of(page, BATCH_SIZE);
            List<MovieEmbeddingView> batch = movieRepository.findMoviesMissingEmbeddings(pageable);

            if (batch.isEmpty()) {
                log.info("=== Embedding pipeline finished. Processed: {}, Failed: {} ===",
                        totalProcessed, totalFailed);
                break;
            }

            log.info("Processing batch {} ({} movies)...", page + 1, batch.size());

            for (MovieEmbeddingView view : batch) {
                try {
                    String inputText = buildEmbeddingInput(view);
                    float[] vector = geminiClientService.getEmbedding(inputText);

                    if (vector == null) {
                        log.warn("  [SKIP] Movie id={} — Gemini returned null embedding", view.getId());
                        totalFailed++;
                        continue;
                    }

                    saveEmbedding(view.getId(), vector);
                    totalProcessed++;
                    log.debug("  [OK] Movie id={} '{}'", view.getId(), view.getTitle());

                } catch (Exception e) {
                    log.error("  [FAIL] Movie id={} — {}", view.getId(), e.getMessage());
                    totalFailed++;
                }
            }

            // After successfully writing a batch, always re-query page 0.
            // The WHERE embedding IS NULL clause shrinks with each commit,
            // so the next page 0 will contain the next un-embedded batch.
            // This avoids pagination drift (rows shifting as embeddings are saved).
            // page stays at 0 intentionally.

            try {
                log.debug("Sleeping {}ms before next batch...", BATCH_DELAY_MS);
                Thread.sleep(BATCH_DELAY_MS);
            } catch (InterruptedException ie) {
                Thread.currentThread().interrupt();
                log.warn("Embedding pipeline interrupted — stopping early.");
                break;
            }
        }
    }

    /**
     * Concatenates the relevant text fields into a single embedding input string.
     * Null-safe: missing fields are silently omitted.
     */
    private String buildEmbeddingInput(MovieEmbeddingView view) {
        return Arrays.stream(new String[]{
                        view.getTitle(),
                        view.getTagline(),
                        view.getOverview(),
                        view.getGenres()
                })
                .filter(s -> s != null && !s.isBlank())
                .collect(Collectors.joining(" | "));
    }

    /**
     * Loads the minimal Movie entity (only id is strictly needed by JPA to
     * locate the row) and sets the embedding, then saves.
     *
     * Using a dedicated @Transactional method keeps each movie's commit
     * independent — a single failed save does not roll back the whole batch.
     */
    @Transactional
    public void saveEmbedding(Integer movieId, float[] vector) {
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new IllegalArgumentException("Movie not found: " + movieId));
        movie.setEmbedding(vector);
        movieRepository.save(movie);
    }

    @Transactional
    public boolean embedSingleMovie(Integer movieId) {
        Movie movie = movieRepository.findById(movieId)
                .orElseThrow(() -> new IllegalArgumentException("Movie not found: " + movieId));

        String inputText = Arrays.stream(new String[]{
                        movie.getTitle(),
                        movie.getTagline(),
                        movie.getOverview(),
                        movie.getGenres()
                })
                .filter(s -> s != null && !s.isBlank())
                .collect(Collectors.joining(" | "));

        float[] vector = geminiClientService.getEmbedding(inputText);
        if (vector == null) {
            log.warn("Gemini returned null embedding for movie id={}", movieId);
            return false;
        }

        movie.setEmbedding(vector);
        movieRepository.save(movie);
        log.info("Successfully generated and saved embedding for movie id={} '{}'", movieId, movie.getTitle());
        return true;
    }
}
