package com.myresources.dto;

import com.myresources.enums.Role;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class RegisterRequest {

    @NotBlank(message = "Name is required")
    private String name;

    private String email;

    private String phone;

    @NotBlank(message = "Password is required")
    private String password;

    private String location;

    @NotNull(message = "Role is required")
    private Role role;
}
