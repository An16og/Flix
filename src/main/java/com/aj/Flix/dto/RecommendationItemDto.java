package com.aj.Flix.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RecommendationItemDto {
    private Integer id;
    private String title;
    private String posterPath;
    private String posterUrl;
    private Double voteAverage;
    private Integer voteCount;
    private Double popularity;
    private LocalDate releaseDate;
    private List<String> genres;
    private Double similarityScore;   // Vector similarity [0.0 - 1.0]
    private Double hybridScore;       // Weighted ranking score combining similarity, ratings, popularity
    private String recommendationReason; // Explainability text (e.g. "Because you liked Inception")
}
