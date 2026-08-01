package com.myresources.service;

import com.myresources.dto.PurchaseRequestDTO;
import com.myresources.entity.PurchaseOrder;
import com.myresources.entity.Resource;
import com.myresources.entity.Transaction;
import com.myresources.enums.PurchaseStatus;
import com.myresources.enums.ResourceStatus;
import com.myresources.enums.TransactionStatus;
import com.myresources.enums.TransactionType;
import com.myresources.exception.BadRequestException;
import com.myresources.exception.ResourceNotFoundException;
import com.myresources.exception.UnauthorizedException;
import com.myresources.repository.PurchaseOrderRepository;
import com.myresources.repository.ResourceRepository;
import com.myresources.repository.TransactionRepository;
import com.myresources.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.UUID;

/**
 * Implements the PRD purchase workflow:
 * Search -> Buy -> Payment -> Owner Approval -> Delivery/Pickup -> Order Complete
 */
@Service
@RequiredArgsConstructor
public class PurchaseService {

    private final PurchaseOrderRepository purchaseOrderRepository;
    private final ResourceRepository resourceRepository;
    private final TransactionRepository transactionRepository;
    private final NotificationService notificationService;

    @Transactional
    public PurchaseOrder buy(PurchaseRequestDTO dto, UserPrincipal principal) {
        Resource resource = resourceRepository.findById(dto.getResourceId())
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));

        if (resource.getOwner().getId().equals(principal.getId())) {
            throw new BadRequestException("You cannot purchase your own resource");
        }
        if (resource.getSellingPrice() == null) {
            throw new BadRequestException("This resource is not for sale");
        }
        if (resource.getQuantityAvailable() < dto.getQuantity()) {
            throw new BadRequestException("Requested quantity is not available");
        }

        BigDecimal unitPrice = resource.getSellingPrice();
        if (resource.getDiscountPercent() != null && resource.getDiscountPercent().compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal discount = unitPrice.multiply(resource.getDiscountPercent()).divide(BigDecimal.valueOf(100));
            unitPrice = unitPrice.subtract(discount);
        }
        BigDecimal total = unitPrice.multiply(BigDecimal.valueOf(dto.getQuantity()));

        PurchaseOrder order = PurchaseOrder.builder()
                .resource(resource)
                .buyer(principal.getUser())
                .quantity(dto.getQuantity())
                .totalAmount(total)
                .deliveryAddress(dto.getDeliveryAddress())
                .status(PurchaseStatus.PENDING_PAYMENT)
                .build();
        order = purchaseOrderRepository.save(order);
        return order;
    }

    /** Simulates a successful payment gateway callback. Wire a real gateway (Razorpay/Stripe/UPI) here. */
    @Transactional
    public PurchaseOrder confirmPayment(Long orderId, UserPrincipal principal) {
        PurchaseOrder order = buyerOrder(orderId, principal);
        if (order.getStatus() != PurchaseStatus.PENDING_PAYMENT) {
            throw new BadRequestException("Order is not pending payment");
        }

        order.setStatus(PurchaseStatus.PAID);
        order = purchaseOrderRepository.save(order);

        Transaction tx = Transaction.builder()
                .transactionRef("TXN-" + UUID.randomUUID())
                .user(principal.getUser())
                .purchaseOrderId(order.getId())
                .type(TransactionType.PURCHASE)
                .status(TransactionStatus.SUCCESS)
                .amount(order.getTotalAmount())
                .build();
        transactionRepository.save(tx);

        notificationService.notifyAll(order.getResource().getOwner(), "New Purchase",
                principal.getUser().getName() + " purchased \"" + order.getResource().getName() + "\".");
        return order;
    }

    @Transactional
    public PurchaseOrder approve(Long orderId, UserPrincipal ownerPrincipal) {
        PurchaseOrder order = ownedOrder(orderId, ownerPrincipal);
        if (order.getStatus() != PurchaseStatus.PAID) {
            throw new BadRequestException("Order must be paid before approval");
        }

        Resource resource = order.getResource();
        resource.setQuantityAvailable(resource.getQuantityAvailable() - order.getQuantity());
        if (resource.getQuantityAvailable() <= 0) resource.setStatus(ResourceStatus.OUT_OF_STOCK);
        resourceRepository.save(resource);

        order.setStatus(PurchaseStatus.APPROVED);
        order = purchaseOrderRepository.save(order);
        notificationService.notifyAll(order.getBuyer(), "Order Approved",
                "Your order for \"" + resource.getName() + "\" was approved and will be prepared for delivery/pickup.");
        return order;
    }

    @Transactional
    public PurchaseOrder markDelivered(Long orderId, UserPrincipal ownerPrincipal) {
        PurchaseOrder order = ownedOrder(orderId, ownerPrincipal);
        if (order.getStatus() != PurchaseStatus.APPROVED && order.getStatus() != PurchaseStatus.OUT_FOR_DELIVERY) {
            throw new BadRequestException("Order is not ready for delivery confirmation");
        }
        order.setStatus(PurchaseStatus.COMPLETED);
        order = purchaseOrderRepository.save(order);
        notificationService.notifyAll(order.getBuyer(), "Order Complete",
                "Your order for \"" + order.getResource().getName() + "\" is complete. Enjoy!");
        return order;
    }

    public Page<PurchaseOrder> myOrders(UserPrincipal principal, Pageable pageable) {
        return purchaseOrderRepository.findByBuyerId(principal.getId(), pageable);
    }

    public Page<PurchaseOrder> incomingOrders(UserPrincipal ownerPrincipal, Pageable pageable) {
        return purchaseOrderRepository.findByResourceOwnerId(ownerPrincipal.getId(), pageable);
    }

    private PurchaseOrder buyerOrder(Long id, UserPrincipal principal) {
        PurchaseOrder order = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        if (!order.getBuyer().getId().equals(principal.getId())) {
            throw new UnauthorizedException("This is not your order");
        }
        return order;
    }

    private PurchaseOrder ownedOrder(Long id, UserPrincipal ownerPrincipal) {
        PurchaseOrder order = purchaseOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found"));
        if (!order.getResource().getOwner().getId().equals(ownerPrincipal.getId())) {
            throw new UnauthorizedException("You do not own this resource");
        }
        return order;
    }
}
