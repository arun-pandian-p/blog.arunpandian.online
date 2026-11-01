package com.apstories.controller;

import com.apstories.dto.BookmarkDto;
import com.apstories.service.BookmarkService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/bookmarks")
public class BookmarkController {

    private final BookmarkService bookmarkService;

    public BookmarkController(BookmarkService bookmarkService) {
        this.bookmarkService = bookmarkService;
    }

    @GetMapping
    public ResponseEntity<List<BookmarkDto>> getBookmarks(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).build();
        }
        return ResponseEntity.ok(bookmarkService.getBookmarksForUser(authentication.getName()));
    }

    @PostMapping("/{blogId}/toggle")
    public ResponseEntity<?> toggleBookmark(@PathVariable String blogId, Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.status(401).body(Map.of("error", "Sign in required to bookmark stories"));
        }
        Map<String, Object> res = bookmarkService.toggleBookmark(authentication.getName(), blogId);
        return ResponseEntity.ok(res);
    }

    @GetMapping("/{blogId}/check")
    public ResponseEntity<?> checkBookmark(@PathVariable String blogId, Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            return ResponseEntity.ok(Map.of("bookmarked", false));
        }
        boolean bookmarked = bookmarkService.isBookmarked(authentication.getName(), blogId);
        return ResponseEntity.ok(Map.of("bookmarked", bookmarked));
    }
}

