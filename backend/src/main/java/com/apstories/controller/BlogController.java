package com.apstories.controller;

import com.apstories.dto.BlogDto;
import com.apstories.dto.BlogRequest;
import com.apstories.service.BlogService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/blogs")
public class BlogController {

    private final BlogService blogService;

    public BlogController(BlogService blogService) {
        this.blogService = blogService;
    }

    @GetMapping
    public ResponseEntity<List<BlogDto>> getBlogs(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String tag,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "latest") String sort,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "12") int limit) {
        List<BlogDto> blogs = blogService.getBlogs(search, tag, category, sort, page, limit);
        return ResponseEntity.ok(blogs);
    }

    @GetMapping("/featured")
    public ResponseEntity<List<BlogDto>> getFeatured() {
        return ResponseEntity.ok(blogService.getFeaturedBlogs());
    }

    @GetMapping("/{slug}")
    public ResponseEntity<?> getBlogBySlug(@PathVariable String slug) {
        BlogDto blog = blogService.getBlogBySlug(slug);
        if (blog == null) {
            // Check if user requested by ID directly
            blog = blogService.getBlogById(slug);
        }
        if (blog == null) {
            return ResponseEntity.status(404).body(Map.of("error", "Story not found"));
        }
        return ResponseEntity.ok(blog);
    }

    @GetMapping("/author/{username}")
    public ResponseEntity<List<BlogDto>> getBlogsByAuthor(
            @PathVariable String username,
            @RequestParam(defaultValue = "false") boolean includeDrafts,
            Authentication authentication) {
        String currentUserId = authentication != null ? authentication.getName() : null;
        return ResponseEntity.ok(blogService.getBlogsByAuthor(username, includeDrafts, currentUserId));
    }

    @PostMapping
    public ResponseEntity<?> createBlog(@Valid @RequestBody BlogRequest request, Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Sign in required to create story"));
        }
        try {
            BlogDto created = blogService.createBlog(request, authentication.getName());
            return ResponseEntity.ok(created);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateBlog(
            @PathVariable String id,
            @RequestBody BlogRequest request,
            Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Sign in required to edit story"));
        }
        try {
            boolean isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            BlogDto updated = blogService.updateBlog(id, request, authentication.getName(), isAdmin);
            return ResponseEntity.ok(updated);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteBlog(@PathVariable String id, Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Sign in required to delete story"));
        }
        try {
            boolean isAdmin = authentication.getAuthorities().stream()
                    .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            boolean deleted = blogService.deleteBlog(id, authentication.getName(), isAdmin);
            return ResponseEntity.ok(Map.of("deleted", deleted));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/clap")
    public ResponseEntity<?> clapBlog(@PathVariable String id, @RequestBody(required = false) Map<String, Integer> payload) {
        int amount = (payload != null && payload.containsKey("amount")) ? payload.get("amount") : 1;
        BlogDto updated = blogService.incrementClaps(id, amount);
        return ResponseEntity.ok(Map.of("claps_count", updated != null ? updated.getClapsCount() : 0));
    }

    @PostMapping("/{id}/views")
    public ResponseEntity<?> incrementViews(@PathVariable String id) {
        blogService.incrementViews(id);
        return ResponseEntity.ok(Map.of("success", true));
    }
}

