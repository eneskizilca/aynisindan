package com.aynisindan.core.service;

import com.aynisindan.core.dto.request.CreateOrderRequest;
import com.aynisindan.core.dto.request.CreateReviewRequest;
import com.aynisindan.core.dto.response.OrderResponse;
import com.aynisindan.core.dto.response.ReviewResponse;

import java.util.List;
import java.util.UUID;

public interface OrderService {

    /**
     * JWT'deki kullanıcının rolüne göre siparişleri listeler.
     * CUSTOMER ise kendi siparişlerini, ARTISAN ise atanmış siparişleri döner.
     */
    List<OrderResponse> getMyOrders();

    /**
     * Yeni bir sipariş oluşturur ve OrderResponse döner.
     */
    OrderResponse createOrder(CreateOrderRequest request);

    /**
     * Siparişi ID'sine göre getirir.
     */
    OrderResponse getOrderById(UUID orderId);

    /**
     * Verilen müşteri ID'sine göre tüm siparişleri listeler.
     */
    List<OrderResponse> getCustomerOrders(UUID customerId);

    /**
     * Zanaatkarın siparişi teslim ettiğini kaydeder (IN_PROGRESS → DELIVERED).
     * Yalnızca atanmış zanaatkar çağırabilir.
     */
    OrderResponse completeOrder(UUID orderId);

    /**
     * Müşterinin teslimi onaylamasını kaydeder (DELIVERED → COMPLETED).
     * Havuzdaki ödeme zanaatkara serbest bırakılır.
     *
     * @param orderId onaylanacak siparişin UUID'si
     * @return güncellenmiş siparişin DTO karşılığı
     */
    OrderResponse approveDelivery(UUID orderId);

    /**
     * Tamamlanmış (COMPLETED) bir sipariş için değerlendirme oluşturur.
     * Daha önce değerlendirme yapılmamış olmalı.
     *
     * @param orderId  değerlendirilecek siparişin UUID'si (path'ten gelir)
     * @param request  puan ve yorum içerir
     * @return oluşturulan değerlendirmenin DTO karşılığı
     */
    ReviewResponse addReview(UUID orderId, CreateReviewRequest request);
}
