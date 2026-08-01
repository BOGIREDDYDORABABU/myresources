package com.myresources.entity;

import com.myresources.enums.ResourceCategory;
import com.myresources.enums.ResourceStatus;
import com.myresources.enums.ResourceType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "resources")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private User owner;

    @Column(nullable = false)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResourceCategory category;

    @Column(length = 2000)
    private String description;

    @Builder.Default
    @OneToMany(mappedBy = "resource", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ResourceImage> images = new ArrayList<>();

    @Builder.Default
    @Column(nullable = false)
    private Integer quantityAvailable = 0;

    @Builder.Default
    @Column(nullable = false)
    private Integer quantityTotal = 0;

    @Column(name = "item_condition")
    private String condition;

    private String location;

    @Enumerated(EnumType.STRING)
    @Builder.Default
    @Column(nullable = false)
    private ResourceStatus status = ResourceStatus.AVAILABLE;

    private BigDecimal borrowPricePerDay;

    private BigDecimal sellingPrice;

    @Builder.Default
    private BigDecimal discountPercent = BigDecimal.ZERO;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResourceType resourceType;

    @Column(length = 1000)
    private String usageRules;

    private Integer maxBorrowDurationDays;

    private BigDecimal securityDeposit;

    private BigDecimal lateFeePerDay;

    @Builder.Default
    private boolean verified = false;

    @Builder.Default
    private Double averageRating = 0.0;

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
