package com.myresources.dto;

import com.myresources.entity.Resource;
import com.myresources.enums.ResourceCategory;
import com.myresources.enums.ResourceStatus;
import com.myresources.enums.ResourceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ResourceResponse {
    private Long id;
    private Long ownerId;
    private String ownerName;
    private String name;
    private ResourceCategory category;
    private String description;
    private List<String> imageUrls;
    private Integer quantityAvailable;
    private Integer quantityTotal;
    private String condition;
    private String location;
    private ResourceStatus status;
    private BigDecimal borrowPricePerDay;
    private BigDecimal sellingPrice;
    private BigDecimal discountPercent;
    private ResourceType resourceType;
    private String usageRules;
    private Integer maxBorrowDurationDays;
    private BigDecimal securityDeposit;
    private BigDecimal lateFeePerDay;
    private boolean verified;
    private Double averageRating;
    private LocalDateTime createdAt;

    public static ResourceResponse from(Resource r) {
        return ResourceResponse.builder()
                .id(r.getId())
                .ownerId(r.getOwner().getId())
                .ownerName(r.getOwner().getName())
                .name(r.getName())
                .category(r.getCategory())
                .description(r.getDescription())
                .imageUrls(r.getImages().stream().map(i -> i.getUrl()).collect(Collectors.toList()))
                .quantityAvailable(r.getQuantityAvailable())
                .quantityTotal(r.getQuantityTotal())
                .condition(r.getCondition())
                .location(r.getLocation())
                .status(r.getStatus())
                .borrowPricePerDay(r.getBorrowPricePerDay())
                .sellingPrice(r.getSellingPrice())
                .discountPercent(r.getDiscountPercent())
                .resourceType(r.getResourceType())
                .usageRules(r.getUsageRules())
                .maxBorrowDurationDays(r.getMaxBorrowDurationDays())
                .securityDeposit(r.getSecurityDeposit())
                .lateFeePerDay(r.getLateFeePerDay())
                .verified(r.isVerified())
                .averageRating(r.getAverageRating())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
