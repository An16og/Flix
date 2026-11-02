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
 *        gemini-embedding-001:embedContent?key={apiKey}
 *
 * Configured with outputDimensionality = 768, which matches the vector(768)
 * column in PostgreSQL movies_metadata.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class GeminiClientService {

    private static final String EMBEDDING_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/" +
            "gemini-embedding-001:embedContent?key={apiKey}";

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
        if (apiKey == null || apiKey.isBlank() || apiKey.contains("YOUR_GEMINI_API_KEY")) {
            log.warn("Gemini API key is not configured or is placeholder.");
            return null;
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        // Gemini embedContent request body with 768-dimensional output
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
     * Extracts float[] values from Gemini's JSON response:
     * {
     *   "embedding": {
     *     "values": [0.0123, -0.0456, ...]
     *   }
     * }
     */
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
}
