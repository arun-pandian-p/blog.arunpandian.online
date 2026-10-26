package com.arunpandian.blog.controller;

import com.arunpandian.blog.dto.common.PageResponse;
import com.arunpandian.blog.dto.newsletter.BroadcastRequest;
import com.arunpandian.blog.dto.newsletter.SubscribeRequest;
import com.arunpandian.blog.entity.NewsletterSubscriber;
import com.arunpandian.blog.service.NewsletterService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
public class NewsletterController {

    private final NewsletterService newsletterService;

    public NewsletterController(NewsletterService newsletterService) {
        this.newsletterService = newsletterService;
    }

    @PostMapping("/api/newsletter/subscribe")
    public ResponseEntity<Map<String, String>> subscribe(@Valid @RequestBody SubscribeRequest request) {
        newsletterService.subscribe(request.getEmail(), request.getSource());
        return ResponseEntity.ok(Map.of("message", "Subscribed successfully"));
    }

    @PostMapping("/api/newsletter/unsubscribe")
    public ResponseEntity<Map<String, String>> unsubscribe(@RequestBody Map<String, String> body) {
        String email = body.get("email");
        if (email != null) {
            newsletterService.unsubscribe(email);
        }
        return ResponseEntity.ok(Map.of("message", "Unsubscribed successfully"));
    }

    @GetMapping("/api/admin/newsletter/subscribers")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PageResponse<NewsletterSubscriber>> getSubscribers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "50") int size) {
        return ResponseEntity.ok(newsletterService.getSubscribers(page, size));
    }

    @PostMapping("/api/admin/newsletter/broadcast")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Map<String, Object>> broadcast(@Valid @RequestBody BroadcastRequest request) {
        return ResponseEntity.ok(newsletterService.broadcast(request));
    }

    @DeleteMapping("/api/admin/newsletter/subscribers/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteSubscriber(@PathVariable UUID id) {
        newsletterService.deleteSubscriber(id);
        return ResponseEntity.noContent().build();
    }
}
