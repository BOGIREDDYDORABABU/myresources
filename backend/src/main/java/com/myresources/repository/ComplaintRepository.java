package com.myresources.repository;

import com.myresources.entity.Complaint;
import com.myresources.enums.ComplaintStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ComplaintRepository extends JpaRepository<Complaint, Long> {
    Page<Complaint> findByRaisedById(Long userId, Pageable pageable);
    Page<Complaint> findByStatus(ComplaintStatus status, Pageable pageable);
}
