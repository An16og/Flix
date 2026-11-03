package com.aj.Flix.service;

import com.aj.Flix.dto.ChatRequestDto;
import com.aj.Flix.dto.ChatResponseDto;
import com.aj.Flix.dto.RecommendationItemDto;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class ChatService {

    private final GeminiClientService geminiClientService;
    private final RecommendationService recommendationService;

    public ChatResponseDto processChat(ChatRequestDto request) {
        String userMessage = request != null && request.message() != null ? request.message().trim() : "";
        if (userMessage.isBlank()) {
            return ChatResponseDto.builder()
                    .reply("Hello! I am your Flix Cinema Concierge. What film or director would you like to explore today?")
                    .recommendedMovies(List.of())
                    .suggestedPrompts(getDefaultSuggestions())
                    .build();
        }

        // 1. Retrieve relevant movies from our pgvector catalog as grounding context
        List<RecommendationItemDto> candidateMovies = new ArrayList<>();
        try {
            candidateMovies = recommendationService.searchMovies(userMessage, 4);
        } catch (Exception e) {
            log.warn("Could not retrieve semantic candidates for chat: {}", e.getMessage());
        }

        // Build context snippet of catalog films
        StringBuilder catalogContext = new StringBuilder();
        if (!candidateMovies.isEmpty()) {
            catalogContext.append("\n\nRelated films currently featured in the Flix catalog:\n");
            for (RecommendationItemDto m : candidateMovies) {
                catalogContext.append(String.format("- **%s** (Rating: %.1f/10): %s\n",
                        m.getTitle(),
                        m.getVoteAverage() != null ? m.getVoteAverage() : 7.0,
                        m.getRecommendationReason() != null ? m.getRecommendationReason() : ""));
            }
        }

        // 2. Formulate System Prompt for Gemini Generative AI
        String systemPrompt = """
                You are Flix Cinema Concierge, an eloquent, passionate, and charismatic film curator (reminiscent of a master filmmaker or Criterion Channel cinephile).
                Engage dynamically with the user. You don't just dump a list of movies; you talk about cinema!
                
                You can:
                - Analyze directors (Christopher Nolan, Quentin Tarantino, David Fincher, Stanley Kubrick, Denis Villeneuve, etc.) and visual aesthetics.
                - Explain complex plot points, psychological twists, and thematic subtext.
                - Compare films, character arcs, and cinematic movements (e.g. Neo-Noir, Cyberpunk, French New Wave).
                - Share captivating behind-the-scenes trivia and film history.
                - Offer personalized recommendations with genuine, thoughtful justification.
                
                Guidelines:
                - Respond directly to what the user asked with wit, depth, and enthusiasm.
                - Keep your reply to 2 or 3 concise, beautifully formatted paragraphs (use markdown bold for **Film Titles**).
                - If the question relates to recommendations or specific themes, seamlessly reference 1 or 2 of the relevant catalog titles provided below, explaining why they are essential viewing.
                - Never say "as an AI model" or sound like a robot. Speak as a passionate film scholar having an exciting conversation in a theater lobby.
                """ + catalogContext;

        // 3. Attempt Gemini Generative Response
        String aiReply = geminiClientService.generateContent(systemPrompt, userMessage);

        // 4. If Gemini is unavailable or rate limited, use Dynamic Cinema Fallback Engine
        if (aiReply == null || aiReply.isBlank()) {
            log.info("Using Dynamic Cinema Engine fallback for query: {}", userMessage);
            aiReply = generateDynamicFallback(userMessage, candidateMovies);
        }

        // 5. Generate Dynamic Follow-Up Suggested Chips
        List<String> suggestedPrompts = generateSuggestedPrompts(userMessage);

        return ChatResponseDto.builder()
                .reply(aiReply)
                .recommendedMovies(candidateMovies)
                .suggestedPrompts(suggestedPrompts)
                .build();
    }

    /**
     * Fallback dynamic cinema analysis generator when API call is rate-limited.
     */
    private String generateDynamicFallback(String query, List<RecommendationItemDto> movies) {
        String lower = query.toLowerCase();

        if (lower.contains("nolan") || lower.contains("inception") || lower.contains("interstellar")) {
            return "Christopher Nolan's cinema is celebrated for translating complex theoretical physics and non-linear memory puzzles into heart-pounding IMAX spectacle. Rather than relying solely on CGI, he anchors high concepts like time dilation and dream infiltration in practical, visceral reality.\n\n" +
                    "If you are drawn to that intellectual vertigo, " + formatMovieMention(movies) +
                    " capture that same relentless escalation where the soundtrack and editing build unbearable psychological tension.";
        } else if (lower.contains("superhero") || lower.contains("batman") || lower.contains("deadpool")) {
            return "Modern comic book cinema operates across a fascinating spectrum: from grounded, operatic crime epics like **The Dark Knight** to self-aware, irreverent meta-satires like **Deadpool**.\n\n" +
                    "What makes the best superhero films endure is their focus on human vulnerability beneath the suit. " +
                    formatMovieMention(movies) + " redefine the genre by taking character stakes seriously while delivering phenomenal visual choreography.";
        } else if (lower.contains("horror") || lower.contains("thriller") || lower.contains("scary") || lower.contains("twist")) {
            return "Great suspense is never about cheap jump scares—it is about architectural tension, claustrophobic sound design, and the slow psychological realization that the protagonist cannot trust their own perception.\n\n" +
                    "Films like " + formatMovieMention(movies) + " masterfully turn the atmosphere itself into a threat, culminating in payoffs that linger in your mind long after the credits roll.";
        } else if (lower.contains("sci-fi") || lower.contains("cyberpunk") || lower.contains("future") || lower.contains("space")) {
            return "Science fiction at its pinnacle is a philosophical mirror reflecting our present anxieties about artificial intelligence, human isolation, and the vast silence of the cosmos.\n\n" +
                    "Titles like " + formatMovieMention(movies) + " pair stunning speculative world-building with profound philosophical questions about what truly defines human consciousness.";
        } else if (lower.contains("crime") || lower.contains("noir") || lower.contains("mafia") || lower.contains("tarantino")) {
            return "Neo-noir and crime masterpieces fascinate us because they exist in the morally gray shadows where survival demands compromised ethics, sharp dialogue, and unforgettable antiheroes.\n\n" +
                    "Exploring " + formatMovieMention(movies) + " gives you that gritty, smoke-filled atmospheric tension characterized by razor-sharp writing and high-stakes tension.";
        } else if (lower.contains("ending") || lower.contains("explain") || lower.contains("meaning")) {
            return "The most celebrated cinema endings intentionally refuse easy resolution—they force the audience to become active collaborators in interpreting the protagonist's journey and moral choices.\n\n" +
                    "When analyzing films like " + formatMovieMention(movies) + ", the ambiguity isn't a plot hole; it's the thematic thesis of the entire cinematic work.";
        } else {
            return "Cinema is the art of shared emotional resonance—whether you're searching for relentless kinetic action, atmospheric character studies, or philosophical world-building.\n\n" +
                    "Based on your thoughts, exploring " + formatMovieMention(movies) + " will give you an exceptional viewing experience with stellar performances and distinctive directorial vision.";
        }
    }

    private String formatMovieMention(List<RecommendationItemDto> movies) {
        if (movies == null || movies.isEmpty()) {
            return "essential masterworks in our archive";
        }
        if (movies.size() == 1) {
            return "**" + movies.get(0).getTitle() + "**";
        }
        return "**" + movies.get(0).getTitle() + "** and **" + movies.get(1).getTitle() + "**";
    }

    private List<String> generateSuggestedPrompts(String query) {
        String lower = query.toLowerCase();
        if (lower.contains("nolan") || lower.contains("inception") || lower.contains("interstellar")) {
            return List.of(
                    "Explain the spinning top ending of Inception",
                    "Compare Christopher Nolan and Denis Villeneuve",
                    "Recommend mind-bending time travel movies"
            );
        } else if (lower.contains("superhero") || lower.contains("batman") || lower.contains("deadpool")) {
            return List.of(
                    "Why is The Dark Knight considered the best superhero movie?",
                    "Recommend gritty R-rated anti-hero films like Logan",
                    "Compare Batman Begins vs Iron Man"
            );
        } else if (lower.contains("thriller") || lower.contains("horror")) {
            return List.of(
                    "What makes psychological horror more frightening than slasher films?",
                    "Recommend movies with the most shocking plot twists",
                    "Explain David Fincher's directing techniques"
            );
        } else if (lower.contains("sci-fi") || lower.contains("cyberpunk")) {
            return List.of(
                    "What makes Blade Runner 2049 a visual masterpiece?",
                    "Recommend philosophical hard sci-fi films",
                    "Explain the concept behind the Matrix red pill"
            );
        } else {
            return List.of(
                    "What are the greatest plot twists in cinema history?",
                    "Recommend high-concept sci-fi thrillers",
                    "Explain the difference between film noir and neo-noir"
            );
        }
    }

    private List<String> getDefaultSuggestions() {
        return List.of(
                "Why is Christopher Nolan's storytelling so compelling?",
                "Recommend superhero blockbusters like Batman and Deadpool",
                "What makes psychological thrillers with plot twists so gripping?",
                "Explain the difference between classic noir and neo-noir"
        );
    }
}
