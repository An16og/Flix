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
public class SeedDiverseEmbeddingsTest {

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private GeminiClientService geminiClientService;

    @Autowired
    private EmbeddingPipelineService embeddingPipelineService;

    @Test
    public void seedDiverseGenreEmbeddings() {
        List<String> targetGenres = List.of(
                "Science Fiction",
                "Horror",
                "Animation",
                "Crime",
                "Romance",
                "Comedy",
                "Thriller"
        );

        int totalSeeded = 0;

        for (String genre : targetGenres) {
            List<Movie> movies = movieRepository.findByGenresContainingIgnoreCase(
                    genre,
                    PageRequest.of(0, 30, Sort.by(Sort.Direction.DESC, "voteCount"))
            ).getContent();

            int genreCount = 0;
            for (Movie m : movies) {
                if (m.getEmbedding() != null) continue;
                if (m.getVoteCount() == null || m.getVoteCount() < 50) continue;
                if (genreCount >= 15) break; // 15 movies per genre

                String text = String.join(" | ",
                        m.getTitle() != null ? m.getTitle() : "",
                        m.getTagline() != null ? m.getTagline() : "",
                        m.getOverview() != null ? m.getOverview() : "",
                        m.getGenres() != null ? m.getGenres() : ""
                );

                try {
                    float[] vec = geminiClientService.getEmbedding(text);
                    if (vec != null) {
                        embeddingPipelineService.saveEmbedding(m.getId(), vec);
                        genreCount++;
                        totalSeeded++;
                        System.out.println("Seeded [" + genre + " " + genreCount + "/15]: " + m.getTitle());
                    }
                    Thread.sleep(120);
                } catch (Exception e) {
                    System.err.println("Error embedding: " + m.getTitle() + " - " + e.getMessage());
                }
            }
        }

        System.out.println(">>> SUCCESSFULLY SEEDED " + totalSeeded + " DIVERSE GEMINI VECTORS ACROSS ALL GENRES! <<<");
    }
}
