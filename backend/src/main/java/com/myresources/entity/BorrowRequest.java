package com.myresources.entity;

import com.myresources.enums.BorrowRequestStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "borrow_requests")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BorrowRequest {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resource_id", nullable = false)
    private Resource resource;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "borrower_id", nullable = false)
    private User borrower;

    @Column(nullable = false)
    private LocalDate startDate;

    @Column(nullable = false)
    private LocalDate expectedReturnDate;

    private LocalDate actualReturnDate;

    @Builder.Default
    private Integer quantity = 1;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false)
    private BorrowRequestStatus status = BorrowRequestStatus.PENDING;

    private String otpCode;

    private LocalDateTime otpExpiresAt;

    private String pickupQrCode;

    private BigDecimal totalBorrowFee;

    private BigDecimal securityDeposit;

    private BigDecimal lateFeeCharged;

    private String rejectionReason;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    @PrePersist
    void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
