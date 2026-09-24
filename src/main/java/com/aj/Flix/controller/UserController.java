package com.aj.Flix.controller;

import com.aj.Flix.dto.UserLoginDto;
import com.aj.Flix.dto.UserProfileDto;
import com.aj.Flix.dto.UserRegisterDto;
import com.aj.Flix.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<UserProfileDto> register(@RequestBody UserRegisterDto dto) {
        UserProfileDto profile = userService.register(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(profile);
    }

    @PostMapping("/login")
    public ResponseEntity<UserProfileDto> login(@RequestBody UserLoginDto dto) {
        UserProfileDto profile = userService.login(dto);
        return ResponseEntity.ok(profile);
    }

    @GetMapping("/{id}/profile")
    public ResponseEntity<UserProfileDto> getProfile(@PathVariable Integer id) {
        UserProfileDto profile = userService.getProfile(id);
        return ResponseEntity.ok(profile);
    }

    @PutMapping("/{id}/preferences")
    public ResponseEntity<UserProfileDto> updatePreferences(
            @PathVariable Integer id,
            @RequestBody List<String> favoriteGenres) {
        UserProfileDto updated = userService.updatePreferences(id, favoriteGenres);
        return ResponseEntity.ok(updated);
    }
}
