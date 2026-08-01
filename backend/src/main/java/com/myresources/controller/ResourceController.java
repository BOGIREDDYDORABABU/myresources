package com.myresources.controller;

import com.myresources.dto.ApiResponse;
import com.myresources.dto.ResourceRequest;
import com.myresources.dto.ResourceResponse;
import com.myresources.enums.ResourceCategory;
import com.myresources.enums.ResourceType;
import com.myresources.security.UserPrincipal;
import com.myresources.service.ResourceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequiredArgsConstructor
public class ResourceController {

    private final ResourceService resourceService;

    @PostMapping("/api/owner/resources")
    public ApiResponse<ResourceResponse> create(@Valid @RequestBody ResourceRequest req,
                                                 @AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok("Resource created", resourceService.create(req, principal));
    }

    @PutMapping("/api/owner/resources/{id}")
    public ApiResponse<ResourceResponse> update(@PathVariable Long id, @Valid @RequestBody ResourceRequest req,
                                                 @AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok("Resource updated", resourceService.update(id, req, principal));
    }

    @DeleteMapping("/api/owner/resources/{id}")
    public ApiResponse<Void> delete(@PathVariable Long id, @AuthenticationPrincipal UserPrincipal principal) {
        resourceService.delete(id, principal);
        return ApiResponse.ok("Resource removed", null);
    }

    @GetMapping("/api/owner/resources")
    public ApiResponse<Page<ResourceResponse>> myResources(@AuthenticationPrincipal UserPrincipal principal,
                                                             @RequestParam(defaultValue = "0") int page,
                                                             @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.ok(resourceService.myResources(principal, PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }

    @GetMapping("/api/resources/{id}")
    public ApiResponse<ResourceResponse> get(@PathVariable Long id) {
        return ApiResponse.ok(resourceService.get(id));
    }

    @GetMapping("/api/resources")
    public ApiResponse<Page<ResourceResponse>> search(
            @RequestParam(required = false) String q,
            @RequestParam(required = false) ResourceCategory category,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) ResourceType resourceType,
            @RequestParam(required = false) Boolean borrow,
            @RequestParam(required = false) Boolean sell,
            @RequestParam(required = false) Boolean verifiedOnly,
            @RequestParam(required = false) Boolean discountOnly,
            @RequestParam(required = false) BigDecimal maxPrice,
            @RequestParam(defaultValue = "newest") String sort,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "12") int size) {

        Sort sortSpec = switch (sort) {
            case "priceLowHigh" -> Sort.by("sellingPrice").ascending();
            case "priceHighLow" -> Sort.by("sellingPrice").descending();
            case "popular", "highestRated" -> Sort.by("averageRating").descending();
            default -> Sort.by("createdAt").descending();
        };
        Pageable pageable = PageRequest.of(page, size, sortSpec);
        return ApiResponse.ok(resourceService.search(q, category, location, resourceType, borrow, sell,
                verifiedOnly, discountOnly, maxPrice, sort, pageable));
    }
}
