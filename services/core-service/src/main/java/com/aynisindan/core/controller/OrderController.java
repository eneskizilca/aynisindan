package com.aynisindan.core.controller;

import com.aynisindan.core.dto.request.CreateOrderRequest;
import com.aynisindan.core.dto.request.CreateReviewRequest;
import com.aynisindan.core.dto.request.SketchEnhanceRequest;
import com.aynisindan.core.dto.response.OrderResponse;
import com.aynisindan.core.dto.response.ReviewResponse;
import com.aynisindan.core.dto.response.SketchEnhanceResponse;
import com.aynisindan.core.service.AiImageGenerationService;
import com.aynisindan.core.service.OrderService;
import com.aynisindan.core.service.StorageService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.util.Collections;
import java.util.Map;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;
    private final StorageService storageService;
    private final AiImageGenerationService aiImageGenerationService;

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getMyOrders() {
        return ResponseEntity.ok(orderService.getMyOrders());
    }

    @GetMapping("/pending")
    public ResponseEntity<List<OrderResponse>> getAllPendingOrders() {
        return ResponseEntity.ok(orderService.getAllPendingOrders());
    }

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@RequestBody CreateOrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orderService.createOrder(request));
    }

    @PostMapping("/upload-sketch")
    public ResponseEntity<Map<String, String>> uploadSketch(@RequestParam("file") MultipartFile file) {
        String fileUrl = storageService.uploadFile(file);
        return ResponseEntity.ok(Collections.singletonMap("url", fileUrl));
    }

    @PostMapping("/enhance-sketch")
    public ResponseEntity<SketchEnhanceResponse> enhanceSketch(
            @RequestPart("sketch") MultipartFile sketch,
            @RequestPart("category") String category,
            @RequestPart("dimensions") String dimensions,
            @RequestPart("material") String material
    ) {
        String sketchUrl = storageService.uploadFile(sketch);
        String aiGeneratedUrl = aiImageGenerationService.enhanceSketch(sketch, category, dimensions, material);
        return ResponseEntity.ok(new SketchEnhanceResponse(sketchUrl, aiGeneratedUrl));
    }

    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<OrderResponse>> getCustomerOrders(@PathVariable UUID customerId) {
        return ResponseEntity.ok(orderService.getCustomerOrders(customerId));
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable UUID orderId) {
        return ResponseEntity.ok(orderService.getOrderById(orderId));
    }

    @PostMapping("/{orderId}/complete")
    public ResponseEntity<OrderResponse> completeOrder(
            @PathVariable UUID orderId) {
        return ResponseEntity.ok(orderService.completeOrder(orderId));
    }

    @PostMapping("/{orderId}/approve")
    public ResponseEntity<OrderResponse> approveDelivery(@PathVariable UUID orderId) {
        return ResponseEntity.ok(orderService.approveDelivery(orderId));
    }

    @PostMapping("/{orderId}/reviews")
    public ResponseEntity<ReviewResponse> addReview(
            @PathVariable UUID orderId,
            @RequestBody CreateReviewRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orderService.addReview(orderId, request));
    }
}
