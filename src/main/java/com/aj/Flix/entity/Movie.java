package com.aj.Flix.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

/**
 * JPA Entity mapped to the pre-existing 'movies_metadata' table.
 * DDL is intentionally NOT managed here — the table already exists and is populated.
 *
 * The 'embedding' column is typed as vector(768) in Postgres. We map it to a float[]
 * using Hibernate's SqlTypes.VECTOR, which is provided by the hibernate-vector module
 * bundled transitively through spring-ai-starter-vector-store-pgvector.
 */
@Entity
@Table(name = "movies_metadata")
@Getter
@Setter
@NoArgsConstructor
public class Movie {

    @Id
    @Column(name = "id")
    private Integer id;

    @Column(name = "title")
    private String title;

    /**
     * Large text column — avoid loading in bulk queries; use MovieEmbeddingView
     * or MovieSearchResultView projections instead of the full entity.
     */
    @Column(name = "overview", columnDefinition = "TEXT")
    private String overview;

    @Column(name = "tagline", columnDefinition = "TEXT")
    private String tagline;

    @Column(name = "genres", columnDefinition = "TEXT")
    private String genres;

    @Column(name = "poster_path")
    private String posterPath;

    @Column(name = "vote_average")
    private Double voteAverage;

    @Column(name = "vote_count")
    private Integer voteCount;

    @Column(name = "release_date")
    private java.time.LocalDate releaseDate;

    @Column(name = "popularity")
    private Double popularity;

    @Column(name = "runtime")
    private Double runtime;

    @Column(name = "imdb_id")
    private String imdbId;

    /**
     * Maps to the Postgres 'vector(768)' column type via Hibernate's native
     * SqlTypes.VECTOR support. Requires the 'hibernate-vector' artifact which
     * is pulled in transitively by spring-ai-starter-vector-store-pgvector.
     *
     * If you see a "No JDBC type for SqlTypes.VECTOR" error at startup, add this
     * dependency explicitly to pom.xml:
     *
     * <dependency>
     *   <groupId>org.hibernate.orm</groupId>
     *   <artifactId>hibernate-vector</artifactId>
     *   <!-- version managed by spring-boot-starter-parent -->
     * </dependency>
     */
    @Column(name = "embedding", columnDefinition = "vector(768)")
    @JdbcTypeCode(SqlTypes.VECTOR)
    private float[] embedding;
}
