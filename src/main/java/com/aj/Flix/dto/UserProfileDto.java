package com.aj.Flix.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.Instant;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserProfileDto {
    private Integer id;
    private String username;
    private String email;
    private List<String> favoriteGenres;
    private Instant createdAt;
    private long watchlistCount;
    private long watchedCount;
    private long ratingCount;
}
