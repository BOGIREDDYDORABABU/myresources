package com.myresources.service;

import com.myresources.dto.BorrowRequestDTO;
import com.myresources.entity.BorrowRequest;
import com.myresources.entity.Resource;
import com.myresources.entity.Transaction;
import com.myresources.enums.BorrowRequestStatus;
import com.myresources.enums.ResourceStatus;
import com.myresources.enums.TransactionStatus;
import com.myresources.enums.TransactionType;
import com.myresources.exception.BadRequestException;
import com.myresources.exception.ResourceNotFoundException;
import com.myresources.exception.UnauthorizedException;
import com.myresources.repository.BorrowRequestRepository;
import com.myresources.repository.ResourceRepository;
import com.myresources.repository.TransactionRepository;
import com.myresources.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

/**
 * Implements the PRD borrow workflow:
 * Search -> View -> Send Borrow Request -> Owner Approval -> OTP Verification
 * -> QR Generation -> Pickup -> Borrow Active -> Return -> Transaction Complete
 */
@Service
@RequiredArgsConstructor
public class BorrowService {

    private final BorrowRequestRepository borrowRequestRepository;
    private final ResourceRepository resourceRepository;
    private final TransactionRepository transactionRepository;
    private final NotificationService notificationService;

    private static final SecureRandom RANDOM = new SecureRandom();

    @Transactional
    public BorrowRequest requestBorrow(BorrowRequestDTO dto, UserPrincipal principal) {
        Resource resource = resourceRepository.findById(dto.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));

        if (resource.getOwner().getId().equals(principal.getId())) {
            throw new BadRequestException("You cannot borrow your own resource");
        }
        if (resource.getQuantityAvailable() < dto.getQuantity()) {
            throw new BadRequestException("Requested quantity is not available");
        }
        if (dto.getExpectedReturnDate().isBefore(dto.getStartDate())) {
            throw new BadRequestException("Return date must be after start date");
        }
        long days = ChronoUnit.DAYS.between(dto.getStartDate(), dto.getExpectedReturnDate());
        if (resource.getMaxBorrowDurationDays() != null && days > resource.getMaxBorrowDurationDays()) {
            throw new BadRequestException("Requested duration exceeds max borrow duration of "
                    + resource.getMaxBorrowDurationDays() + " days");
        }

        BigDecimal dailyRate = resource.getBorrowPricePerDay() != null ? resource.getBorrowPricePerDay() : BigDecimal.ZERO;
        BigDecimal fee = dailyRate.multiply(BigDecimal.valueOf(Math.max(days, 1))).multiply(BigDecimal.valueOf(dto.getQuantity()));

        BorrowRequest request = BorrowRequest.builder()
                .resource(resource)
                .borrower(principal.getUser())
                .startDate(dto.getStartDate())
                .expectedReturnDate(dto.getExpectedReturnDate())
                .quantity(dto.getQuantity())
                .status(BorrowRequestStatus.PENDING)
                .totalBorrowFee(fee)
                .securityDeposit(resource.getSecurityDeposit())
                .build();

        request = borrowRequestRepository.save(request);
        notificationService.notifyAll(resource.getOwner(), "New Borrow Request",
                principal.getUser().getName() + " requested to borrow \"" + resource.getName() + "\".");
        return request;
    }

    @Transactional
    public BorrowRequest approve(Long requestId, UserPrincipal ownerPrincipal) {
        BorrowRequest request = ownedRequest(requestId, ownerPrincipal);
        assertStatus(request, BorrowRequestStatus.PENDING);

        String otp = String.format("%06d", RANDOM.nextInt(1_000_000));
        request.setOtpCode(otp);
        request.setOtpExpiresAt(LocalDateTime.now().plusMinutes(30));
        request.setStatus(BorrowRequestStatus.APPROVED);
        request = borrowRequestRepository.save(request);

        notificationService.notifyAll(request.getBorrower(), "Borrow Request Approved",
                "Your request for \"" + request.getResource().getName() + "\" was approved. "
                        + "Your pickup OTP is " + otp + " (valid 30 minutes).");
        return request;
    }

    @Transactional
    public BorrowRequest reject(Long requestId, String reason, UserPrincipal ownerPrincipal) {
        BorrowRequest request = ownedRequest(requestId, ownerPrincipal);
        assertStatus(request, BorrowRequestStatus.PENDING);

        request.setStatus(BorrowRequestStatus.REJECTED);
        request.setRejectionReason(reason);
        request = borrowRequestRepository.save(request);

        notificationService.notifyAll(request.getBorrower(), "Borrow Request Rejected",
                "Your request for \"" + request.getResource().getName() + "\" was rejected. Reason: " + reason);
        return request;
    }

    @Transactional
    public BorrowRequest verifyOtp(Long requestId, String otp, UserPrincipal principal) {
        BorrowRequest request = borrowerRequest(requestId, principal);
        assertStatus(request, BorrowRequestStatus.APPROVED);

        if (request.getOtpExpiresAt().isBefore(LocalDateTime.now())) {
            throw new BadRequestException("OTP has expired");
        }
        if (!request.getOtpCode().equals(otp)) {
            throw new BadRequestException("Invalid OTP");
        }

        request.setStatus(BorrowRequestStatus.OTP_VERIFIED);
        request.setPickupQrCode("QR-" + UUID.randomUUID());
        return borrowRequestRepository.save(request);
    }

    @Transactional
    public BorrowRequest confirmPickup(Long requestId, UserPrincipal ownerPrincipal) {
        BorrowRequest request = ownedRequest(requestId, ownerPrincipal);
        assertStatus(request, BorrowRequestStatus.OTP_VERIFIED);

        Resource resource = request.getResource();
        resource.setQuantityAvailable(resource.getQuantityAvailable() - request.getQuantity());
        if (resource.getQuantityAvailable() <= 0) resource.setStatus(ResourceStatus.OUT_OF_STOCK);
        resourceRepository.save(resource);

        request.setStatus(BorrowRequestStatus.ACTIVE);
        request = borrowRequestRepository.save(request);

        recordTransaction(request);
        notificationService.notifyAll(request.getBorrower(), "Pickup Confirmed",
                "Pickup for \"" + resource.getName() + "\" confirmed. Enjoy!");
        return request;
    }

    @Transactional
    public BorrowRequest requestReturn(Long requestId, UserPrincipal principal) {
        BorrowRequest request = borrowerRequest(requestId, principal);
        assertStatus(request, BorrowRequestStatus.ACTIVE);
        request.setStatus(BorrowRequestStatus.RETURN_REQUESTED);
        request = borrowRequestRepository.save(request);

        notificationService.notifyAll(request.getResource().getOwner(), "Return Requested",
                request.getBorrower().getName() + " wants to return \"" + request.getResource().getName()
                        + "\". Please confirm the return once you've received it back.");
        return request;
    }

    @Transactional
    public BorrowRequest confirmReturn(Long requestId, UserPrincipal ownerPrincipal) {
        BorrowRequest request = ownedRequest(requestId, ownerPrincipal);
        if (request.getStatus() != BorrowRequestStatus.RETURN_REQUESTED
                && request.getStatus() != BorrowRequestStatus.ACTIVE) {
            throw new BadRequestException("Resource is not currently borrowed");
        }

        Resource resource = request.getResource();
        resource.setQuantityAvailable(resource.getQuantityAvailable() + request.getQuantity());
        resource.setStatus(ResourceStatus.AVAILABLE);
        resourceRepository.save(resource);

        java.time.LocalDate today = java.time.LocalDate.now();
        request.setActualReturnDate(today);
        if (today.isAfter(request.getExpectedReturnDate()) && resource.getLateFeePerDay() != null) {
            long lateDays = ChronoUnit.DAYS.between(request.getExpectedReturnDate(), today);
            request.setLateFeeCharged(resource.getLateFeePerDay().multiply(BigDecimal.valueOf(lateDays)));
        }
        request.setStatus(BorrowRequestStatus.COMPLETED);
        request = borrowRequestRepository.save(request);

        notificationService.notifyAll(request.getBorrower(), "Return Complete",
                "Thanks for returning \"" + resource.getName() + "\" on time!");
        return request;
    }

    public Page<BorrowRequest> myBorrowRequests(UserPrincipal principal, Pageable pageable) {
        return borrowRequestRepository.findByBorrowerId(principal.getId(), pageable);
    }

    public Page<BorrowRequest> incomingRequests(UserPrincipal ownerPrincipal, Pageable pageable) {
        return borrowRequestRepository.findByResourceOwnerId(ownerPrincipal.getId(), pageable);
    }

    private void recordTransaction(BorrowRequest request) {
        Transaction tx = Transaction.builder()
                .transactionRef("TXN-" + UUID.randomUUID())
                .user(request.getBorrower())
                .borrowRequestId(request.getId())
                .type(TransactionType.BORROW)
                .status(TransactionStatus.SUCCESS)
                .amount(request.getTotalBorrowFee() != null ? request.getTotalBorrowFee() : BigDecimal.ZERO)
                .build();
        transactionRepository.save(tx);
    }

    private BorrowRequest ownedRequest(Long id, UserPrincipal ownerPrincipal) {
        BorrowRequest request = borrowRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Borrow request not found"));
        if (!request.getResource().getOwner().getId().equals(ownerPrincipal.getId())) {
            throw new UnauthorizedException("You do not own this resource");
        }
        return request;
    }

    private BorrowRequest borrowerRequest(Long id, UserPrincipal principal) {
        BorrowRequest request = borrowRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Borrow request not found"));
        if (!request.getBorrower().getId().equals(principal.getId())) {
            throw new UnauthorizedException("This is not your borrow request");
        }
        return request;
    }

    private void assertStatus(BorrowRequest request, BorrowRequestStatus expected) {
        if (request.getStatus() != expected) {
            throw new BadRequestException("Request is not in " + expected + " state (current: " + request.getStatus() + ")");
        }
    }
}
