package com.aynisindan.core.controller;

import com.aynisindan.core.dto.request.CreateReturnRequest;
import com.aynisindan.core.dto.response.ReturnResponse;
import com.aynisindan.core.service.ReturnService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/returns")
@RequiredArgsConstructor
public class ReturnController {

    private final ReturnService returnService;

    @PostMapping
    public ResponseEntity<ReturnResponse> createReturn(
            @RequestParam UUID orderId,
            @RequestBody CreateReturnRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(returnService.createReturn(orderId, request));
    }

    @PostMapping("/{returnId}/approve")
    public ResponseEntity<ReturnResponse> approveReturn(@PathVariable UUID returnId) {
        return ResponseEntity.ok(returnService.approveReturn(returnId));
    }

    @PostMapping("/{returnId}/reject")
    public ResponseEntity<ReturnResponse> rejectReturn(@PathVariable UUID returnId) {
        return ResponseEntity.ok(returnService.rejectReturn(returnId));
    }

    @GetMapping("/my")
    public ResponseEntity<List<ReturnResponse>> getMyPendingReturns() {
        return ResponseEntity.ok(returnService.getPendingReturnsForArtisan());
    }

    @GetMapping("/my/all")
    public ResponseEntity<List<ReturnResponse>> getAllMyReturns() {
        return ResponseEntity.ok(returnService.getAllReturnsForArtisan());
    }

    @GetMapping("/order/{orderId}")
    public ResponseEntity<ReturnResponse> getReturnByOrder(@PathVariable UUID orderId) {
        return ResponseEntity.ok(returnService.getReturnByOrderId(orderId));
    }
}
