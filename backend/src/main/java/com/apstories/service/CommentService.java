package com.apstories.service;

import com.apstories.client.SupabaseClient;
import com.apstories.dto.CommentDto;
import com.apstories.dto.CommentRequest;
import com.apstories.dto.UserDto;
import com.fasterxml.jackson.core.type.TypeReference;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;

@Service
public class CommentService {

    private final SupabaseClient supabaseClient;
    private final AuthService authService;

    public CommentService(SupabaseClient supabaseClient, AuthService authService) {
        this.supabaseClient = supabaseClient;
        this.authService = authService;
    }

    public List<CommentDto> getCommentsForBlog(String blogId) {
        String query = "comments?blog_id=eq." + URLEncoder.encode(blogId, StandardCharsets.UTF_8)
                + "&status=eq.APPROVED&order=created_at.asc";
        List<CommentDto> all = supabaseClient.getList(query, new TypeReference<List<CommentDto>>() {});

        // Build nested tree structure
        Map<String, CommentDto> map = new LinkedHashMap<>();
        List<CommentDto> roots = new ArrayList<>();

        for (CommentDto c : all) {
            c.setReplies(new ArrayList<>());
            map.put(c.getId(), c);
        }

        for (CommentDto c : all) {
            if (c.getParentId() != null && map.containsKey(c.getParentId())) {
                map.get(c.getParentId()).getReplies().add(c);
            } else {
                roots.add(c);
            }
        }

        return roots;
    }

    public CommentDto addComment(String blogId, CommentRequest req, String userId) {
        String authorName = req.getAuthorName();
        String authorEmail = req.getAuthorEmail();
        String authorAvatar = "https://api.dicebear.com/7.x/bottts/svg?seed=" + UUID.randomUUID().toString();

        if (userId != null) {
            UserDto u = authService.getUserById(userId);
            if (u != null) {
                authorName = u.getFullName();
                authorEmail = u.getEmail();
                authorAvatar = u.getAvatarUrl();
            }
        }

        if (authorName == null || authorName.isBlank()) {
            authorName = "Anonymous Engineer";
        }

        String commentId = UUID.randomUUID().toString();
        String now = Instant.now().toString();

        Map<String, Object> map = new HashMap<>();
        map.put("id", commentId);
        map.put("blog_id", blogId);
        map.put("author_id", userId);
        map.put("author_name", authorName);
        map.put("author_email", authorEmail);
        map.put("author_avatar", authorAvatar);
        map.put("content", req.getContent());
        map.put("status", "APPROVED");
        map.put("likes", 0);
        map.put("parent_id", req.getParentId());
        map.put("created_at", now);
        map.put("updated_at", now);

        List<CommentDto> result = supabaseClient.post("comments", map, new TypeReference<List<CommentDto>>() {});
        if (result.isEmpty()) {
            throw new RuntimeException("Failed to save comment");
        }
        return result.get(0);
    }

    public CommentDto likeComment(String commentId) {
        String query = "comments?id=eq." + URLEncoder.encode(commentId, StandardCharsets.UTF_8) + "&limit=1";
        List<CommentDto> list = supabaseClient.getList(query, new TypeReference<List<CommentDto>>() {});
        if (list.isEmpty()) return null;

        CommentDto existing = list.get(0);
        int newLikes = existing.getLikes() + 1;
        Map<String, Object> update = Map.of("likes", newLikes);
        String path = "comments?id=eq." + URLEncoder.encode(commentId, StandardCharsets.UTF_8);
        List<CommentDto> result = supabaseClient.patch(path, update, new TypeReference<List<CommentDto>>() {});
        return result.isEmpty() ? existing : result.get(0);
    }

    public boolean deleteComment(String commentId, String userId, boolean isAdmin) {
        String query = "comments?id=eq." + URLEncoder.encode(commentId, StandardCharsets.UTF_8) + "&limit=1";
        List<CommentDto> list = supabaseClient.getList(query, new TypeReference<List<CommentDto>>() {});
        if (list.isEmpty()) return false;

        CommentDto comment = list.get(0);
        if (!isAdmin && (comment.getAuthorId() == null || !comment.getAuthorId().equals(userId))) {
            throw new RuntimeException("Unauthorized: Cannot delete this comment");
        }

        String path = "comments?id=eq." + URLEncoder.encode(commentId, StandardCharsets.UTF_8);
        return supabaseClient.delete(path);
    }
}

