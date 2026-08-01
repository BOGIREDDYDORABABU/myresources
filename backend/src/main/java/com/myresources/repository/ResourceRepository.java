package com.myresources.repository;

import com.myresources.entity.Resource;
import com.myresources.enums.ResourceStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResourceRepository extends JpaRepository<Resource, Long>, org.springframework.data.jpa.repository.JpaSpecificationExecutor<Resource> {
    Page<Resource> findByOwnerId(Long ownerId, Pageable pageable);
    Page<Resource> findByStatusNot(ResourceStatus status, Pageable pageable);
}
