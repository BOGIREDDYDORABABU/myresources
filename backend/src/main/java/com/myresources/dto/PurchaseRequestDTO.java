package com.myresources.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PurchaseRequestDTO {
    @NotNull
    private Long resourceId;

    private Integer quantity = 1;

    private String deliveryAddress;
}
