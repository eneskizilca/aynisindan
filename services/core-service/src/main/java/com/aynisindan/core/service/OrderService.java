package com.aynisindan.core.service;

import com.aynisindan.core.dto.request.CreateOrderRequest;
import com.aynisindan.core.dto.response.OrderResponse;

import java.util.List;
import java.util.UUID;

public interface OrderService {

    /**
     * Yeni bir sipariş oluşturur ve OrderResponse döner.
     *
     * @param request sipariş oluşturma isteği
     * @return oluşturulan siparişin DTO karşılığı
     */
    OrderResponse createOrder(CreateOrderRequest request);

    /**
     * Verilen müşteri ID'sine göre tüm siparişleri listeler.
     *
     * @param customerId müşterinin UUID'si
     * @return müşteriye ait sipariş DTO listesi
     */
    List<OrderResponse> getCustomerOrders(UUID customerId);
}
