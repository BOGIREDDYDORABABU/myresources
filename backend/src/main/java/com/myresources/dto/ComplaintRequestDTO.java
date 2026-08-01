package com.myresources.dto;

import com.myresources.enums.ComplaintType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ComplaintRequestDTO {
    @NotNull
    private ComplaintType type;

    @NotBlank
    private String description;

    private Long resourceId;
    private Long borrowRequestId;
    private Long purchaseOrderId;
}
