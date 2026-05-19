package com.aynisindan.core.repository;

import com.aynisindan.core.model.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface OrderRepository extends JpaRepository<Order, UUID> {

    /**
     * Belirli bir müşteriye ait tüm siparişleri getirir.
     *
     * @param customerId müşterinin UUID'si
     * @return müşteriye ait sipariş listesi
     */
    List<Order> findByCustomer_Id(UUID customerId);

    /**
     * Belirli bir zanaatkâra atanmış tüm siparişleri getirir.
     */
    List<Order> findByArtisan_Id(UUID artisanId);

    /**
     * Belirli bir durumdaki tüm siparişleri getirir.
     */
    List<Order> findByStatus(com.aynisindan.core.model.enums.OrderStatus status);
}
