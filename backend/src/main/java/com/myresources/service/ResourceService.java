package com.myresources.service;

import com.myresources.dto.ResourceRequest;
import com.myresources.dto.ResourceResponse;
import com.myresources.entity.Resource;
import com.myresources.entity.ResourceImage;
import com.myresources.entity.User;
import com.myresources.enums.ResourceCategory;
import com.myresources.enums.ResourceStatus;
import com.myresources.enums.ResourceType;
import com.myresources.exception.BadRequestException;
import com.myresources.exception.ResourceNotFoundException;
import com.myresources.exception.UnauthorizedException;
import com.myresources.repository.ResourceRepository;
import com.myresources.security.UserPrincipal;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ResourceService {

    private final ResourceRepository resourceRepository;

    @Transactional
    public ResourceResponse create(ResourceRequest req, UserPrincipal principal) {
        User owner = principal.getUser();

        if (req.getResourceType() != ResourceType.SELL_ONLY && req.getBorrowPricePerDay() == null) {
            throw new BadRequestException("Borrow price per day is required for borrowable resources");
        }
        if (req.getResourceType() != ResourceType.BORROW_ONLY && req.getSellingPrice() == null) {
            throw new BadRequestException("Selling price is required for sellable resources");
        }

        Resource resource = Resource.builder()
                .owner(owner)
                .name(req.getName())
                .category(req.getCategory())
                .description(req.getDescription())
                .quantityAvailable(req.getQuantityAvailable())
                .quantityTotal(req.getQuantityAvailable())
                .condition(req.getCondition())
                .location(req.getLocation() != null ? req.getLocation() : owner.getLocation())
                .status(req.getQuantityAvailable() > 0 ? ResourceStatus.AVAILABLE : ResourceStatus.OUT_OF_STOCK)
                .borrowPricePerDay(req.getBorrowPricePerDay())
                .sellingPrice(req.getSellingPrice())
                .discountPercent(req.getDiscountPercent() != null ? req.getDiscountPercent() : BigDecimal.ZERO)
                .resourceType(req.getResourceType())
                .usageRules(req.getUsageRules())
                .maxBorrowDurationDays(req.getMaxBorrowDurationDays())
                .securityDeposit(req.getSecurityDeposit())
                .lateFeePerDay(req.getLateFeePerDay())
                .build();

        if (req.getImageUrls() != null) {
            List<ResourceImage> images = new ArrayList<>();
            for (int i = 0; i < req.getImageUrls().size(); i++) {
                images.add(ResourceImage.builder()
                        .resource(resource)
                        .url(req.getImageUrls().get(i))
                        .primary(i == 0)
                        .build());
            }
            resource.setImages(images);
        }

        resource = resourceRepository.save(resource);
        return ResourceResponse.from(resource);
    }

    @Transactional
    public ResourceResponse update(Long id, ResourceRequest req, UserPrincipal principal) {
        Resource resource = getOwnedResource(id, principal);

        resource.setName(req.getName());
        resource.setCategory(req.getCategory());
        resource.setDescription(req.getDescription());
        resource.setCondition(req.getCondition());
        resource.setLocation(req.getLocation());
        resource.setBorrowPricePerDay(req.getBorrowPricePerDay());
        resource.setSellingPrice(req.getSellingPrice());
        resource.setDiscountPercent(req.getDiscountPercent() != null ? req.getDiscountPercent() : BigDecimal.ZERO);
        resource.setResourceType(req.getResourceType());
        resource.setUsageRules(req.getUsageRules());
        resource.setMaxBorrowDurationDays(req.getMaxBorrowDurationDays());
        resource.setSecurityDeposit(req.getSecurityDeposit());
        resource.setLateFeePerDay(req.getLateFeePerDay());

        if (req.getQuantityAvailable() != null) {
            int delta = req.getQuantityAvailable() - resource.getQuantityAvailable();
            resource.setQuantityAvailable(req.getQuantityAvailable());
            resource.setQuantityTotal(resource.getQuantityTotal() + delta);
            resource.setStatus(resource.getQuantityAvailable() > 0 ? ResourceStatus.AVAILABLE : ResourceStatus.OUT_OF_STOCK);
        }

        if (req.getImageUrls() != null) {
            resource.getImages().clear();
            for (int i = 0; i < req.getImageUrls().size(); i++) {
                resource.getImages().add(ResourceImage.builder()
                        .resource(resource)
                        .url(req.getImageUrls().get(i))
                        .primary(i == 0)
                        .build());
            }
        }

        return ResourceResponse.from(resourceRepository.save(resource));
    }

    @Transactional
    public void delete(Long id, UserPrincipal principal) {
        Resource resource = getOwnedResource(id, principal);
        resource.setStatus(ResourceStatus.REMOVED);
        resourceRepository.save(resource);
    }

    public ResourceResponse get(Long id) {
        return ResourceResponse.from(findActive(id));
    }

    public Page<ResourceResponse> myResources(UserPrincipal principal, Pageable pageable) {
        return resourceRepository.findByOwnerId(principal.getId(), pageable).map(ResourceResponse::from);
    }

    public Page<ResourceResponse> search(String q, ResourceCategory category, String location,
                                          ResourceType resourceType, Boolean borrow, Boolean sell,
                                          Boolean verifiedOnly, Boolean discountOnly,
                                          BigDecimal maxPrice, String sort, Pageable pageable) {

        Specification<Resource> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.notEqual(root.get("status"), ResourceStatus.REMOVED));

            if (q != null && !q.isBlank()) {
                String like = "%" + q.toLowerCase() + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("name")), like),
                        cb.like(cb.lower(root.get("description")), like)
                ));
            }
            if (category != null) predicates.add(cb.equal(root.get("category"), category));
            if (location != null && !location.isBlank()) {
                predicates.add(cb.like(cb.lower(root.get("location")), "%" + location.toLowerCase() + "%"));
            }
            if (resourceType != null) predicates.add(cb.equal(root.get("resourceType"), resourceType));
            if (Boolean.TRUE.equals(borrow)) {
                predicates.add(root.get("resourceType").in(ResourceType.BORROW_ONLY, ResourceType.BORROW_AND_SELL));
            }
            if (Boolean.TRUE.equals(sell)) {
                predicates.add(root.get("resourceType").in(ResourceType.SELL_ONLY, ResourceType.BORROW_AND_SELL));
            }
            if (Boolean.TRUE.equals(verifiedOnly)) predicates.add(cb.isTrue(root.get("verified")));
            if (Boolean.TRUE.equals(discountOnly)) predicates.add(cb.greaterThan(root.get("discountPercent"), BigDecimal.ZERO));
            if (maxPrice != null) {
                predicates.add(cb.or(
                        cb.lessThanOrEqualTo(root.get("sellingPrice"), maxPrice),
                        cb.lessThanOrEqualTo(root.get("borrowPricePerDay"), maxPrice)
                ));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return resourceRepository.findAll(spec, pageable).map(ResourceResponse::from);
    }

    private Resource findActive(Long id) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));
        if (resource.getStatus() == ResourceStatus.REMOVED) {
            throw new ResourceNotFoundException("Resource not found");
        }
        return resource;
    }

    private Resource getOwnedResource(Long id, UserPrincipal principal) {
        Resource resource = resourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));
        if (!resource.getOwner().getId().equals(principal.getId())) {
            throw new UnauthorizedException("You do not own this resource");
        }
        return resource;
    }
}
