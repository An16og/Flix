package com.aj.Flix.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

/**
 * Client for Google Gemini API:
 * 1. Vector Embeddings: gemini-embedding-001 (768-D) for semantic vector search
 * 2. Conversational AI: gemini-flash-lite-latest for dynamic cinema discussions
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiClientService {

    private static final String EMBEDDING_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/" +
            "gemini-embedding-001:embedContent?key={apiKey}";

    private static final String GENERATE_CONTENT_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/" +
            "gemini-flash-lite-latest:generateContent?key={apiKey}";

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key}")
    private String apiKey;

    /**
     * Sends a single text string to the Gemini embedding endpoint and returns
     * the resulting float array (length 768).
     */
    public float[] getEmbedding(String text) {
        if (apiKey == null || apiKey.isBlank() || apiKey.contains("YOUR_GEMINI_API_KEY")) {
            log.warn("Gemini API key is not configured or is placeholder.");
            return null;
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> requestBody = Map.of(
                "model", "models/gemini-embedding-001",
                "content", Map.of(
                        "parts", List.of(Map.of("text", text))
                ),
                "outputDimensionality", 768
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    EMBEDDING_URL,
                    HttpMethod.POST,
                    request,
                    String.class,
                    apiKey
            );

            return parseEmbeddingResponse(response.getBody());

        } catch (Exception e) {
            log.error("Failed to get embedding from Gemini API: {}", e.getMessage());
            return null;
        }
    }

    /**
     * Generates a conversational response using Gemini Flash Lite.
     *
     * @param systemPrompt Character / instructions for the assistant.
     * @param userMessage  The user's prompt or question.
     * @return Markdown formatted natural language reply, or null if API call fails.
     */
    public String generateContent(String systemPrompt, String userMessage) {
        if (apiKey == null || apiKey.isBlank() || apiKey.contains("YOUR_GEMINI_API_KEY")) {
            log.warn("Gemini API key is not configured for generative text.");
            return null;
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        String prompt = (systemPrompt != null && !systemPrompt.isBlank())
                ? systemPrompt + "\n\nUser Question:\n" + userMessage
                : userMessage;

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(Map.of("text", prompt)))
                )
        );

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(
                    GENERATE_CONTENT_URL,
                    HttpMethod.POST,
                    request,
                    String.class,
                    apiKey
            );

            return parseGenerateResponse(response.getBody());

        } catch (Exception e) {
            log.error("Failed to generate content from Gemini API: {}", e.getMessage());
            return null;
        }
    }

    private float[] parseEmbeddingResponse(String responseJson) {
        if (responseJson == null || responseJson.isBlank()) {
            return null;
        }

        try {
            JsonNode root = objectMapper.readTree(responseJson);
            JsonNode valuesNode = root.path("embedding").path("values");

            if (!valuesNode.isArray() || valuesNode.isEmpty()) {
                log.warn("Gemini response missing 'embedding.values' array: {}", responseJson);
                return null;
            }

            float[] vector = new float[valuesNode.size()];
            for (int i = 0; i < valuesNode.size(); i++) {
                vector[i] = (float) valuesNode.get(i).asDouble();
            }

            return vector;

        } catch (Exception e) {
            log.error("Error parsing Gemini embedding response JSON: {}", e.getMessage(), e);
            return null;
        }
    }

    private String parseGenerateResponse(String responseJson) {
        if (responseJson == null || responseJson.isBlank()) {
            return null;
        }

        try {
            JsonNode root = objectMapper.readTree(responseJson);
            JsonNode textNode = root.path("candidates")
                    .path(0)
                    .path("content")
                    .path("parts")
                    .path(0)
                    .path("text");

            if (textNode.isMissingNode() || textNode.asText().isBlank()) {
                return null;
            }
            return textNode.asText().trim();
        } catch (Exception e) {
            log.error("Error parsing Gemini generateContent response JSON: {}", e.getMessage(), e);
            return null;
        }
    }
}
