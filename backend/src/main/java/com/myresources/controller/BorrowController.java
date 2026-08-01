package com.myresources.controller;

import com.myresources.dto.ApiResponse;
import com.myresources.dto.BorrowRequestDTO;
import com.myresources.dto.OtpVerifyDTO;
import com.myresources.dto.RejectRequestDTO;
import com.myresources.entity.BorrowRequest;
import com.myresources.security.UserPrincipal;
import com.myresources.service.BorrowService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/borrow")
@RequiredArgsConstructor
public class BorrowController {

    private final BorrowService borrowService;

    @PostMapping("/requests")
    public ApiResponse<BorrowRequest> request(@Valid @RequestBody BorrowRequestDTO dto,
                                               @AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok("Borrow request sent", borrowService.requestBorrow(dto, principal));
    }

    @PostMapping("/requests/{id}/approve")
    public ApiResponse<BorrowRequest> approve(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok("Request approved. OTP sent to borrower.", borrowService.approve(id, principal));
    }

    @PostMapping("/requests/{id}/reject")
    public ApiResponse<BorrowRequest> reject(@PathVariable Long id, @RequestBody RejectRequestDTO dto,
                                              @AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok("Request rejected", borrowService.reject(id, dto.getReason(), principal));
    }

    @PostMapping("/requests/{id}/verify-otp")
    public ApiResponse<BorrowRequest> verifyOtp(@PathVariable Long id, @Valid @RequestBody OtpVerifyDTO dto,
                                                 @AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok("OTP verified. QR generated for pickup.", borrowService.verifyOtp(id, dto.getOtpCode(), principal));
    }

    @PostMapping("/requests/{id}/confirm-pickup")
    public ApiResponse<BorrowRequest> confirmPickup(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok("Pickup confirmed. Borrow is now active.", borrowService.confirmPickup(id, principal));
    }

    @PostMapping("/requests/{id}/request-return")
    public ApiResponse<BorrowRequest> requestReturn(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok("Return requested", borrowService.requestReturn(id, principal));
    }

    @PostMapping("/requests/{id}/confirm-return")
    public ApiResponse<BorrowRequest> confirmReturn(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok("Return confirmed. Transaction complete.", borrowService.confirmReturn(id, principal));
    }

    @GetMapping("/requests/mine")
    public ApiResponse<Page<BorrowRequest>> mine(@AuthenticationPrincipal UserPrincipal principal,
                                                  @RequestParam(defaultValue = "0") int page,
                                                  @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.ok(borrowService.myBorrowRequests(principal, PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @GetMapping("/requests/incoming")
    public ApiResponse<Page<BorrowRequest>> incoming(@AuthenticationPrincipal UserPrincipal principal,
                                                       @RequestParam(defaultValue = "0") int page,
                                                       @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.ok(borrowService.incomingRequests(principal, PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }
}
