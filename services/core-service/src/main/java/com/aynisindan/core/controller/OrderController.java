package com.aynisindan.core.controller;

import com.aynisindan.core.dto.request.CreateOrderRequest;
import com.aynisindan.core.dto.response.OrderResponse;
import com.aynisindan.core.service.OrderService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/orders")
@RequiredArgsConstructor
public class OrderController {

    private final OrderService orderService;

    /**
     * POST /api/v1/orders
     * Yeni bir sipariş oluşturur.
     *
     * @param request body'den gelen CreateOrderRequest
     * @return 201 Created + oluşturulan OrderResponse
     */
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@RequestBody CreateOrderRequest request) {
        OrderResponse response = orderService.createOrder(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * GET /api/v1/orders/customer/{customerId}
     * Verilen müşteriye ait tüm siparişleri listeler.
     *
     * @param customerId path'ten gelen müşteri UUID'si
     * @return 200 OK + sipariş listesi
     */
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<List<OrderResponse>> getCustomerOrders(@PathVariable UUID customerId) {
        List<OrderResponse> orders = orderService.getCustomerOrders(customerId);
        return ResponseEntity.ok(orders);
    }
}
