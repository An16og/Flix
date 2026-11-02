package com.aj.Flix.service;

import com.aj.Flix.entity.Movie;
import com.aj.Flix.repository.MovieRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;

import java.util.List;

@SpringBootTest
public class SeedTopMoviesEmbeddingsTest {

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private GeminiClientService geminiClientService;

    @Autowired
    private EmbeddingPipelineService embeddingPipelineService;

    @Test
    public void seedTop100MoviesEmbeddings() {
        // Fetch top 100 movies by popularity where embedding is missing
        List<Movie> movies = movieRepository.findAll(
                PageRequest.of(0, 100, Sort.by(Sort.Direction.DESC, "popularity"))
        ).getContent();

        int successCount = 0;
        for (Movie m : movies) {
            if (m.getEmbedding() != null) continue;

            String text = String.join(" | ",
                    m.getTitle() != null ? m.getTitle() : "",
                    m.getTagline() != null ? m.getTagline() : "",
                    m.getOverview() != null ? m.getOverview() : "",
                    m.getGenres() != null ? m.getGenres() : ""
            );

            float[] vec = geminiClientService.getEmbedding(text);
            if (vec != null) {
                embeddingPipelineService.saveEmbedding(m.getId(), vec);
                successCount++;
                System.out.println("Embedded [" + successCount + "/100]: " + m.getTitle());
            }

            // Small delay to be polite to API
            try { Thread.sleep(150); } catch (Exception ignored) {}
        }

        System.out.println(">>> SEEDED " + successCount + " REAL GEMINI EMBEDDINGS INTO POSTGRESQL! <<<");
    }
}
