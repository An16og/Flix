package com.aj.Flix.repository;

import com.aj.Flix.entity.UserMovieActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserMovieActivityRepository extends JpaRepository<UserMovieActivity, Integer> {

    List<UserMovieActivity> findByUserId(Integer userId);

    List<UserMovieActivity> findByUserIdAndStatus(Integer userId, String status);

    Optional<UserMovieActivity> findByUserIdAndMovieIdAndStatus(Integer userId, Integer movieId, String status);

    Optional<UserMovieActivity> findByUserIdAndMovieId(Integer userId, Integer movieId);

    void deleteByUserIdAndMovieIdAndStatus(Integer userId, Integer movieId, String status);

    long countByUserIdAndStatus(Integer userId, String status);

    @Query("SELECT a.movieId FROM UserMovieActivity a WHERE a.userId = :userId AND a.status IN ('WATCHED', 'RATED')")
    List<Integer> findWatchedOrRatedMovieIds(@Param("userId") Integer userId);

    @Query("SELECT a.movieId FROM UserMovieActivity a WHERE a.userId = :userId AND a.status = 'WATCHLIST'")
    List<Integer> findWatchlistMovieIds(@Param("userId") Integer userId);

    @Query("""
        SELECT a FROM UserMovieActivity a
        WHERE a.userId = :userId
          AND (a.status = 'WATCHED' OR (a.status = 'RATED' AND (a.rating IS NULL OR a.rating >= 3.0)))
        ORDER BY a.updatedAt DESC
    """)
    List<UserMovieActivity> findRecentWatches(
            @Param("userId") Integer userId,
            org.springframework.data.domain.Pageable pageable
    );
}
