package com.myresources.service;

import com.myresources.entity.Resource;
import com.myresources.entity.User;
import com.myresources.enums.Role;
import com.myresources.exception.ResourceNotFoundException;
import com.myresources.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class AdminService {

    private final UserRepository userRepository;
    private final ResourceRepository resourceRepository;
    private final BorrowRequestRepository borrowRequestRepository;
    private final PurchaseOrderRepository purchaseOrderRepository;
    private final ComplaintRepository complaintRepository;
    private final TransactionRepository transactionRepository;
    private final NotificationService notificationService;

    public Page<User> listUsers(Role role, Pageable pageable) {
        return role != null ? userRepository.findByRole(role, pageable) : userRepository.findAll(pageable);
    }

    @Transactional
    public User setBlocked(Long userId, boolean blocked) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setBlocked(blocked);
        user = userRepository.save(user);

        notificationService.sendEmail(user, blocked ? "Your account has been blocked" : "Your account has been unblocked",
                "Hi " + user.getName() + ", your My Resources account was just "
                        + (blocked ? "blocked. Contact support if you believe this is a mistake."
                                   : "unblocked. You can log in again now."));
        return user;
    }

    @Transactional
    public User verifyUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        user.setIdentityVerified(true);
        user = userRepository.save(user);

        notificationService.sendEmail(user, "You're verified!",
                "Hi " + user.getName() + ", your identity has been verified by our team. Verified badges now show on your profile.");
        return user;
    }

    @Transactional
    public Resource verifyResource(Long resourceId) {
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));
        resource.setVerified(true);
        resource = resourceRepository.save(resource);

        notificationService.sendEmail(resource.getOwner(), "Your resource is verified",
                "Hi " + resource.getOwner().getName() + ", \"" + resource.getName()
                        + "\" has been verified by our team and now shows a verified badge.");
        return resource;
    }

    @Transactional
    public void removeResource(Long resourceId) {
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));
        resource.setStatus(com.myresources.enums.ResourceStatus.REMOVED);
        resourceRepository.save(resource);

        notificationService.sendEmail(resource.getOwner(), "Your resource was removed",
                "Hi " + resource.getOwner().getName() + ", \"" + resource.getName()
                        + "\" was removed by our admin team. Contact support if you have questions.");
    }

    public Map<String, Object> dashboardStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        stats.put("totalOwners", userRepository.findByRole(Role.OWNER, Pageable.unpaged()).getTotalElements());
        stats.put("totalBorrowers", userRepository.findByRole(Role.BORROWER, Pageable.unpaged()).getTotalElements());
        stats.put("totalResources", resourceRepository.count());
        stats.put("totalBorrowRequests", borrowRequestRepository.count());
        stats.put("totalPurchaseOrders", purchaseOrderRepository.count());
        stats.put("openComplaints", complaintRepository.findByStatus(
                com.myresources.enums.ComplaintStatus.OPEN, Pageable.unpaged()).getTotalElements());
        stats.put("totalTransactions", transactionRepository.count());
        return stats;
    }
}
