package com.myresources.repository;

import com.myresources.entity.BorrowRequest;
import com.myresources.enums.BorrowRequestStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BorrowRequestRepository extends JpaRepository<BorrowRequest, Long> {
    Page<BorrowRequest> findByBorrowerId(Long borrowerId, Pageable pageable);
    Page<BorrowRequest> findByResourceOwnerId(Long ownerId, Pageable pageable);
    Page<BorrowRequest> findByStatus(BorrowRequestStatus status, Pageable pageable);
}
