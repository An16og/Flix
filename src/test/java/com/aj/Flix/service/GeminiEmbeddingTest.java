package com.aj.Flix.service;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class GeminiEmbeddingTest {

    @Autowired
    private GeminiClientService geminiClientService;

    @Test
    public void testLiveGeminiEmbedding() {
        float[] vector = geminiClientService.getEmbedding("Christopher Nolan directed Interstellar sci-fi masterpiece");
        assertNotNull(vector, "Embedding vector should not be null");
        assertEquals(768, vector.length, "Embedding dimensionality must be 768");
        System.out.println(">>> LIVE GEMINI EMBEDDING VERIFIED! Length = " + vector.length + " <<<");
    }
}
