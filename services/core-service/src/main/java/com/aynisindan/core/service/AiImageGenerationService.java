package com.aynisindan.core.service;

import org.springframework.web.multipart.MultipartFile;

public interface AiImageGenerationService {

    String enhanceSketch(MultipartFile sketch, String category, String dimensions, String material);
}
