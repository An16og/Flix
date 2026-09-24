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
 * Thin HTTP client that wraps the Google Gemini text-embedding API.
 *
 * Endpoint used:
 *   POST https://generativelanguage.googleapis.com/v1beta/models/
 *        text-embedding-004:embedContent?key={apiKey}
 *
 * The model 'text-embedding-004' produces 768-dimensional vectors, which
 * matches the vector(768) column in movies_metadata.
 *
 * Replace the model name in EMBEDDING_URL if you switch to a different
 * Gemini embedding model (e.g. embedding-001 → 768 dims as well).
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiClientService {

    private static final String EMBEDDING_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/" +
            "text-embedding-004:embedContent?key={apiKey}";

    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key}")
    private String apiKey;

    /**
     * Sends a single text string to the Gemini embedding endpoint and returns
     * the resulting float array (length 768).
     *
     * @param text The concatenated movie text to embed.
     * @return     A float[] of length 768, or null if the API call fails.
     */
    public float[] getEmbedding(String text) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Gemini embedContent request body
        Map<String, Object> requestBody = Map.of(
                "model", "models/text-embedding-004",
                "content", Map.of(
                        "parts", List.of(Map.of("text", text))
                )
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
     * Parses the Gemini API JSON response to extract the float array.
     *
     * Expected response structure:
     * {
     *   "embedding": {
     *     "values": [0.123, -0.456, ...]
     *   }
     * }
     */
    private float[] parseEmbeddingResponse(String responseBody) throws Exception {
        JsonNode root = objectMapper.readTree(responseBody);
        JsonNode valuesNode = root.path("embedding").path("values");

        if (valuesNode.isMissingNode() || !valuesNode.isArray()) {
            throw new IllegalStateException(
                    "Unexpected Gemini response structure — 'embedding.values' not found. " +
                    "Response: " + responseBody
            );
        }

        float[] vector = new float[valuesNode.size()];
        for (int i = 0; i < valuesNode.size(); i++) {
            vector[i] = (float) valuesNode.get(i).asDouble();
        }
        return vector;
    }
}
