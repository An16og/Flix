package com.aj.Flix.service;

import com.aj.Flix.repository.AppUserRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
public class GeminiEmbeddingTest {

    @Autowired
    private GeminiClientService geminiClientService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AppUserRepository userRepository;

    @Test
    public void testLiveGeminiEmbedding() {
        float[] vector = geminiClientService.getEmbedding("Christopher Nolan directed Interstellar sci-fi masterpiece");
        assertNotNull(vector, "Embedding vector should not be null");
        assertEquals(768, vector.length, "Embedding dimensionality must be 768");
        System.out.println(">>> LIVE GEMINI EMBEDDING VERIFIED! Length = " + vector.length + " <<<");
    }

    @Test
    public void resetDemoUsersPassword() {
        String hash = passwordEncoder.encode("password123");
        System.out.println(">>> GENERATED BCrypt HASH for password123: " + hash);
        for (int id = 1; id <= 5; id++) {
            userRepository.findById(id).ifPresent(u -> {
                u.setPasswordHash(hash);
                userRepository.save(u);
                System.out.println("Reset password for user id=" + u.getId() + " (" + u.getUsername() + ", " + u.getEmail() + ")");
            });
        }
    }
}
