package com.myresources.controller;

import com.myresources.dto.ApiResponse;
import com.myresources.entity.Complaint;
import com.myresources.entity.Resource;
import com.myresources.entity.User;
import com.myresources.enums.ComplaintStatus;
import com.myresources.enums.Role;
import com.myresources.service.AdminService;
import com.myresources.service.ComplaintService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final AdminService adminService;
    private final ComplaintService complaintService;

    @GetMapping("/dashboard")
    public ApiResponse<Map<String, Object>> dashboard() {
        return ApiResponse.ok(adminService.dashboardStats());
    }

    @GetMapping("/users")
    public ApiResponse<Page<User>> users(@RequestParam(required = false) Role role,
                                          @RequestParam(defaultValue = "0") int page,
                                          @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(adminService.listUsers(role, PageRequest.of(page, size)));
    }

    @PostMapping("/users/{id}/block")
    public ApiResponse<User> block(@PathVariable Long id) {
        return ApiResponse.ok("User blocked", adminService.setBlocked(id, true));
    }

    @PostMapping("/users/{id}/unblock")
    public ApiResponse<User> unblock(@PathVariable Long id) {
        return ApiResponse.ok("User unblocked", adminService.setBlocked(id, false));
    }

    @PostMapping("/users/{id}/verify")
    public ApiResponse<User> verifyUser(@PathVariable Long id) {
        return ApiResponse.ok("User verified", adminService.verifyUser(id));
    }

    @PostMapping("/resources/{id}/verify")
    public ApiResponse<Resource> verifyResource(@PathVariable Long id) {
        return ApiResponse.ok("Resource verified", adminService.verifyResource(id));
    }

    @DeleteMapping("/resources/{id}")
    public ApiResponse<Void> removeResource(@PathVariable Long id) {
        adminService.removeResource(id);
        return ApiResponse.ok("Resource removed", null);
    }

    @GetMapping("/complaints")
    public ApiResponse<Page<Complaint>> complaints(@RequestParam(required = false) ComplaintStatus status,
                                                     @RequestParam(defaultValue = "0") int page,
                                                     @RequestParam(defaultValue = "20") int size) {
        return ApiResponse.ok(complaintService.all(status, PageRequest.of(page, size)));
    }

    @PatchMapping("/complaints/{id}")
    public ApiResponse<Complaint> updateComplaint(@PathVariable Long id, @RequestParam ComplaintStatus status,
                                                    @RequestParam(required = false) String notes) {
        return ApiResponse.ok("Complaint updated", complaintService.updateStatus(id, status, notes));
    }
}
