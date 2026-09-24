package com.aj.Flix.config;

import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.web.client.RestTemplate;

/**
 * Application-wide bean configuration.
 *
 * - RestTemplate: used by GeminiClientService for HTTP calls to the Gemini API.
 * - ObjectMapper: shared JSON parser for parsing Gemini responses.
 * - @EnableAsync:  activates Spring's async task executor so that
 *                  @Async on EmbeddingPipelineService.generateEmbeddingsForAllMovies()
 *                  actually runs on a background thread pool thread instead of the
 *                  calling HTTP thread.
 */
@Configuration
@EnableAsync
public class AppConfig {

    @Bean
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }

    @Bean
    public ObjectMapper objectMapper() {
        return new ObjectMapper()
                // Don't fail if Gemini adds new fields we haven't mapped
                .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    }

    @Bean
    public org.springframework.security.crypto.password.PasswordEncoder passwordEncoder() {
        return new org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder();
    }
}
