package com.myresources.dto;

import com.myresources.enums.ResourceCategory;
import com.myresources.enums.ResourceType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.util.List;

@Data
public class ResourceRequest {

    @NotBlank
    private String name;

    @NotNull
    private ResourceCategory category;

    private String description;

    private List<String> imageUrls;

    @NotNull
    private Integer quantityAvailable;

    private String condition;

    private String location;

    private BigDecimal borrowPricePerDay;

    private BigDecimal sellingPrice;

    private BigDecimal discountPercent;

    @NotNull
    private ResourceType resourceType;

    private String usageRules;

    private Integer maxBorrowDurationDays;

    private BigDecimal securityDeposit;

    private BigDecimal lateFeePerDay;
}
