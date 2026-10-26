package com.arunpandian.blog.repository;

import com.arunpandian.blog.entity.Blog;
import com.arunpandian.blog.entity.enums.BlogStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.Instant;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface BlogRepository extends JpaRepository<Blog, UUID> {

    Optional<Blog> findBySlug(String slug);

    Optional<Blog> findBySlugAndPublishedTrue(String slug);

    boolean existsBySlug(String slug);

    boolean existsBySlugAndIdNot(String slug, UUID id);

    Page<Blog> findByPublishedTrueAndStatus(BlogStatus status, Pageable pageable);

    Page<Blog> findByStatus(BlogStatus status, Pageable pageable);

    @Query("SELECT b FROM Blog b WHERE b.published = true AND b.status = 'PUBLISHED' " +
           "AND (b.publishedAt IS NULL OR b.publishedAt <= :now)")
    Page<Blog> findPublicPublished(@Param("now") Instant now, Pageable pageable);

    @Query("SELECT b FROM Blog b WHERE b.published = true AND b.status = 'PUBLISHED' " +
           "AND (b.publishedAt IS NULL OR b.publishedAt <= :now) " +
           "AND (LOWER(b.title) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "     OR LOWER(b.excerpt) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "     OR LOWER(b.tags) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "     OR LOWER(b.content) LIKE LOWER(CONCAT('%', :query, '%')))")
    Page<Blog> searchPublicPublished(@Param("query") String query, @Param("now") Instant now, Pageable pageable);

    @Query("SELECT b FROM Blog b WHERE " +
           "LOWER(b.title) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(b.excerpt) LIKE LOWER(CONCAT('%', :query, '%')) " +
           "OR LOWER(b.tags) LIKE LOWER(CONCAT('%', :query, '%'))")
    Page<Blog> searchAll(@Param("query") String query, Pageable pageable);

    @Query("SELECT b FROM Blog b WHERE b.published = true AND b.status = 'PUBLISHED' " +
           "AND (b.publishedAt IS NULL OR b.publishedAt <= :now) " +
           "AND LOWER(b.category) = LOWER(:category)")
    Page<Blog> findPublicPublishedByCategory(@Param("category") String category, @Param("now") Instant now, Pageable pageable);

    @Query("SELECT b FROM Blog b WHERE b.published = true AND b.status = 'PUBLISHED' " +
           "AND (b.publishedAt IS NULL OR b.publishedAt <= :now) " +
           "AND LOWER(b.tags) LIKE LOWER(CONCAT('%', :tag, '%'))")
    Page<Blog> findPublicPublishedByTag(@Param("tag") String tag, @Param("now") Instant now, Pageable pageable);

    @Query("SELECT b FROM Blog b WHERE b.published = true AND b.status = 'PUBLISHED' " +
           "AND (b.publishedAt IS NULL OR b.publishedAt <= :now) " +
           "AND LOWER(b.authorUsername) = LOWER(:authorUsername)")
    Page<Blog> findPublicPublishedByAuthor(@Param("authorUsername") String authorUsername, @Param("now") Instant now, Pageable pageable);

    Page<Blog> findByAuthorId(UUID authorId, Pageable pageable);

    @Query("SELECT b FROM Blog b WHERE b.published = true AND b.status = 'PUBLISHED' " +
           "AND b.id <> :id AND (LOWER(b.category) = LOWER(:category) OR LOWER(b.tags) LIKE LOWER(CONCAT('%', :primaryTag, '%'))) " +
           "ORDER BY b.publishedAt DESC")
    List<Blog> findRelatedBlogs(@Param("id") UUID id, @Param("category") String category, @Param("primaryTag") String primaryTag, Pageable pageable);

    @Query("SELECT b FROM Blog b WHERE b.published = true AND b.status = 'PUBLISHED' " +
           "AND (b.publishedAt IS NULL OR b.publishedAt <= :now) ORDER BY b.publishedAt DESC")
    List<Blog> findRecentPublicPublished(@Param("now") Instant now, Pageable pageable);

    @Query("SELECT b FROM Blog b WHERE b.status = 'SCHEDULED' AND b.scheduledAt IS NOT NULL AND b.scheduledAt <= :now")
    List<Blog> findDueScheduledBlogs(@Param("now") Instant now);

    long countByStatus(BlogStatus status);
}
