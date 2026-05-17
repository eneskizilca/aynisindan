package com.aynisindan.core.dto.response;

public record AuthResponse(
        String token,
        java.util.UUID userId,
        String fullName,
        String email,
        String role
) {}
