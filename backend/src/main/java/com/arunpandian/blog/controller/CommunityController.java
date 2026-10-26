package com.arunpandian.blog.controller;

import com.arunpandian.blog.entity.AbuseReport;
import com.arunpandian.blog.entity.User;
import com.arunpandian.blog.service.AuthService;
import com.arunpandian.blog.service.CommunityService;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/community")
public class CommunityController {

    private final CommunityService communityService;
    private final AuthService authService;

    public CommunityController(CommunityService communityService, AuthService authService) {
        this.communityService = communityService;
        this.authService = authService;
    }

    @PostMapping("/follow/{userId}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, Object>> toggleFollow(@PathVariable UUID userId) {
        User currentUser = authService.getCurrentUserEntity();
        return ResponseEntity.ok(communityService.toggleFollow(currentUser, userId));
    }

    @GetMapping("/follow-status/{userId}")
    public ResponseEntity<Map<String, Object>> getFollowStatus(@PathVariable UUID userId) {
        User currentUser = null;
        try {
            currentUser = authService.getCurrentUserEntity();
        } catch (Exception ignored) {}
        return ResponseEntity.ok(communityService.getFollowStatus(currentUser, userId));
    }

    @PostMapping("/reports")
    public ResponseEntity<AbuseReport> submitReport(@RequestBody Map<String, String> body) {
        User currentUser = null;
        try {
            currentUser = authService.getCurrentUserEntity();
        } catch (Exception ignored) {}

        String targetType = body.getOrDefault("targetType", "BLOG");
        UUID targetId = UUID.fromString(body.get("targetId"));
        String reason = body.getOrDefault("reason", "Inappropriate content");
        String details = body.getOrDefault("details", "");

        return ResponseEntity.ok(communityService.submitReport(currentUser, targetType, targetId, reason, details));
    }

    @GetMapping("/admin/reports")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<AbuseReport>> getReports(
            @RequestParam(required = false, defaultValue = "PENDING") String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(communityService.getReports(status, page, size));
    }

    @PutMapping("/admin/reports/{reportId}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<AbuseReport> updateReportStatus(
            @PathVariable UUID reportId,
            @RequestBody Map<String, String> body) {
        String status = body.getOrDefault("status", "RESOLVED");
        return ResponseEntity.ok(communityService.updateReportStatus(reportId, status));
    }
}
