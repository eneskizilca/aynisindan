package com.aynisindan.core.service;

import com.aynisindan.core.dto.request.CreateReturnRequest;
import com.aynisindan.core.dto.response.ReturnResponse;

import java.util.List;
import java.util.UUID;

public interface ReturnService {

    ReturnResponse createReturn(UUID orderId, CreateReturnRequest request);

    ReturnResponse approveReturn(UUID returnId);

    ReturnResponse rejectReturn(UUID returnId);

    List<ReturnResponse> getPendingReturnsForArtisan();

    List<ReturnResponse> getAllReturnsForArtisan();

    ReturnResponse getReturnByOrderId(UUID orderId);
}
