package com.myresources.service;

import com.myresources.dto.ComplaintRequestDTO;
import com.myresources.entity.Complaint;
import com.myresources.entity.User;
import com.myresources.enums.ComplaintStatus;
import com.myresources.enums.Role;
import com.myresources.exception.ResourceNotFoundException;
import com.myresources.repository.ComplaintRepository;
import com.myresources.repository.UserRepository;
import com.myresources.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class ComplaintService {

    private final ComplaintRepository complaintRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    @Transactional
    public Complaint raise(ComplaintRequestDTO dto, UserPrincipal principal) {
        Complaint complaint = Complaint.builder()
                .raisedBy(principal.getUser())
                .type(dto.getType())
                .description(dto.getDescription())
                .resourceId(dto.getResourceId())
                .borrowRequestId(dto.getBorrowRequestId())
                .purchaseOrderId(dto.getPurchaseOrderId())
                .status(ComplaintStatus.OPEN)
                .build();
        complaint = complaintRepository.save(complaint);

        notificationService.sendEmail(principal.getUser(), "We've received your complaint",
                "Hi " + principal.getUser().getName() + ", we've logged your " + dto.getType().name().replace('_', ' ')
                        + " complaint and our team will review it shortly.");

        for (User admin : userRepository.findByRole(Role.ADMIN, Pageable.unpaged())) {
            notificationService.sendEmail(admin, "New complaint filed",
                    principal.getUser().getName() + " filed a " + dto.getType().name().replace('_', ' ')
                            + " complaint: \"" + dto.getDescription() + "\"");
        }

        return complaint;
    }

    public Page<Complaint> myComplaints(UserPrincipal principal, Pageable pageable) {
        return complaintRepository.findByRaisedById(principal.getId(), pageable);
    }

    public Page<Complaint> all(ComplaintStatus status, Pageable pageable) {
        return status != null ? complaintRepository.findByStatus(status, pageable) : complaintRepository.findAll(pageable);
    }

    @Transactional
    public Complaint updateStatus(Long id, ComplaintStatus status, String adminNotes) {
        Complaint complaint = complaintRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Complaint not found"));
        complaint.setStatus(status);
        if (adminNotes != null) complaint.setAdminNotes(adminNotes);
        complaint = complaintRepository.save(complaint);

        notificationService.sendEmail(complaint.getRaisedBy(), "Update on your complaint",
                "Hi " + complaint.getRaisedBy().getName() + ", your complaint status is now: "
                        + status.name().replace('_', ' ')
                        + (adminNotes != null ? (". Note from our team: " + adminNotes) : "."));

        return complaint;
    }
}
