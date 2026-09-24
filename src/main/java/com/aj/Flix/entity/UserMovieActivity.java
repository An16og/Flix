package com.aj.Flix.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(
    name = "user_movie_activity",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"user_id", "movie_id", "status"})
    }
)
@Getter
@Setter
@NoArgsConstructor
public class UserMovieActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "user_id", nullable = false)
    private Integer userId;

    @Column(name = "movie_id", nullable = false)
    private Integer movieId;

    /**
     * Activity status: "WATCHLIST", "WATCHED", or "RATED"
     */
    @Column(name = "status", nullable = false, length = 50)
    private String status;

    /**
     * User rating (1.0 to 5.0) when status = 'RATED' or associated with watched/rated
     */
    @Column(name = "rating")
    private Double rating;

    @Column(name = "updated_at")
    private Instant updatedAt = Instant.now();
}
