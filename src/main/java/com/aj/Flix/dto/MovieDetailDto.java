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
public class MovieDetailDto {
    private Integer id;
    private String title;
    private String tagline;
    private String overview;
    private String posterPath;
    private String posterUrl;
    private String imdbId;
    private String imdbUrl;
    private Double voteAverage;
    private Integer voteCount;
    private Double popularity;
    private LocalDate releaseDate;
    private Double runtime;
    private List<String> genres;
    private List<CastMemberDto> topCast;
    private List<String> directors;
    private List<String> keywords;
    private boolean hasEmbedding;
}
