package com.arunpandian.blog.controller;

import com.arunpandian.blog.dto.blog.BlogCreateRequest;
import com.arunpandian.blog.dto.blog.BlogDto;
import com.arunpandian.blog.dto.blog.BlogUpdateRequest;
import com.arunpandian.blog.dto.common.PageResponse;
import com.arunpandian.blog.entity.User;
import com.arunpandian.blog.service.AuthService;
import com.arunpandian.blog.service.BlogService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/blogs")
public class BlogController {

    private final BlogService blogService;
    private final AuthService authService;

    public BlogController(BlogService blogService, AuthService authService) {
        this.blogService = blogService;
        this.authService = authService;
    }

    @GetMapping
    public ResponseEntity<PageResponse<BlogDto>> getPublicBlogs(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) String author,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(blogService.getPublicBlogs(query, category, tag, author, page, size));
    }

    @GetMapping("/{slug}")
    public ResponseEntity<BlogDto> getBlogBySlug(@PathVariable String slug) {
        return ResponseEntity.ok(blogService.getBlogBySlug(slug));
    }

    @GetMapping("/{slug}/related")
    public ResponseEntity<List<BlogDto>> getRelatedBlogs(@PathVariable String slug) {
        return ResponseEntity.ok(blogService.getRelatedBlogs(slug));
    }

    @GetMapping("/me")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PageResponse<BlogDto>> getMyArticles(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        User currentUser = authService.getCurrentUserEntity();
        return ResponseEntity.ok(blogService.getMyArticles(currentUser, page, size));
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BlogDto> createBlog(@Valid @RequestBody BlogCreateRequest request) {
        User currentUser = authService.getCurrentUserEntity();
        BlogDto created = blogService.createBlog(request, currentUser);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<BlogDto> updateBlog(
            @PathVariable UUID id,
            @Valid @RequestBody BlogUpdateRequest request) {
        User currentUser = authService.getCurrentUserEntity();
        BlogDto updated = blogService.updateBlog(id, request, currentUser);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deleteBlog(@PathVariable UUID id) {
        User currentUser = authService.getCurrentUserEntity();
        blogService.deleteBlog(id, currentUser);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/clap")
    public ResponseEntity<Map<String, Integer>> clapBlog(@PathVariable UUID id) {
        int claps = blogService.clapBlog(id);
        return ResponseEntity.ok(Map.of("clapsCount", claps));
    }
}
