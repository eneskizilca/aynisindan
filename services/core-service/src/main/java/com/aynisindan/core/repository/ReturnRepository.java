package com.aynisindan.core.repository;

import com.aynisindan.core.model.entity.Return;
import com.aynisindan.core.model.enums.ReturnStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface ReturnRepository extends JpaRepository<Return, UUID> {

    List<Return> findByArtisanIdAndStatus(UUID artisanId, ReturnStatus status);

    List<Return> findByArtisanId(UUID artisanId);

    Optional<Return> findByOrderId(UUID orderId);

    boolean existsByOrderIdAndStatusIn(UUID orderId, List<ReturnStatus> statuses);
}
