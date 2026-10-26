package com.arunpandian.blog.service;

import com.arunpandian.blog.dto.common.PageResponse;
import com.arunpandian.blog.dto.newsletter.BroadcastRequest;
import com.arunpandian.blog.entity.NewsletterSubscriber;
import com.arunpandian.blog.exception.ResourceNotFoundException;
import com.arunpandian.blog.repository.NewsletterSubscriberRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
public class NewsletterService {

    private static final Logger log = LoggerFactory.getLogger(NewsletterService.class);

    private final NewsletterSubscriberRepository subscriberRepository;

    public NewsletterService(NewsletterSubscriberRepository subscriberRepository) {
        this.subscriberRepository = subscriberRepository;
    }

    @Transactional
    public boolean subscribe(String email, String source) {
        String cleanEmail = email.trim().toLowerCase();
        Optional<NewsletterSubscriber> existing = subscriberRepository.findByEmail(cleanEmail);

        if (existing.isPresent()) {
            NewsletterSubscriber sub = existing.get();
            if (!"active".equalsIgnoreCase(sub.getStatus())) {
                sub.setStatus("active");
                sub.setUpdatedAt(Instant.now());
                subscriberRepository.save(sub);
            }
            return true;
        }

        NewsletterSubscriber sub = new NewsletterSubscriber();
        sub.setEmail(cleanEmail);
        sub.setSource(source != null ? source : "web");
        sub.setStatus("active");
        subscriberRepository.save(sub);
        log.info("New newsletter subscriber: {}", cleanEmail);
        return true;
    }

    @Transactional
    public void unsubscribe(String email) {
        subscriberRepository.findByEmail(email.trim().toLowerCase()).ifPresent(sub -> {
            sub.setStatus("unsubscribed");
            sub.setUpdatedAt(Instant.now());
            subscriberRepository.save(sub);
            log.info("Unsubscribed: {}", email);
        });
    }

    @Transactional(readOnly = true)
    public PageResponse<NewsletterSubscriber> getSubscribers(int page, int size) {
        Page<NewsletterSubscriber> subPage = subscriberRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));
        return PageResponse.from(subPage);
    }

    @Transactional
    public Map<String, Object> broadcast(BroadcastRequest request) {
        List<NewsletterSubscriber> activeSubs = subscriberRepository.findByStatus("active");
        log.info("Broadcasting '{}' to {} active subscribers", request.getSubject(), activeSubs.size());
        // In production, integrate with SendGrid, SES, or SMTP. Here we log and return audit count.
        return Map.of(
                "recipientsCount", activeSubs.size(),
                "subject", request.getSubject(),
                "status", "DISPATCHED"
        );
    }

    @Transactional
    public void deleteSubscriber(UUID id) {
        NewsletterSubscriber sub = subscriberRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Subscriber", "id", id));
        subscriberRepository.delete(sub);
    }
}
