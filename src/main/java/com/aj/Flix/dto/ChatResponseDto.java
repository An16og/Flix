package com.aj.Flix.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ChatResponseDto {
    private String reply;
    private List<RecommendationItemDto> recommendedMovies;
    private List<String> suggestedPrompts;
}
