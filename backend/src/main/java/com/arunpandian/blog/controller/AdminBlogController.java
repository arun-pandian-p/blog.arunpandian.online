package com.arunpandian.blog.controller;

import com.arunpandian.blog.dto.blog.BlogCreateRequest;
import com.arunpandian.blog.dto.blog.BlogDto;
import com.arunpandian.blog.dto.blog.BlogUpdateRequest;
import com.arunpandian.blog.dto.common.PageResponse;
import com.arunpandian.blog.entity.enums.BlogStatus;
import com.arunpandian.blog.service.BlogService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/admin/blogs")
@PreAuthorize("hasRole('ADMIN')")
public class AdminBlogController {

    private final BlogService blogService;

    public AdminBlogController(BlogService blogService) {
        this.blogService = blogService;
    }

    @GetMapping
    public ResponseEntity<PageResponse<BlogDto>> getAllBlogs(
            @RequestParam(required = false) String query,
            @RequestParam(required = false) BlogStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "15") int size) {
        return ResponseEntity.ok(blogService.getAllBlogsForAdmin(query, status, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<BlogDto> getBlogById(@PathVariable UUID id) {
        return ResponseEntity.ok(blogService.getBlogByIdForAdmin(id));
    }

    @PostMapping
    public ResponseEntity<BlogDto> createBlog(@Valid @RequestBody BlogCreateRequest request) {
        BlogDto created = blogService.createBlog(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<BlogDto> updateBlog(
            @PathVariable UUID id,
            @Valid @RequestBody BlogUpdateRequest request) {
        BlogDto updated = blogService.updateBlog(id, request);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteBlog(@PathVariable UUID id) {
        blogService.deleteBlog(id);
        return ResponseEntity.noContent().build();
    }
}
