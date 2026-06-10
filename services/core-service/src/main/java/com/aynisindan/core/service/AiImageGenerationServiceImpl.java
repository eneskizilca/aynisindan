package com.aynisindan.core.service;

import com.aynisindan.core.config.AiImageGenerationConfig;
import com.aynisindan.core.exception.AiServiceException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.util.Base64;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiImageGenerationServiceImpl implements AiImageGenerationService {

    private final RestClient aiStudioRestClient;
    private final RestClient falRestClient;
    private final AiImageGenerationConfig config;
    private final S3Client s3Client;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Value("${aws.region}")
    private String region;

    @Override
    public String enhanceSketch(MultipartFile sketch, String category, String dimensions, String material) {
        String provider = config.getProvider();
        log.info("Enhancing sketch using AI provider: {}", provider);
        
        if ("mock".equalsIgnoreCase(provider)) {
            log.info("Mock provider active. Returning static dummy image.");
            return "/chair_finished_product.png";
        }
        
        if ("fal-ai".equalsIgnoreCase(provider)) {
            return enhanceWithFalAi(sketch, category, dimensions, material);
        } else {
            return enhanceWithGoogleAi(sketch, category, dimensions, material);
        }
    }

    private String enhanceWithGoogleAi(MultipartFile sketch, String category, String dimensions, String material) {
        try {
            byte[] sketchBytes = sketch.getBytes();
            String base64Image = Base64.getEncoder().encodeToString(sketchBytes);
            
            // Step 1: Use Gemini to analyze the sketch and generate a rich English prompt
            String refinedPrompt = generateEnglishPromptWithGemini(base64Image, category, material, dimensions);
            log.info("Refined prompt for Imagen: {}", refinedPrompt);
            
            // Step 2: Call Google AI Studio (Imagen 3) Text-to-Image with the refined prompt
            String path = "/models/%s:predict?key=%s".formatted(
                    config.getModelName(),
                    config.getApiKey()
            );

            Map<String, Object> instance = Map.of(
                    "prompt", refinedPrompt
            );

            Map<String, Object> params = Map.of(
                    "instances", List.of(instance),
                    "parameters", Map.of(
                            "sampleCount", 1,
                            "aspectRatio", "1:1",
                            "outputMimeType", "image/png"
                    )
            );

            Map<String, Object> response = aiStudioRestClient.post()
                    .uri(path)
                    .body(params)
                    .retrieve()
                    .body(Map.class);

            if (response == null || !response.containsKey("predictions")) {
                throw new AiServiceException("AI Studio Imagen returned an unexpected response.");
            }

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> predictions = (List<Map<String, Object>>) response.get("predictions");
            if (predictions.isEmpty()) {
                throw new AiServiceException("AI Studio Imagen failed to generate an image.");
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> prediction = predictions.get(0);
            @SuppressWarnings("unchecked")
            Map<String, Object> imageResult = (Map<String, Object>) prediction.get("image");
            String generatedBase64 = (String) imageResult.get("bytesBase64Encoded");

            byte[] imageBytes = Base64.getDecoder().decode(generatedBase64);
            return uploadGeneratedImage(imageBytes);

        } catch (Exception e) {
            log.warn("Google AI Image Generation failed, falling back to local static dummy image: {}", e.getMessage());
            return "/chair_finished_product.png";
        }
    }

    private String generateEnglishPromptWithGemini(String base64Image, String category, String material, String dimensions) {
        try {
            String geminiPath = "/models/gemini-1.5-flash:generateContent?key=" + config.getApiKey();
            
            String promptInstructions = String.format(
                    "You are an industrial designer. Analyze this custom design sketch. " +
                    "Category: %s. Material: %s. Dimensions: %s. " +
                    "Generate a highly detailed, professional, and visually rich English prompt for a text-to-image generation model. " +
                    "The prompt should describe a photorealistic, studio-lit product photo of this exact finished object on a clean, solid, light background (like white or light cream). " +
                    "Focus on the wood textures, varnish quality, craftsmanship, and geometry. " +
                    "Provide ONLY the prompt string itself in the response, with no introductory or conversational text, markdown formatting, or quotation marks.",
                    category != null ? category : "woodwork",
                    material != null ? material : "walnut wood",
                    dimensions != null ? dimensions : "standard"
            );
            
            Map<String, Object> textPart = Map.of(
                    "text", promptInstructions
            );
            
            Map<String, Object> imagePart = Map.of(
                    "inlineData", Map.of(
                            "mimeType", "image/png",
                            "data", base64Image
                    )
            );
            
            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(Map.of(
                            "parts", List.of(textPart, imagePart)
                    ))
            );
            
            Map<String, Object> response = aiStudioRestClient.post()
                    .uri(geminiPath)
                    .body(requestBody)
                    .retrieve()
                    .body(Map.class);
                    
            if (response == null || !response.containsKey("candidates")) {
                throw new AiServiceException("Gemini prompt generation failed.");
            }
            
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) response.get("candidates");
            if (candidates.isEmpty()) {
                throw new AiServiceException("Gemini prompt generation returned no candidates.");
            }
            
            @SuppressWarnings("unchecked")
            Map<String, Object> candidate = candidates.get(0);
            @SuppressWarnings("unchecked")
            Map<String, Object> content = (Map<String, Object>) candidate.get("content");
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            if (parts.isEmpty()) {
                throw new AiServiceException("Gemini prompt generation returned no text parts.");
            }
            
            String prompt = (String) parts.get(0).get("text");
            log.info("Gemini generated prompt: {}", prompt);
            return prompt.trim();
        } catch (Exception e) {
            log.warn("Failed to generate prompt using Gemini, falling back to basic template: {}", e.getMessage());
            return String.format("A professional studio-lit product photo of a custom %s, made of %s, dimensions %s, photorealistic, solid wood grain, clean white background, highly detailed.",
                    category != null ? category : "furniture",
                    material != null ? material : "walnut wood",
                    dimensions != null ? dimensions : "standard"
            );
        }
    }

    private String enhanceWithFalAi(MultipartFile sketch, String category, String dimensions, String material) {
        try {
            byte[] sketchBytes = sketch.getBytes();
            String base64Image = Base64.getEncoder().encodeToString(sketchBytes);
            String dataUrl = "data:image/png;base64," + base64Image;

            String prompt = String.format("A professional studio-lit product photo of a custom %s, made of %s, dimensions %s, photorealistic, solid wood grain, clean white background, highly detailed, masterpieces, 8k",
                    category != null ? category : "furniture",
                    material != null ? material : "walnut wood",
                    dimensions != null ? dimensions : "standard"
            );

            Map<String, Object> body = Map.of(
                    "image_url", dataUrl,
                    "prompt", prompt,
                    "controlnet_model", "scribble",
                    "strength", 0.85,
                    "enable_safety_checker", false
            );

            @SuppressWarnings("unchecked")
            Map<String, Object> response = falRestClient.post()
                    .uri("/fal-ai/controlnet/image-to-image")
                    .header("Authorization", "Key " + config.getFalApiKey())
                    .body(body)
                    .retrieve()
                    .body(Map.class);

            if (response == null || !response.containsKey("images")) {
                throw new AiServiceException("Fal.ai returned an empty response.");
            }

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> images = (List<Map<String, Object>>) response.get("images");
            if (images.isEmpty()) {
                throw new AiServiceException("Fal.ai generated no images.");
            }

            String imageUrl = (String) images.get(0).get("url");
            log.info("Fal.ai generated image URL: {}", imageUrl);

            // Download the image from Fal.ai URL and upload to our own S3 for persistence
            byte[] imageBytes = RestClient.create().get()
                    .uri(imageUrl)
                    .retrieve()
                    .body(byte[].class);

            if (imageBytes == null) {
                throw new AiServiceException("Failed to download generated image from Fal.ai.");
            }

            return uploadGeneratedImage(imageBytes);

        } catch (Exception e) {
            log.error("Fal.ai sketch enhancement failed, falling back to Google AI Studio: ", e);
            return enhanceWithGoogleAi(sketch, category, dimensions, material);
        }
    }

    private String uploadGeneratedImage(byte[] imageBytes) {
        try {
            String uniqueFilename = "ai-generated/" + UUID.randomUUID().toString() + ".png";

            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(uniqueFilename)
                    .contentType("image/png")
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(imageBytes));

            return String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, uniqueFilename);
        } catch (Exception e) {
            log.error("AI Üretilen Görsel S3'e Yüklenirken Hata: ", e);
            throw new AiServiceException("Görsel üretildi ancak kaydedilemedi. Lütfen tekrar deneyin.", e);
        }
    }
}
