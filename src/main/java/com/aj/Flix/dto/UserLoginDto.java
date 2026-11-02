package com.aj.Flix.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserLoginDto {
    private String usernameOrEmail;
    private String email;
    private String password;

    public String getUsernameOrEmail() {
        if (usernameOrEmail != null && !usernameOrEmail.isBlank()) {
            return usernameOrEmail.trim();
        }
        return email != null ? email.trim() : null;
    }
}
