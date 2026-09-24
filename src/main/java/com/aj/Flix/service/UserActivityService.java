package com.aj.Flix.service;

import com.aj.Flix.dto.MovieCardDto;
import com.aj.Flix.dto.ReviewResponseDto;
import com.aj.Flix.entity.AppUser;
import com.aj.Flix.entity.Movie;
import com.aj.Flix.entity.MovieReview;
import com.aj.Flix.entity.UserMovieActivity;
import com.aj.Flix.repository.AppUserRepository;
import com.aj.Flix.repository.MovieRepository;
import com.aj.Flix.repository.MovieReviewRepository;
import com.aj.Flix.repository.UserMovieActivityRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserActivityService {

    private final UserMovieActivityRepository activityRepository;
    private final MovieReviewRepository reviewRepository;
    private final AppUserRepository userRepository;
    private final MovieRepository movieRepository;
    private final MovieService movieService;

    @Transactional
    public void addToWatchlist(Integer userId, Integer movieId) {
        validateUserAndMovie(userId, movieId);

        Optional<UserMovieActivity> existing = activityRepository
                .findByUserIdAndMovieIdAndStatus(userId, movieId, "WATCHLIST");
        if (existing.isEmpty()) {
            UserMovieActivity activity = new UserMovieActivity();
            activity.setUserId(userId);
            activity.setMovieId(movieId);
            activity.setStatus("WATCHLIST");
            activity.setUpdatedAt(Instant.now());
            activityRepository.save(activity);
        }
    }

    @Transactional
    public void removeFromWatchlist(Integer userId, Integer movieId) {
        activityRepository.deleteByUserIdAndMovieIdAndStatus(userId, movieId, "WATCHLIST");
    }

    public List<MovieCardDto> getWatchlist(Integer userId) {
        List<UserMovieActivity> activities = activityRepository.findByUserIdAndStatus(userId, "WATCHLIST");
        List<Integer> movieIds = activities.stream().map(UserMovieActivity::getMovieId).toList();
        return movieRepository.findAllById(movieIds).stream()
                .map(movieService::toCardDto)
                .toList();
    }

    @Transactional
    public void markAsWatched(Integer userId, Integer movieId) {
        validateUserAndMovie(userId, movieId);

        Optional<UserMovieActivity> existing = activityRepository
                .findByUserIdAndMovieIdAndStatus(userId, movieId, "WATCHED");
        if (existing.isEmpty()) {
            UserMovieActivity activity = new UserMovieActivity();
            activity.setUserId(userId);
            activity.setMovieId(movieId);
            activity.setStatus("WATCHED");
            activity.setUpdatedAt(Instant.now());
            activityRepository.save(activity);
        }
    }

    public List<MovieCardDto> getWatched(Integer userId) {
        List<UserMovieActivity> activities = activityRepository.findByUserIdAndStatus(userId, "WATCHED");
        List<Integer> movieIds = activities.stream().map(UserMovieActivity::getMovieId).toList();
        return movieRepository.findAllById(movieIds).stream()
                .map(movieService::toCardDto)
                .toList();
    }

    @Transactional
    public void rateMovie(Integer userId, Integer movieId, Double rating) {
        validateUserAndMovie(userId, movieId);
        if (rating == null || rating < 0.5 || rating > 5.0) {
            throw new IllegalArgumentException("Rating must be between 0.5 and 5.0.");
        }

        // Also mark as WATCHED when rated
        markAsWatched(userId, movieId);

        Optional<UserMovieActivity> existing = activityRepository
                .findByUserIdAndMovieIdAndStatus(userId, movieId, "RATED");

        UserMovieActivity activity = existing.orElseGet(UserMovieActivity::new);
        activity.setUserId(userId);
        activity.setMovieId(movieId);
        activity.setStatus("RATED");
        activity.setRating(rating);
        activity.setUpdatedAt(Instant.now());
        activityRepository.save(activity);
    }

    public List<Map<String, Object>> getUserRatings(Integer userId) {
        List<UserMovieActivity> ratings = activityRepository.findByUserIdAndStatus(userId, "RATED");
        List<Integer> movieIds = ratings.stream().map(UserMovieActivity::getMovieId).toList();
        Map<Integer, Movie> movieMap = movieRepository.findAllById(movieIds).stream()
                .collect(Collectors.toMap(Movie::getId, m -> m));

        return ratings.stream().map(r -> {
            Movie movie = movieMap.get(r.getMovieId());
            return Map.<String, Object>of(
                    "movieId", r.getMovieId(),
                    "title", movie != null ? movie.getTitle() : "Unknown",
                    "posterPath", movie != null ? movie.getPosterPath() : "",
                    "rating", r.getRating(),
                    "updatedAt", r.getUpdatedAt()
            );
        }).toList();
    }

    @Transactional
    public ReviewResponseDto addReview(Integer userId, Integer movieId, String reviewText) {
        validateUserAndMovie(userId, movieId);
        if (reviewText == null || reviewText.isBlank()) {
            throw new IllegalArgumentException("Review text cannot be empty.");
        }

        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found: " + userId));

        MovieReview review = new MovieReview();
        review.setUserId(userId);
        review.setMovieId(movieId);
        review.setReviewText(reviewText.trim());
        review.setCreatedAt(Instant.now());

        MovieReview saved = reviewRepository.save(review);

        return ReviewResponseDto.builder()
                .id(saved.getId())
                .userId(user.getId())
                .username(user.getUsername())
                .movieId(movieId)
                .reviewText(saved.getReviewText())
                .createdAt(saved.getCreatedAt())
                .build();
    }

    public List<ReviewResponseDto> getMovieReviews(Integer movieId) {
        List<MovieReview> reviews = reviewRepository.findByMovieIdOrderByCreatedAtDesc(movieId);
        List<Integer> userIds = reviews.stream().map(MovieReview::getUserId).distinct().toList();
        Map<Integer, String> userNames = userRepository.findAllById(userIds).stream()
                .collect(Collectors.toMap(AppUser::getId, AppUser::getUsername));

        return reviews.stream().map(r -> ReviewResponseDto.builder()
                .id(r.getId())
                .userId(r.getUserId())
                .username(userNames.getOrDefault(r.getUserId(), "Anonymous"))
                .movieId(r.getMovieId())
                .reviewText(r.getReviewText())
                .createdAt(r.getCreatedAt())
                .build()
        ).toList();
    }

    private void validateUserAndMovie(Integer userId, Integer movieId) {
        if (!userRepository.existsById(userId)) {
            throw new IllegalArgumentException("User not found: " + userId);
        }
        if (!movieRepository.existsById(movieId)) {
            throw new IllegalArgumentException("Movie not found: " + movieId);
        }
    }
}
