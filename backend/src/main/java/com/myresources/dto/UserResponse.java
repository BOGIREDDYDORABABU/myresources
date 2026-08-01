package com.myresources.dto;

import com.myresources.entity.User;
import com.myresources.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private String phone;
    private String location;
    private Role role;
    private boolean identityVerified;
    private boolean emailVerified;
    private boolean blocked;

    public static UserResponse from(User u) {
        return UserResponse.builder()
                .id(u.getId())
                .name(u.getName())
                .email(u.getEmail())
                .phone(u.getPhone())
                .location(u.getLocation())
                .role(u.getRole())
                .identityVerified(u.isIdentityVerified())
                .emailVerified(u.isEmailVerified())
                .blocked(u.isBlocked())
                .build();
    }
}
