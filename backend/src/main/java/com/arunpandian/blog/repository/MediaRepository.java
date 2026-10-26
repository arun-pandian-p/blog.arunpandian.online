package com.arunpandian.blog.repository;

import com.arunpandian.blog.entity.Media;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface MediaRepository extends JpaRepository<Media, UUID> {
    Optional<Media> findByFilename(String filename);
    Page<Media> findAllByOrderByCreatedAtDesc(Pageable pageable);
}
