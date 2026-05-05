package com.aynisindan.core.dto.request;

public record LoginRequest(
        String email,
        String password
) {}
