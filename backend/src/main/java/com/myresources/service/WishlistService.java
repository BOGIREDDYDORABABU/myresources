package com.myresources.service;

import com.myresources.entity.Resource;
import com.myresources.entity.Wishlist;
import com.myresources.exception.BadRequestException;
import com.myresources.exception.ResourceNotFoundException;
import com.myresources.repository.ResourceRepository;
import com.myresources.repository.WishlistRepository;
import com.myresources.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class WishlistService {

    private final WishlistRepository wishlistRepository;
    private final ResourceRepository resourceRepository;

    @Transactional
    public Wishlist add(Long resourceId, UserPrincipal principal) {
        if (wishlistRepository.findByUserIdAndResourceId(principal.getId(), resourceId).isPresent()) {
            throw new BadRequestException("Resource already in wishlist");
        }
        Resource resource = resourceRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Resource not found"));
        Wishlist w = Wishlist.builder().user(principal.getUser()).resource(resource).build();
        return wishlistRepository.save(w);
    }

    @Transactional
    public void remove(Long resourceId, UserPrincipal principal) {
        wishlistRepository.deleteByUserIdAndResourceId(principal.getId(), resourceId);
    }

    public Page<Wishlist> myWishlist(UserPrincipal principal, Pageable pageable) {
        return wishlistRepository.findByUserId(principal.getId(), pageable);
    }
}
