package com.aynisindan.core.dto.request;

import jakarta.validation.constraints.NotBlank;

public record CreateReturnRequest(
        @NotBlank String reason
) {}
