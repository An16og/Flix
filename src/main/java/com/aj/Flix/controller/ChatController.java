package com.aj.Flix.controller;

import com.aj.Flix.dto.ChatRequestDto;
import com.aj.Flix.dto.ChatResponseDto;
import com.aj.Flix.service.ChatService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST controller for the dynamic AI Cinema Concierge.
 */
@RestController
@RequestMapping("/api/chat")
@RequiredArgsConstructor
@Slf4j
public class ChatController {

    private final ChatService chatService;

    @PostMapping
    public ResponseEntity<ChatResponseDto> chat(@RequestBody(required = false) ChatRequestDto request) {
        ChatResponseDto response = chatService.processChat(request);
        return ResponseEntity.ok(response);
    }
}
