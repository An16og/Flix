package com.aj.Flix.service;

import com.aj.Flix.dto.UserLoginDto;
import com.aj.Flix.dto.UserProfileDto;
import com.aj.Flix.dto.UserRegisterDto;
import com.aj.Flix.entity.AppUser;
import com.aj.Flix.repository.AppUserRepository;
import com.aj.Flix.repository.UserMovieActivityRepository;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.Collections;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserService {

    private final AppUserRepository userRepository;
    private final UserMovieActivityRepository activityRepository;
    private final PasswordEncoder passwordEncoder;
    private final ObjectMapper objectMapper;

    @Transactional
    public UserProfileDto register(UserRegisterDto dto) {
        if (dto.getUsername() == null || dto.getUsername().isBlank()) {
            throw new IllegalArgumentException("Username is required.");
        }
        if (dto.getEmail() == null || dto.getEmail().isBlank()) {
            throw new IllegalArgumentException("Email is required.");
        }
        if (dto.getPassword() == null || dto.getPassword().length() < 4) {
            throw new IllegalArgumentException("Password must be at least 4 characters.");
        }

        if (userRepository.existsByUsername(dto.getUsername())) {
            throw new IllegalArgumentException("Username '" + dto.getUsername() + "' is already taken.");
        }
        if (userRepository.existsByEmail(dto.getEmail())) {
            throw new IllegalArgumentException("Email '" + dto.getEmail() + "' is already registered.");
        }

        AppUser user = new AppUser();
        user.setUsername(dto.getUsername().trim());
        user.setEmail(dto.getEmail().trim().toLowerCase());
        user.setPasswordHash(passwordEncoder.encode(dto.getPassword()));
        user.setCreatedAt(Instant.now());

        if (dto.getFavoriteGenres() != null && !dto.getFavoriteGenres().isEmpty()) {
            try {
                user.setFavoriteGenres(objectMapper.writeValueAsString(dto.getFavoriteGenres()));
            } catch (Exception e) {
                user.setFavoriteGenres("[]");
            }
        } else {
            user.setFavoriteGenres("[]");
        }

        AppUser saved = userRepository.save(user);
        return toProfileDto(saved);
    }

    public UserProfileDto login(UserLoginDto dto) {
        if (dto.getUsernameOrEmail() == null || dto.getPassword() == null) {
            throw new IllegalArgumentException("Username/email and password are required.");
        }

        AppUser user = userRepository.findByUsernameOrEmail(dto.getUsernameOrEmail(), dto.getUsernameOrEmail())
                .orElseThrow(() -> new IllegalArgumentException("Invalid username or password."));

        if (!passwordEncoder.matches(dto.getPassword(), user.getPasswordHash())) {
            throw new IllegalArgumentException("Invalid username or password.");
        }

        return toProfileDto(user);
    }

    public UserProfileDto getProfile(Integer userId) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));
        return toProfileDto(user);
    }

    @Transactional
    public UserProfileDto updatePreferences(Integer userId, List<String> favoriteGenres) {
        AppUser user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found with id: " + userId));

        try {
            user.setFavoriteGenres(objectMapper.writeValueAsString(favoriteGenres));
        } catch (Exception e) {
            log.error("Failed to serialize favorite genres: {}", e.getMessage());
        }

        AppUser saved = userRepository.save(user);
        return toProfileDto(saved);
    }

    public UserProfileDto toProfileDto(AppUser user) {
        List<String> genres = Collections.emptyList();
        if (user.getFavoriteGenres() != null && !user.getFavoriteGenres().isBlank()) {
            try {
                genres = objectMapper.readValue(user.getFavoriteGenres(), new TypeReference<List<String>>() {});
            } catch (Exception ignored) {}
        }

        long watchlistCount = activityRepository.countByUserIdAndStatus(user.getId(), "WATCHLIST");
        long watchedCount = activityRepository.countByUserIdAndStatus(user.getId(), "WATCHED");
        long ratingCount = activityRepository.countByUserIdAndStatus(user.getId(), "RATED");

        return UserProfileDto.builder()
                .id(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .favoriteGenres(genres)
                .createdAt(user.getCreatedAt())
                .watchlistCount(watchlistCount)
                .watchedCount(watchedCount)
                .ratingCount(ratingCount)
                .build();
    }
}
