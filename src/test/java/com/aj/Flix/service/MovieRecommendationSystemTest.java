package com.aj.Flix.service;

import com.aj.Flix.dto.*;
import org.junit.jupiter.api.MethodOrderer;
import org.junit.jupiter.api.Order;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.TestMethodOrder;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.domain.Page;

import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestMethodOrder(MethodOrderer.OrderAnnotation.class)
class MovieRecommendationSystemTest {

    @Autowired
    private UserService userService;

    @Autowired
    private MovieService movieService;

    @Autowired
    private UserActivityService activityService;

    @Autowired
    private RecommendationService recommendationService;

    private static Integer testUserId;
    private static final Integer TOY_STORY_ID = 862;

    @Test
    @Order(1)
    void testUserRegistrationAndLogin() {
        String uniqueSuffix = UUID.randomUUID().toString().substring(0, 8);
        UserRegisterDto reg = UserRegisterDto.builder()
                .username("testuser_" + uniqueSuffix)
                .email("test_" + uniqueSuffix + "@flix.com")
                .password("secret123")
                .favoriteGenres(List.of("Animation", "Comedy", "Adventure"))
                .build();

        UserProfileDto profile = userService.register(reg);
        assertNotNull(profile);
        assertNotNull(profile.getId());
        testUserId = profile.getId();
        assertEquals("testuser_" + uniqueSuffix, profile.getUsername());
        assertTrue(profile.getFavoriteGenres().contains("Animation"));

        // Login test
        UserLoginDto loginDto = UserLoginDto.builder()
                .usernameOrEmail(profile.getUsername())
                .password("secret123")
                .build();
        UserProfileDto loggedIn = userService.login(loginDto);
        assertNotNull(loggedIn);
        assertEquals(profile.getId(), loggedIn.getId());
    }

    @Test
    @Order(2)
    void testMovieBrowsingAndDetails() {
        // Browse movies paginated
        Page<MovieCardDto> page = movieService.browseMovies(0, 10, null, null, "popularity");
        assertNotNull(page);
        assertFalse(page.isEmpty());
        assertTrue(page.getContent().size() <= 10);

        // Fetch Toy Story (id = 862)
        MovieDetailDto detail = movieService.getMovieDetail(TOY_STORY_ID);
        assertNotNull(detail);
        assertEquals(TOY_STORY_ID, detail.getId());
        assertEquals("Toy Story", detail.getTitle());
        assertNotNull(detail.getOverview());
        assertFalse(detail.getGenres().isEmpty());
        assertFalse(detail.getTopCast().isEmpty(), "Cast should be parsed from credits table");
        assertTrue(detail.getDirectors().contains("John Lasseter"), "Director should be John Lasseter");
        assertFalse(detail.getKeywords().isEmpty(), "Keywords should be parsed from keywords table");
    }

    @Test
    @Order(3)
    void testUserMovieActivity() {
        assertNotNull(testUserId, "Test user must exist");

        // 1. Add to Watchlist
        activityService.addToWatchlist(testUserId, TOY_STORY_ID);
        List<MovieCardDto> watchlist = activityService.getWatchlist(testUserId);
        assertEquals(1, watchlist.size());
        assertEquals(TOY_STORY_ID, watchlist.get(0).getId());

        // 2. Mark as Watched
        activityService.markAsWatched(testUserId, TOY_STORY_ID);
        List<MovieCardDto> watched = activityService.getWatched(testUserId);
        assertEquals(1, watched.size());

        // 3. Submit Rating
        activityService.rateMovie(testUserId, TOY_STORY_ID, 4.5);
        var ratings = activityService.getUserRatings(testUserId);
        assertFalse(ratings.isEmpty());
        assertEquals(4.5, ratings.get(0).get("rating"));

        // 4. Submit Review
        ReviewResponseDto review = activityService.addReview(testUserId, TOY_STORY_ID, "Classic Pixar masterpiece!");
        assertNotNull(review);
        assertEquals("Classic Pixar masterpiece!", review.getReviewText());

        var reviews = activityService.getMovieReviews(TOY_STORY_ID);
        assertFalse(reviews.isEmpty());
        assertEquals("Classic Pixar masterpiece!", reviews.get(0).getReviewText());
    }

    @Test
    @Order(4)
    void testColdStartRecommendations() {
        assertNotNull(testUserId);
        // Request recommendations for user
        List<RecommendationItemDto> recommendations =
                recommendationService.getPersonalizedRecommendations(testUserId, 5);
        assertNotNull(recommendations);
        assertFalse(recommendations.isEmpty());
        assertTrue(recommendations.size() <= 5);

        for (RecommendationItemDto item : recommendations) {
            assertNotNull(item.getTitle());
            assertNotNull(item.getHybridScore());
            assertNotNull(item.getRecommendationReason());
        }
    }
}
