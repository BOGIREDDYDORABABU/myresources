package com.myresources.repository;

import com.myresources.entity.Wishlist;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface WishlistRepository extends JpaRepository<Wishlist, Long> {
    Page<Wishlist> findByUserId(Long userId, Pageable pageable);
    Optional<Wishlist> findByUserIdAndResourceId(Long userId, Long resourceId);
    void deleteByUserIdAndResourceId(Long userId, Long resourceId);
}
