package com.aj.Flix.repository;

import com.aj.Flix.entity.Movie;
import com.aj.Flix.projection.MovieEmbeddingView;
import com.aj.Flix.projection.MovieSearchResultView;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovieRepository extends JpaRepository<Movie, Integer> {

    /**
     * Fetches a paginated slice of movies that do not yet have an embedding.
     *
     * Uses a JPQL query so Spring Data JPA maps the result set into the
     * MovieEmbeddingView closed projection, loading only the text columns
     * needed by the embedding pipeline (not the full entity with TEXT fields).
     *
     * Usage:
     *   movieRepository.findMoviesMissingEmbeddings(PageRequest.of(page, 50));
     */
    @Query("SELECT m FROM Movie m WHERE m.embedding IS NULL")
    List<MovieEmbeddingView> findMoviesMissingEmbeddings(Pageable pageable);

    /**
     * Performs a k-nearest-neighbour cosine-distance vector search using pgvector's
     * '<=> ' operator (cosine distance). Results are ordered closest-first.
     *
     * The :queryVector parameter must be passed as a plain comma-separated float string
     * (e.g. "0.1,0.2,...") — the CAST(...  as vector) expression lets Postgres coerce it.
     *
     * Column aliases (poster_path as posterPath, vote_average as voteAverage) are required
     * so Spring Data JPA can match them to the MovieSearchResultView getter names.
     */
    @Query(
        value = """
            SELECT
                id,
                title,
                poster_path      AS posterPath,
                vote_average     AS voteAverage,
                vote_count       AS voteCount,
                popularity       AS popularity,
                (1.0 - (embedding <=> CAST(:queryVector AS vector))) AS similarityScore
            FROM movies_metadata
            WHERE embedding IS NOT NULL
            ORDER BY embedding <=> CAST(:queryVector AS vector)
            LIMIT :limit
            """,
        nativeQuery = true
    )
    List<MovieSearchResultView> findSimilarMovies(
            @Param("queryVector") String queryVector,
            @Param("limit") int limit
    );

    @Query(
        value = """
            SELECT
                id,
                title,
                poster_path      AS posterPath,
                vote_average     AS voteAverage,
                vote_count       AS voteCount,
                popularity       AS popularity,
                (1.0 - (embedding <=> CAST(:queryVector AS vector))) AS similarityScore
            FROM movies_metadata
            WHERE embedding IS NOT NULL
              AND id NOT IN (:excludeIds)
            ORDER BY embedding <=> CAST(:queryVector AS vector)
            LIMIT :limit
            """,
        nativeQuery = true
    )
    List<MovieSearchResultView> findSimilarMoviesExcluding(
            @Param("queryVector") String queryVector,
            @Param("excludeIds") List<Integer> excludeIds,
            @Param("limit") int limit
    );

    org.springframework.data.domain.Page<Movie> findByGenresContainingIgnoreCase(String genre, Pageable pageable);

    org.springframework.data.domain.Page<Movie> findByTitleContainingIgnoreCase(String title, Pageable pageable);

    org.springframework.data.domain.Page<Movie> findByTitleContainingIgnoreCaseAndGenresContainingIgnoreCase(
            String title, String genre, Pageable pageable);

    @Query("SELECT m FROM Movie m WHERE m.voteCount > :minVotes ORDER BY m.popularity DESC")
    org.springframework.data.domain.Page<Movie> findPopularMovies(@Param("minVotes") int minVotes, Pageable pageable);

    @Query("SELECT m FROM Movie m WHERE m.voteCount > :minVotes ORDER BY m.voteAverage DESC")
    org.springframework.data.domain.Page<Movie> findTopRatedMovies(@Param("minVotes") int minVotes, Pageable pageable);
}
