package com.apstories.service;

import com.apstories.client.SupabaseClient;
import com.apstories.dto.BlogDto;
import com.apstories.dto.BookmarkDto;
import com.fasterxml.jackson.core.type.TypeReference;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;

@Service
public class BookmarkService {

    private final SupabaseClient supabaseClient;
    private final BlogService blogService;

    public BookmarkService(SupabaseClient supabaseClient, BlogService blogService) {
        this.supabaseClient = supabaseClient;
        this.blogService = blogService;
    }

    public List<BookmarkDto> getBookmarksForUser(String userId) {
        String query = "bookmarks?user_id=eq." + URLEncoder.encode(userId, StandardCharsets.UTF_8)
                + "&order=created_at.desc";
        List<BookmarkDto> bookmarks = supabaseClient.getList(query, new TypeReference<List<BookmarkDto>>() {});

        for (BookmarkDto b : bookmarks) {
            if (b.getBlogId() != null) {
                BlogDto blog = blogService.getBlogById(b.getBlogId());
                b.setBlog(blog);
            }
        }
        return bookmarks;
    }

    public boolean isBookmarked(String userId, String blogId) {
        String query = "bookmarks?user_id=eq." + URLEncoder.encode(userId, StandardCharsets.UTF_8)
                + "&blog_id=eq." + URLEncoder.encode(blogId, StandardCharsets.UTF_8) + "&limit=1";
        List<BookmarkDto> list = supabaseClient.getList(query, new TypeReference<List<BookmarkDto>>() {});
        return !list.isEmpty();
    }

    public Map<String, Object> toggleBookmark(String userId, String blogId) {
        String query = "bookmarks?user_id=eq." + URLEncoder.encode(userId, StandardCharsets.UTF_8)
                + "&blog_id=eq." + URLEncoder.encode(blogId, StandardCharsets.UTF_8) + "&limit=1";
        List<BookmarkDto> list = supabaseClient.getList(query, new TypeReference<List<BookmarkDto>>() {});

        if (!list.isEmpty()) {
            String path = "bookmarks?id=eq." + URLEncoder.encode(list.get(0).getId(), StandardCharsets.UTF_8);
            supabaseClient.delete(path);
            return Map.of("bookmarked", false);
        } else {
            String id = UUID.randomUUID().toString();
            Map<String, Object> map = new HashMap<>();
            map.put("id", id);
            map.put("user_id", userId);
            map.put("blog_id", blogId);
            map.put("created_at", Instant.now().toString());

            supabaseClient.post("bookmarks", map, new TypeReference<List<BookmarkDto>>() {});
            return Map.of("bookmarked", true);
        }
    }
}

