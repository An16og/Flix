package com.aj.Flix.repository;

import com.aj.Flix.entity.MovieReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MovieReviewRepository extends JpaRepository<MovieReview, Integer> {
    List<MovieReview> findByMovieIdOrderByCreatedAtDesc(Integer movieId);
    List<MovieReview> findByUserIdOrderByCreatedAtDesc(Integer userId);
}
