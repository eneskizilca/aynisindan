package com.aynisindan.core.controller;

import com.aynisindan.core.dto.request.CreateOrderRequest;
import com.aynisindan.core.dto.request.CreateReviewRequest;
import com.aynisindan.core.dto.response.OrderResponse;
import com.aynisindan.core.dto.response.ReviewResponse;
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

    /**
     * GET /api/v1/orders
     * JWT'deki kullanıcıya ait tüm siparişleri listeler.
     */
    @GetMapping
    public ResponseEntity<List<OrderResponse>> getMyOrders() {
        return ResponseEntity.ok(orderService.getMyOrders());
    }

    /**
     * POST /api/v1/orders
     * Yeni bir sipariş oluşturur.
     */
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@RequestBody CreateOrderRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orderService.createOrder(request));
    }

    /**
     * POST /api/v1/orders/upload-sketch
     * Uploads a reference image/sketch to S3.
     */
    @PostMapping("/upload-sketch")
    public ResponseEntity<Map<String, String>> uploadSketch(@RequestParam("file") MultipartFile file) {
        String fileUrl = storageService.uploadFile(file);
        return ResponseEntity.ok(Collections.singletonMap("url", fileUrl));
    }

    /**
     * GET /api/v1/orders/customer/{customerId}
     * Verilen müşteriye ait tüm siparişleri listeler.
     */
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<OrderResponse>> getCustomerOrders(@PathVariable UUID customerId) {
        return ResponseEntity.ok(orderService.getCustomerOrders(customerId));
    }

    /**
     * GET /api/v1/orders/{orderId}
     * Sipariş detaylarını getirir.
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable UUID orderId) {
        return ResponseEntity.ok(orderService.getOrderById(orderId));
    }

    /**
     * POST /api/v1/orders/{orderId}/complete
     * Zanaatkar siparişi teslim eder → DELIVERED.
     * Yalnızca atanmış zanaatkar çağırabilir.
     */
    @PostMapping("/{orderId}/complete")
    public ResponseEntity<OrderResponse> completeOrder(
            @PathVariable UUID orderId) {
        return ResponseEntity.ok(orderService.completeOrder(orderId));
    }

    /**
     * POST /api/v1/orders/{orderId}/approve
     * Müşteri teslimi onaylar → COMPLETED + escrow serbest bırakılır.
     *
     * @param orderId onaylanacak siparişin UUID'si
     * @return 200 OK + güncellenmiş OrderResponse
     */
    @PostMapping("/{orderId}/approve")
    public ResponseEntity<OrderResponse> approveDelivery(@PathVariable UUID orderId) {
        return ResponseEntity.ok(orderService.approveDelivery(orderId));
    }

    /**
     * POST /api/v1/orders/{orderId}/reviews
     * Tamamlanmış sipariş için değerlendirme oluşturur.
     * Sipariş COMPLETED olmalı ve daha önce değerlendirme yapılmamış olmalı.
     *
     * @param orderId değerlendirilecek siparişin UUID'si
     * @param request puan ve yorum
     * @return 201 Created + oluşturulan ReviewResponse
     */
    @PostMapping("/{orderId}/reviews")
    public ResponseEntity<ReviewResponse> addReview(
            @PathVariable UUID orderId,
            @RequestBody CreateReviewRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(orderService.addReview(orderId, request));
    }
}
