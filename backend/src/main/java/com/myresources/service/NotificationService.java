package com.myresources.service;

import com.myresources.entity.Notification;
import com.myresources.entity.User;
import com.myresources.enums.NotificationType;
import com.myresources.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Central place for outgoing notifications. Persists an in-app notification
 * record for every event, and best-effort dispatches email. SMS dispatch is
 * stubbed behind {@code app.sms.provider} - wire in Twilio/Fast2SMS/MSG91
 * credentials in application.properties and implement the HTTP call in sendSms().
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final JavaMailSender mailSender;

    @Value("${app.mail.from-address:${spring.mail.username:}}")
    private String fromAddress;

    @Value("${app.mail.from-name:My Resources}")
    private String fromName;

    public void notifyInApp(User user, String title, String message) {
        Notification n = Notification.builder()
                .user(user)
                .title(title)
                .message(message)
                .channel(NotificationType.SYSTEM)
                .build();
        notificationRepository.save(n);
    }

    @Async
    public void sendEmail(User user, String subject, String body) {
        if (user.getEmail() == null || user.getEmail().isBlank()) return;
        try {
            SimpleMailMessage mail = new SimpleMailMessage();
            if (fromAddress != null && !fromAddress.isBlank()) {
                mail.setFrom(fromName + " <" + fromAddress + ">");
            }
            mail.setTo(user.getEmail());
            mail.setSubject(subject);
            mail.setText(body);
            mailSender.send(mail);
        } catch (Exception e) {
            log.warn("Email dispatch failed for user {}: {}", user.getId(), e.getMessage());
        }
        notificationRepository.save(Notification.builder()
                .user(user).title(subject).message(body).channel(NotificationType.EMAIL).build());
    }

    @Async
    public void sendSms(User user, String message) {
        if (user.getPhone() == null || user.getPhone().isBlank()) return;
        // TODO: integrate Twilio / Fast2SMS / MSG91 using app.sms.provider + app.sms.api-key
        log.info("[SMS STUB] to {}: {}", user.getPhone(), message);
        notificationRepository.save(Notification.builder()
                .user(user).title("SMS").message(message).channel(NotificationType.SMS).build());
    }

    public void notifyAll(User user, String title, String message) {
        notifyInApp(user, title, message);
        sendEmail(user, title, message);
        sendSms(user, message);
    }
}
