package com.aynisindan.core.repository;

import com.aynisindan.core.model.entity.Quote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface QuoteRepository extends JpaRepository<Quote, UUID> {

    /**
     * Belirli bir siparişe ait tüm teklifleri getirir.
     *
     * @param orderId siparişin UUID'si
     * @return siparişe ait teklif listesi
     */
    List<Quote> findByOrder_Id(UUID orderId);
}
