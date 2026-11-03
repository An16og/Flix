package com.aj.Flix.dto;

import java.util.List;

public record ChatRequestDto(
        String message,
        List<String> history
) {}
