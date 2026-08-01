package com.myresources.controller;

import com.myresources.dto.ApiResponse;
import com.myresources.dto.PurchaseRequestDTO;
import com.myresources.entity.PurchaseOrder;
import com.myresources.security.UserPrincipal;
import com.myresources.service.PurchaseService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/purchase")
@RequiredArgsConstructor
public class PurchaseController {

    private final PurchaseService purchaseService;

    @PostMapping("/orders")
    public ApiResponse<PurchaseOrder> buy(@Valid @RequestBody PurchaseRequestDTO dto,
                                           @AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok("Order created. Proceed to payment.", purchaseService.buy(dto, principal));
    }

    @PostMapping("/orders/{id}/pay")
    public ApiResponse<PurchaseOrder> pay(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok("Payment successful", purchaseService.confirmPayment(id, principal));
    }

    @PostMapping("/orders/{id}/approve")
    public ApiResponse<PurchaseOrder> approve(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok("Order approved", purchaseService.approve(id, principal));
    }

    @PostMapping("/orders/{id}/complete")
    public ApiResponse<PurchaseOrder> complete(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok("Order marked complete", purchaseService.markDelivered(id, principal));
    }

    @GetMapping("/orders/mine")
    public ApiResponse<Page<PurchaseOrder>> mine(@AuthenticationPrincipal UserPrincipal principal,
                                                  @RequestParam(defaultValue = "0") int page,
                                                  @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.ok(purchaseService.myOrders(principal, PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @GetMapping("/orders/incoming")
    public ApiResponse<Page<PurchaseOrder>> incoming(@AuthenticationPrincipal UserPrincipal principal,
                                                       @RequestParam(defaultValue = "0") int page,
                                                       @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.ok(purchaseService.incomingOrders(principal, PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }
}
