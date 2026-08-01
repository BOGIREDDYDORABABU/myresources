package com.myresources.controller;

import com.myresources.dto.ApiResponse;
import com.myresources.entity.Wishlist;
import com.myresources.security.UserPrincipal;
import com.myresources.service.WishlistService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/wishlist")
@RequiredArgsConstructor
public class WishlistController {

    private final WishlistService wishlistService;

    @PostMapping("/{resourceId}")
    public ApiResponse<Wishlist> add(@PathVariable Long resourceId, @AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok("Added to wishlist", wishlistService.add(resourceId, principal));
    }

    @DeleteMapping("/{resourceId}")
    public ApiResponse<Void> remove(@PathVariable Long resourceId, @AuthenticationPrincipal UserPrincipal principal) {
        wishlistService.remove(resourceId, principal);
        return ApiResponse.ok("Removed from wishlist", null);
    }

    @GetMapping
    public ApiResponse<Page<Wishlist>> mine(@AuthenticationPrincipal UserPrincipal principal,
                                             @RequestParam(defaultValue = "0") int page,
                                             @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(wishlistService.myWishlist(principal, PageRequest.of(page, size)));
    }
}
