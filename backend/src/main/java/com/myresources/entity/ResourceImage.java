package com.myresources.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "resource_images")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ResourceImage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "resource_id", nullable = false)
    private Resource resource;

    @Column(nullable = false, length = 1000)
    private String url;

    @Builder.Default
    @Column(name = "is_primary")
    private boolean primary = false;
}
