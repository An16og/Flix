package com.aj.Flix.service;

import com.aj.Flix.entity.Movie;
import com.aj.Flix.repository.MovieRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@SpringBootTest
public class SeedDemoVectorsTest {

    @Autowired
    private MovieRepository movieRepository;

    @Autowired
    private EmbeddingPipelineService embeddingPipelineService;

    /**
     * Seeds realistic 768-dimensional normalized genre-clustered embeddings for
     * anchor and candidate movies so that native pgvector cosine search (<=>)
     * returns actual vector-similarity results during live demonstration.
     */
    @Test
    public void seedDemoEmbeddings() {
        // Genre cluster centers in 768-d space
        // Sci-Fi cluster: peaks at dims 0-40
        // Animation cluster: peaks at dims 50-90
        // Crime cluster: peaks at dims 100-140
        // Romance cluster: peaks at dims 150-190
        // Horror cluster: peaks at dims 200-240

        Map<String, int[]> genreDimRanges = Map.of(
                "Sci-Fi", new int[]{0, 45},
                "Animation", new int[]{50, 95},
                "Crime", new int[]{100, 145},
                "Romance", new int[]{150, 195},
                "Horror", new int[]{200, 245}
        );

        // Map movies to primary genre for clustering
        Map<Integer, String> movieGenreMap = new HashMap<>();

        // Alice's Sci-Fi pool
        movieGenreMap.put(27205, "Sci-Fi");   // Inception
        movieGenreMap.put(157336, "Sci-Fi");  // Interstellar
        movieGenreMap.put(603, "Sci-Fi");     // The Matrix
        movieGenreMap.put(155, "Sci-Fi");     // The Dark Knight
        movieGenreMap.put(348, "Sci-Fi");     // Alien
        movieGenreMap.put(78, "Sci-Fi");      // Blade Runner
        movieGenreMap.put(280, "Sci-Fi");     // Terminator 2: Judgment Day
        movieGenreMap.put(62, "Sci-Fi");      // 2001: A Space Odyssey
        movieGenreMap.put(19995, "Sci-Fi");   // Avatar
        movieGenreMap.put(11, "Sci-Fi");      // Star Wars

        // Bob's Animation pool
        movieGenreMap.put(862, "Animation");   // Toy Story
        movieGenreMap.put(12, "Animation");    // Finding Nemo
        movieGenreMap.put(8587, "Animation");  // The Lion King
        movieGenreMap.put(585, "Animation");   // Monsters, Inc.
        movieGenreMap.put(14160, "Animation"); // Up
        movieGenreMap.put(808, "Animation");   // Shrek
        movieGenreMap.put(10681, "Animation"); // WALL-E
        movieGenreMap.put(6217, "Animation");  // Ratatouille
        movieGenreMap.put(863, "Animation");   // Toy Story 2
        movieGenreMap.put(812, "Animation");   // Aladdin

        // Charlie's Crime pool
        movieGenreMap.put(238, "Crime");   // The Godfather
        movieGenreMap.put(769, "Crime");   // GoodFellas
        movieGenreMap.put(680, "Crime");   // Pulp Fiction
        movieGenreMap.put(550, "Crime");   // Fight Club
        movieGenreMap.put(240, "Crime");   // The Godfather: Part II
        movieGenreMap.put(111, "Crime");   // Scarface
        movieGenreMap.put(524, "Crime");   // Casino
        movieGenreMap.put(103, "Crime");   // Taxi Driver
        movieGenreMap.put(807, "Crime");   // Se7en

        // Diana's Romance pool
        movieGenreMap.put(597, "Romance");   // Titanic
        movieGenreMap.put(13, "Romance");    // Forrest Gump
        movieGenreMap.put(509, "Romance");   // Notting Hill
        movieGenreMap.put(289, "Romance");   // Casablanca
        movieGenreMap.put(510, "Romance");   // One Flew Over the Cuckoo's Nest
        movieGenreMap.put(453, "Romance");   // A Beautiful Mind
        movieGenreMap.put(11216, "Romance"); // Cinema Paradiso

        // Ethan's Horror pool
        movieGenreMap.put(694, "Horror");   // The Shining
        movieGenreMap.put(539, "Horror");   // Psycho
        movieGenreMap.put(948, "Horror");   // Halloween
        movieGenreMap.put(274, "Horror");   // The Silence of the Lambs
        movieGenreMap.put(4232, "Horror");  // Scream
        movieGenreMap.put(745, "Horror");   // The Sixth Sense
        movieGenreMap.put(9373, "Horror");  // The Ring

        Random rnd = new Random(42);
        int seededCount = 0;

        for (Map.Entry<Integer, String> entry : movieGenreMap.entrySet()) {
            Integer movieId = entry.getKey();
            String genre = entry.getValue();

            Optional<Movie> optMovie = movieRepository.findById(movieId);
            if (optMovie.isEmpty()) continue;

            Movie m = optMovie.get();
            int[] range = genreDimRanges.get(genre);

            float[] vec = new float[768];
            float sumSq = 0f;

            // Base random noise across 768 dimensions
            for (int d = 0; d < 768; d++) {
                vec[d] = (float) (rnd.nextGaussian() * 0.05);
            }

            // Cluster boost in the genre range
            for (int d = range[0]; d <= range[1]; d++) {
                vec[d] += (float) (0.6 + rnd.nextDouble() * 0.4);
            }

            // Normalize vector to unit length (L2 norm = 1.0)
            for (float v : vec) sumSq += v * v;
            float norm = (float) Math.sqrt(sumSq);
            for (int d = 0; d < 768; d++) {
                vec[d] /= norm;
            }

            embeddingPipelineService.saveEmbedding(movieId, vec);
            seededCount++;
        }

        System.out.println(">>> SEEDED " + seededCount + " REALISTIC PGVECTOR CLUSTER EMBEDDINGS SUCCESSFULLY! <<<");
    }
}
