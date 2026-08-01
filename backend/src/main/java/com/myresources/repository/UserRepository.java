package com.myresources.repository;

import com.myresources.entity.User;
import com.myresources.enums.Role;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPhone(String phone);
    Optional<User> findByEmailOrPhone(String email, String phone);
    Optional<User> findByEmailVerificationToken(String token);
    boolean existsByEmail(String email);
    boolean existsByPhone(String phone);
    Page<User> findByRole(Role role, Pageable pageable);
    Page<User> findByNameContainingIgnoreCaseOrEmailContainingIgnoreCase(String name, String email, Pageable pageable);
}
