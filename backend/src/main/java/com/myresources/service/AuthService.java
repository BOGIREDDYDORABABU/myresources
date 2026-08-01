package com.myresources.service;

import com.myresources.dto.*;
import com.myresources.entity.User;
import com.myresources.enums.Role;
import com.myresources.exception.BadRequestException;
import com.myresources.exception.UnauthorizedException;
import com.myresources.repository.UserRepository;
import com.myresources.security.JwtUtil;
import com.myresources.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final NotificationService notificationService;

    @Value("${app.frontend-url:http://localhost:5173}")
    private String frontendUrl;

    @Transactional
    public AuthResponse register(RegisterRequest req) {
        if ((req.getEmail() == null || req.getEmail().isBlank())
                && (req.getPhone() == null || req.getPhone().isBlank())) {
            throw new BadRequestException("Either email or phone number is required");
        }
        if (req.getEmail() != null && !req.getEmail().isBlank() && userRepository.existsByEmail(req.getEmail())) {
            throw new BadRequestException("Email already registered");
        }
        if (req.getPhone() != null && !req.getPhone().isBlank() && userRepository.existsByPhone(req.getPhone())) {
            throw new BadRequestException("Phone number already registered");
        }
        if (req.getRole() == Role.ADMIN) {
            throw new BadRequestException("Admin accounts cannot self-register");
        }

        User user = User.builder()
                .name(req.getName())
                .email(blankToNull(req.getEmail()))
                .phone(blankToNull(req.getPhone()))
                .password(passwordEncoder.encode(req.getPassword()))
                .location(req.getLocation())
                .role(req.getRole())
                .build();

        if (user.getEmail() != null) {
            user.setEmailVerificationToken(java.util.UUID.randomUUID().toString());
        }

        user = userRepository.save(user);
        notificationService.notifyAll(user, "Welcome to My Resources",
                "Hi " + user.getName() + ", your account has been created successfully.");

        if (user.getEmail() != null) {
            sendVerificationEmail(user);
        }

        String token = jwtUtil.generateToken(user.getId(), subjectOf(user), user.getRole().name());
        return AuthResponse.builder().token(token).tokenType("Bearer").user(UserResponse.from(user)).build();
    }

    @Transactional
    public AuthResponse login(LoginRequest req) {
        User user = userRepository.findByEmailOrPhone(req.getIdentifier(), req.getIdentifier())
                .orElseThrow(() -> new UnauthorizedException("Invalid credentials"));

        if (user.isBlocked()) {
            throw new UnauthorizedException("Your account has been blocked. Contact support.");
        }

        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(subjectOf(user), req.getPassword()));

        user.setLastLoginAt(LocalDateTime.now());
        userRepository.save(user);

        notificationService.sendEmail(user, "New login to My Resources",
                "Hi " + user.getName() + ", we noticed a new login to your account on "
                        + LocalDateTime.now() + ". If this wasn't you, please secure your account.");

        String token = jwtUtil.generateToken(user.getId(), subjectOf(user), user.getRole().name());
        return AuthResponse.builder().token(token).tokenType("Bearer").user(UserResponse.from(user)).build();
    }

    public UserResponse me(UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new UnauthorizedException("User not found"));
        return UserResponse.from(user);
    }

    @Transactional
    public void forgotPassword(ForgotPasswordRequest req) {
        String identifier = req.getIdentifier() == null ? "" : req.getIdentifier().trim();
        User user = userRepository.findByEmailOrPhone(identifier, identifier)
                .orElse(null);

        // Don't reveal whether an account exists - always respond the same way from the controller.
        if (user == null) {
            return;
        }

        String otp = String.format("%06d", new java.security.SecureRandom().nextInt(1_000_000));
        user.setResetOtpCode(otp);
        user.setResetOtpExpiresAt(LocalDateTime.now().plusMinutes(15));
        userRepository.save(user);

        notificationService.sendEmail(user, "Reset your My Resources password",
                "Hi " + user.getName() + ", your password reset code is " + otp
                        + ". It expires in 15 minutes. If you didn't request this, you can ignore this email.");
    }

    @Transactional
    public void resetPassword(ResetPasswordRequest req) {
        String identifier = req.getIdentifier() == null ? "" : req.getIdentifier().trim();
        String otpInput = req.getOtpCode() == null ? "" : req.getOtpCode().trim();

        User user = userRepository.findByEmailOrPhone(identifier, identifier)
                .orElseThrow(() -> new BadRequestException("Invalid or expired reset code"));

        if (user.getResetOtpCode() == null
                || user.getResetOtpExpiresAt() == null
                || user.getResetOtpExpiresAt().isBefore(LocalDateTime.now())
                || !user.getResetOtpCode().equals(otpInput)) {
            throw new BadRequestException("Invalid or expired reset code");
        }

        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        user.setResetOtpCode(null);
        user.setResetOtpExpiresAt(null);
        userRepository.save(user);

        notificationService.sendEmail(user, "Your My Resources password was changed",
                "Hi " + user.getName() + ", your password was just changed. If this wasn't you, contact support immediately.");
    }

    @Transactional
    public UserResponse updateProfile(UpdateProfileRequest req, UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        if (req.getName() != null && !req.getName().isBlank()) {
            user.setName(req.getName());
        }

        if (req.getEmail() != null && !req.getEmail().isBlank() && !req.getEmail().equals(user.getEmail())) {
            if (userRepository.existsByEmail(req.getEmail())) {
                throw new BadRequestException("Email already in use");
            }
            user.setEmail(req.getEmail());
            user.setEmailVerified(false);
            user.setEmailVerificationToken(java.util.UUID.randomUUID().toString());
            userRepository.save(user);
            sendVerificationEmail(user);
        }

        if (req.getPhone() != null && !req.getPhone().isBlank() && !req.getPhone().equals(user.getPhone())) {
            if (userRepository.existsByPhone(req.getPhone())) {
                throw new BadRequestException("Phone number already in use");
            }
            user.setPhone(req.getPhone());
            user.setPhoneVerified(false);
        }

        if (req.getLocation() != null) {
            user.setLocation(req.getLocation());
        }

        user = userRepository.save(user);
        return UserResponse.from(user);
    }

    @Transactional
    public void changePassword(ChangePasswordRequest req, UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        if (!passwordEncoder.matches(req.getCurrentPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }

        user.setPassword(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(user);

        notificationService.sendEmail(user, "Your My Resources password was changed",
                "Hi " + user.getName() + ", your password was just changed. If this wasn't you, contact support immediately.");
    }

    @Transactional
    public void verifyEmail(String token) {
        User user = userRepository.findByEmailVerificationToken(token)
                .orElseThrow(() -> new BadRequestException("Invalid or expired verification link"));
        user.setEmailVerified(true);
        user.setEmailVerificationToken(null);
        userRepository.save(user);
    }

    @Transactional
    public void resendVerificationEmail(UserPrincipal principal) {
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new UnauthorizedException("User not found"));

        if (user.getEmail() == null) {
            throw new BadRequestException("No email address on file for this account");
        }
        if (user.isEmailVerified()) {
            throw new BadRequestException("Email is already verified");
        }

        user.setEmailVerificationToken(java.util.UUID.randomUUID().toString());
        userRepository.save(user);
        sendVerificationEmail(user);
    }

    private void sendVerificationEmail(User user) {
        String link = frontendUrl + "/verify-email?token=" + user.getEmailVerificationToken();
        notificationService.sendEmail(user, "Verify your email for My Resources",
                "Hi " + user.getName() + ", please verify your email by opening this link: " + link
                        + "\n\nIf you didn't create this account, you can ignore this email.");
    }

    private String subjectOf(User user) {
        return user.getEmail() != null ? user.getEmail() : user.getPhone();
    }

    private String blankToNull(String s) {
        return (s == null || s.isBlank()) ? null : s;
    }
}
