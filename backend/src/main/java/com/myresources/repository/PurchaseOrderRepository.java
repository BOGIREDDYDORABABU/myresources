package com.myresources.repository;

import com.myresources.entity.PurchaseOrder;
import com.myresources.enums.PurchaseStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface PurchaseOrderRepository extends JpaRepository<PurchaseOrder, Long> {
    Page<PurchaseOrder> findByBuyerId(Long buyerId, Pageable pageable);
    Page<PurchaseOrder> findByResourceOwnerId(Long ownerId, Pageable pageable);
    Page<PurchaseOrder> findByStatus(PurchaseStatus status, Pageable pageable);
}
