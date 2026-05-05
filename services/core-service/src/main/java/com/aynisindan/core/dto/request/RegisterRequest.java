package com.aynisindan.core.dto.request;

import com.aynisindan.core.model.enums.UserRole;

public record RegisterRequest(
        String fullName,
        String email,
        String password,
        UserRole role
) {}
