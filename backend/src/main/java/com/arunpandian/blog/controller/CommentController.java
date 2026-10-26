package com.arunpandian.blog.controller;

import com.arunpandian.blog.dto.comment.CommentCreateRequest;
import com.arunpandian.blog.dto.comment.CommentDto;
import com.arunpandian.blog.dto.comment.CommentStatusUpdateRequest;
import com.arunpandian.blog.dto.common.PageResponse;
import com.arunpandian.blog.entity.enums.CommentStatus;
import com.arunpandian.blog.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    // Public endpoints
    @GetMapping("/api/comments")
    public ResponseEntity<List<CommentDto>> getComments(
            @RequestParam(required = false) String targetSlug,
            @RequestParam(required = false) UUID blogId) {
        return ResponseEntity.ok(commentService.getApprovedComments(targetSlug, blogId));
    }

    @PostMapping("/api/comments")
    public ResponseEntity<CommentDto> createComment(@Valid @RequestBody CommentCreateRequest request) {
        CommentDto created = commentService.createComment(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PostMapping("/api/comments/{id}/like")
    public ResponseEntity<Map<String, Integer>> likeComment(@PathVariable UUID id) {
        int likes = commentService.likeComment(id);
        return ResponseEntity.ok(Map.of("likes", likes));
    }

    // Admin moderation endpoints
    @GetMapping("/api/admin/comments")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PageResponse<CommentDto>> getAllComments(
            @RequestParam(required = false) CommentStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(commentService.getAllCommentsForAdmin(status, page, size));
    }

    @PatchMapping("/api/admin/comments/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<CommentDto> updateCommentStatus(
            @PathVariable UUID id,
            @Valid @RequestBody CommentStatusUpdateRequest request) {
        CommentDto updated = commentService.updateCommentStatus(id, request.getStatus());
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/api/admin/comments/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteComment(@PathVariable UUID id) {
        commentService.deleteComment(id);
        return ResponseEntity.noContent().build();
    }
}
