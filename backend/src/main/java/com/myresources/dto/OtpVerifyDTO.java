package com.myresources.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class OtpVerifyDTO {
    @NotBlank
    private String otpCode;
}
