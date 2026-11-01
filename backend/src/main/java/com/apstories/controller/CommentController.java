package com.apstories.controller;

import com.apstories.dto.CommentDto;
import com.apstories.dto.CommentRequest;
import com.apstories.service.CommentService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping
public class CommentController {

    private final CommentService commentService;

    public CommentController(CommentService commentService) {
        this.commentService = commentService;
    }

    @GetMapping("/api/blogs/{blogId}/comments")
    public ResponseEntity<List<CommentDto>> getComments(@PathVariable String blogId) {
        return ResponseEntity.ok(commentService.getCommentsForBlog(blogId));
    }

    @PostMapping("/api/blogs/{blogId}/comments")
    public ResponseEntity<?> addComment(
            @PathVariable String blogId,
            @Valid @RequestBody CommentRequest request,
            Authentication authentication) {
        try {
            String userId = authentication != null ? authentication.getName() : null;
            CommentDto created = commentService.addComment(blogId, request, userId);
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/api/comments/{id}/like")
    public ResponseEntity<?> likeComment(@PathVariable String id) {
        CommentDto updated = commentService.likeComment(id);
        return ResponseEntity.ok(Map.of("likes", updated != null ? updated.getLikes() : 0));
    }

    @DeleteMapping("/api/comments/{id}")
    public ResponseEntity<?> deleteComment(@PathVariable String id, Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Sign in required to delete comment"));
        }
        try {
            boolean isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            boolean deleted = commentService.deleteComment(id, authentication.getName(), isAdmin);
            return ResponseEntity.ok(Map.of("deleted", deleted));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

