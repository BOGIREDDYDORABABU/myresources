package com.myresources.controller;

import com.myresources.dto.ApiResponse;
import com.myresources.dto.ChangePasswordRequest;
import com.myresources.dto.UpdateProfileRequest;
import com.myresources.dto.UserResponse;
import com.myresources.security.UserPrincipal;
import com.myresources.service.AuthService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users/me")
@RequiredArgsConstructor
public class UserController {

    private final AuthService authService;

    @PutMapping
    public ApiResponse<UserResponse> updateProfile(@RequestBody UpdateProfileRequest req,
                                                     @AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok("Profile updated", authService.updateProfile(req, principal));
    }

    @PostMapping("/password")
    public ApiResponse<Void> changePassword(@Valid @RequestBody ChangePasswordRequest req,
                                             @AuthenticationPrincipal UserPrincipal principal) {
        authService.changePassword(req, principal);
        return ApiResponse.ok("Password changed successfully", null);
    }

    @PostMapping("/resend-verification")
    public ApiResponse<Void> resendVerification(@AuthenticationPrincipal UserPrincipal principal) {
        authService.resendVerificationEmail(principal);
        return ApiResponse.ok("Verification email sent", null);
    }
}
