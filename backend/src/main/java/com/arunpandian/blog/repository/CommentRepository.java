package com.arunpandian.blog.repository;

import com.arunpandian.blog.entity.Comment;
import com.arunpandian.blog.entity.enums.CommentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CommentRepository extends JpaRepository<Comment, UUID> {
    List<Comment> findByBlogIdAndStatusOrderByCreatedAtDesc(UUID blogId, CommentStatus status);
    List<Comment> findByTargetSlugAndStatusOrderByCreatedAtDesc(String targetSlug, CommentStatus status);
    Page<Comment> findByStatusOrderByCreatedAtDesc(CommentStatus status, Pageable pageable);
    Page<Comment> findAllByOrderByCreatedAtDesc(Pageable pageable);
    long countByStatus(CommentStatus status);
}
