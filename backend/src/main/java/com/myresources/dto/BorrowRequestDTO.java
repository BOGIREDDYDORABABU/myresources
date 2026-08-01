package com.myresources.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDate;

@Data
public class BorrowRequestDTO {
    @NotNull
    private Long resourceId;

    @NotNull
    private LocalDate startDate;

    @NotNull
    private LocalDate expectedReturnDate;

    private Integer quantity = 1;
}
