package com.myresources.controller;

import com.myresources.dto.ApiResponse;
import com.myresources.dto.ComplaintRequestDTO;
import com.myresources.entity.Complaint;
import com.myresources.security.UserPrincipal;
import com.myresources.service.ComplaintService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/complaints")
@RequiredArgsConstructor
public class ComplaintController {

    private final ComplaintService complaintService;

    @PostMapping
    public ApiResponse<Complaint> raise(@Valid @RequestBody ComplaintRequestDTO dto,
                                         @AuthenticationPrincipal UserPrincipal principal) {
        return ApiResponse.ok("Complaint submitted", complaintService.raise(dto, principal));
    }

    @GetMapping("/mine")
    public ApiResponse<Page<Complaint>> mine(@AuthenticationPrincipal UserPrincipal principal,
                                              @RequestParam(defaultValue = "0") int page,
                                              @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.ok(complaintService.myComplaints(principal, PageRequest.of(page, size, Sort.by("createdAt").descending())));
    }
}
