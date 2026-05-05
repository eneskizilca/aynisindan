package com.aynisindan.core.model.enums;

public enum OrderStatus {
    PENDING,
    QUOTED,
    IN_PROGRESS,
    DELIVERED,    // Zanaatkar teslim etti, müşteri onayı bekleniyor
    COMPLETED,    // Müşteri onayladı, ödeme serbest bırakıldı
    CANCELLED
}
