package com.aj.Flix.controller;

import com.aj.Flix.dto.MovieCardDto;
import com.aj.Flix.dto.RatingRequestDto;
import com.aj.Flix.dto.ReviewRequestDto;
import com.aj.Flix.dto.ReviewResponseDto;
import com.aj.Flix.service.UserActivityService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ActivityController {

    private final UserActivityService activityService;

    // --- Watchlist Endpoints ---

    @PostMapping("/users/{userId}/watchlist/{movieId}")
    public ResponseEntity<Map<String, String>> addToWatchlist(
            @PathVariable Integer userId,
            @PathVariable Integer movieId) {
        activityService.addToWatchlist(userId, movieId);
        return ResponseEntity.ok(Map.of("message", "Movie added to watchlist."));
    }

    @DeleteMapping("/users/{userId}/watchlist/{movieId}")
    public ResponseEntity<Map<String, String>> removeFromWatchlist(
            @PathVariable Integer userId,
            @PathVariable Integer movieId) {
        activityService.removeFromWatchlist(userId, movieId);
        return ResponseEntity.ok(Map.of("message", "Movie removed from watchlist."));
    }

    @GetMapping("/users/{userId}/watchlist")
    public ResponseEntity<List<MovieCardDto>> getWatchlist(@PathVariable Integer userId) {
        return ResponseEntity.ok(activityService.getWatchlist(userId));
    }

    // --- Watched Endpoints ---

    @PostMapping("/users/{userId}/watched/{movieId}")
    public ResponseEntity<Map<String, String>> markAsWatched(
            @PathVariable Integer userId,
            @PathVariable Integer movieId) {
        activityService.markAsWatched(userId, movieId);
        return ResponseEntity.ok(Map.of("message", "Movie marked as watched."));
    }

    @GetMapping("/users/{userId}/watched")
    public ResponseEntity<List<MovieCardDto>> getWatched(@PathVariable Integer userId) {
        return ResponseEntity.ok(activityService.getWatched(userId));
    }

    // --- Rating Endpoints ---

    @PostMapping("/movies/{movieId}/rate")
    public ResponseEntity<Map<String, String>> rateMovie(
            @PathVariable Integer movieId,
            @RequestBody RatingRequestDto request) {
        activityService.rateMovie(request.getUserId(), movieId, request.getRating());
        return ResponseEntity.ok(Map.of("message", "Rating saved successfully."));
    }

    @GetMapping("/users/{userId}/ratings")
    public ResponseEntity<List<Map<String, Object>>> getUserRatings(@PathVariable Integer userId) {
        return ResponseEntity.ok(activityService.getUserRatings(userId));
    }

    // --- Review Endpoints ---

    @PostMapping("/movies/{movieId}/reviews")
    public ResponseEntity<ReviewResponseDto> addReview(
            @PathVariable Integer movieId,
            @RequestBody ReviewRequestDto request) {
        ReviewResponseDto review = activityService.addReview(request.getUserId(), movieId, request.getReviewText());
        return ResponseEntity.status(HttpStatus.CREATED).body(review);
    }

    @GetMapping("/movies/{movieId}/reviews")
    public ResponseEntity<List<ReviewResponseDto>> getMovieReviews(@PathVariable Integer movieId) {
        return ResponseEntity.ok(activityService.getMovieReviews(movieId));
    }
}
