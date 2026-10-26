package com.arunpandian.blog.repository;

import com.arunpandian.blog.entity.NewsletterSubscriber;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface NewsletterSubscriberRepository extends JpaRepository<NewsletterSubscriber, UUID> {
    Optional<NewsletterSubscriber> findByEmail(String email);
    boolean existsByEmail(String email);
    List<NewsletterSubscriber> findByStatus(String status);
    Page<NewsletterSubscriber> findAllByOrderByCreatedAtDesc(Pageable pageable);
    long countByStatus(String status);
}
