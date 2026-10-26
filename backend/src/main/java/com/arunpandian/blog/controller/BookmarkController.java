package com.arunpandian.blog.controller;

import com.arunpandian.blog.dto.blog.BookmarkDto;
import com.arunpandian.blog.entity.User;
import com.arunpandian.blog.service.AuthService;
import com.arunpandian.blog.service.BookmarkService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/bookmarks")
@PreAuthorize("isAuthenticated()")
public class BookmarkController {

    private final BookmarkService bookmarkService;
    private final AuthService authService;

    public BookmarkController(BookmarkService bookmarkService, AuthService authService) {
        this.bookmarkService = bookmarkService;
        this.authService = authService;
    }

    @GetMapping
    public ResponseEntity<List<BookmarkDto>> getUserBookmarks() {
        User currentUser = authService.getCurrentUserEntity();
        return ResponseEntity.ok(bookmarkService.getUserBookmarks(currentUser));
    }

    @PostMapping("/{blogId}")
    public ResponseEntity<Map<String, Object>> toggleBookmark(@PathVariable UUID blogId) {
        User currentUser = authService.getCurrentUserEntity();
        boolean bookmarked = bookmarkService.toggleBookmark(currentUser, blogId);
        return ResponseEntity.ok(Map.of("blogId", blogId, "bookmarked", bookmarked));
    }

    @DeleteMapping("/{blogId}")
    public ResponseEntity<Void> removeBookmark(@PathVariable UUID blogId) {
        User currentUser = authService.getCurrentUserEntity();
        bookmarkService.removeBookmark(currentUser, blogId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{blogId}/status")
    public ResponseEntity<Map<String, Boolean>> isBookmarked(@PathVariable UUID blogId) {
        User currentUser = authService.getCurrentUserEntity();
        boolean bookmarked = bookmarkService.isBookmarked(currentUser, blogId);
        return ResponseEntity.ok(Map.of("bookmarked", bookmarked));
    }
}
