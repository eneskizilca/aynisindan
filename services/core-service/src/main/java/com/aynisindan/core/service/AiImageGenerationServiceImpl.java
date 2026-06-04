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
import software.amazon.awssdk.services.s3.model.ObjectCannedACL;
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
    private final AiImageGenerationConfig config;
    private final S3Client s3Client;

    @Value("${aws.s3.bucket-name}")
    private String bucketName;

    @Value("${aws.region}")
    private String region;

    private static final String PROMPT_TEMPLATE = """
            Sen bir endustriyel tasarımcısın. Ekteki kaba çizimi ve şu detayları kullanarak,
            bir %s ustasının bakarak aynısını üretebileceği, fotogerçekçi, net ışıklandırılmış
            bir referans ürün görseli oluştur. Malzeme: %s. Ölçüler: %s.
            Görsel beyaz arka plan üzerinde, profesyonel ürün fotoğrafı kalitesinde olmalı.
            """;

    @Override
    public String enhanceSketch(MultipartFile sketch, String category, String dimensions, String material) {
        try {
            String base64Image = Base64.getEncoder().encodeToString(sketch.getBytes());
            String prompt = PROMPT_TEMPLATE.formatted(
                    category != null ? category : "zanaatkar",
                    material != null ? material : "belirtilmemis",
                    dimensions != null ? dimensions : "belirtilmemis"
            );

            String path = "/models/%s:predict?key=%s".formatted(
                    config.getModelName(),
                    config.getApiKey()
            );

            Map<String, Object> instance = Map.of(
                    "prompt", prompt,
                    "image", Map.of(
                            "bytesBase64Encoded", base64Image
                    )
            );

            Map<String, Object> params = Map.of(
                    "instances", List.of(instance),
                    "parameters", Map.of(
                            "sampleCount", 1,
                            "aspectRatio", "1:1",
                            "addWatermark", false
                    )
            );

            Map<String, Object> response = aiStudioRestClient.post()
                    .uri(path)
                    .body(params)
                    .retrieve()
                    .body(Map.class);

            if (response == null || !response.containsKey("predictions")) {
                throw new AiServiceException("AI servisi beklenmeyen bir yanıt döndürdü.");
            }

            @SuppressWarnings("unchecked")
            List<Map<String, Object>> predictions = (List<Map<String, Object>>) response.get("predictions");
            if (predictions.isEmpty()) {
                throw new AiServiceException("AI servisi görsel üretemedi.");
            }

            @SuppressWarnings("unchecked")
            Map<String, Object> prediction = predictions.get(0);
            @SuppressWarnings("unchecked")
            Map<String, Object> imageResult = (Map<String, Object>) prediction.get("image");
            String generatedBase64 = (String) imageResult.get("bytesBase64Encoded");

            byte[] imageBytes = Base64.getDecoder().decode(generatedBase64);
            return uploadGeneratedImage(imageBytes);

        } catch (AiServiceException e) {
            log.error("AI Görsel Üretim Hatası (Beklenen): {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            log.error("AI Görsel Üretim Hatası: ", e);
            throw new AiServiceException("Su an yogunluk var, lutfen sadece eskiziniz ile siparis olusturun veya birazdan tekrar deneyin.", e);
        }
    }

    private String uploadGeneratedImage(byte[] imageBytes) {
        try {
            String uniqueFilename = "ai-generated/" + UUID.randomUUID().toString() + ".png";

            PutObjectRequest putObjectRequest = PutObjectRequest.builder()
                    .bucket(bucketName)
                    .key(uniqueFilename)
                    .contentType("image/png")
                    .acl(ObjectCannedACL.PUBLIC_READ)
                    .build();

            s3Client.putObject(putObjectRequest, RequestBody.fromBytes(imageBytes));

            return String.format("https://%s.s3.%s.amazonaws.com/%s", bucketName, region, uniqueFilename);
        } catch (Exception e) {
            log.error("AI Üretilen Görsel S3'e Yüklenirken Hata: ", e);
            throw new AiServiceException("Gorsel uretildi ancak kaydedilemedi. Lutfen tekrar deneyin.", e);
        }
    }
}
