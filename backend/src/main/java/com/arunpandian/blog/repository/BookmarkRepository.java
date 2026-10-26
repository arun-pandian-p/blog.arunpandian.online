package com.arunpandian.blog.repository;

import com.arunpandian.blog.entity.Bookmark;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BookmarkRepository extends JpaRepository<Bookmark, UUID> {
    boolean existsByUserIdAndBlogId(UUID userId, UUID blogId);
    Optional<Bookmark> findByUserIdAndBlogId(UUID userId, UUID blogId);
    List<Bookmark> findByUserIdOrderByCreatedAtDesc(UUID userId);
    void deleteByUserIdAndBlogId(UUID userId, UUID blogId);
    long countByBlogId(UUID blogId);
}
