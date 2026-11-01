package com.apstories.service;

import com.apstories.client.SupabaseClient;
import com.apstories.dto.BlogDto;
import com.apstories.dto.BlogRequest;
import com.apstories.dto.UserDto;
import com.fasterxml.jackson.core.type.TypeReference;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.Normalizer;
import java.time.Instant;
import java.util.*;
import java.util.regex.Pattern;

@Service
public class BlogService {

    private final SupabaseClient supabaseClient;
    private final AuthService authService;

    public BlogService(SupabaseClient supabaseClient, AuthService authService) {
        this.supabaseClient = supabaseClient;
        this.authService = authService;
    }

    public List<BlogDto> getBlogs(String search, String tag, String category, String sort, int page, int limit) {
        StringBuilder query = new StringBuilder("blogs?published=eq.true&status=eq.PUBLISHED");

        if (category != null && !category.isBlank() && !"all".equalsIgnoreCase(category)) {
            query.append("&category=eq.").append(URLEncoder.encode(category.trim(), StandardCharsets.UTF_8));
        }

        if (tag != null && !tag.isBlank()) {
            query.append("&tags=cs.{\"").append(URLEncoder.encode(tag.trim(), StandardCharsets.UTF_8)).append("\"}");
        }

        if (search != null && !search.isBlank()) {
            String enc = URLEncoder.encode(search.trim(), StandardCharsets.UTF_8);
            query.append("&or=(title.ilike.*").append(enc).append("*,excerpt.ilike.*").append(enc).append("*)");
        }

        if ("trending".equalsIgnoreCase(sort)) {
            query.append("&order=claps_count.desc,views_count.desc");
        } else if ("views".equalsIgnoreCase(sort)) {
            query.append("&order=views_count.desc");
        } else {
            query.append("&order=published_at.desc.nullslast,created_at.desc");
        }

        int offset = Math.max(0, (page - 1) * limit);
        query.append("&limit=").append(limit).append("&offset=").append(offset);

        return supabaseClient.getList(query.toString(), new TypeReference<List<BlogDto>>() {});
    }

    public List<BlogDto> getFeaturedBlogs() {
        String query = "blogs?published=eq.true&status=eq.PUBLISHED&featured=eq.true&order=created_at.desc&limit=5";
        List<BlogDto> blogs = supabaseClient.getList(query, new TypeReference<List<BlogDto>>() {});
        if (blogs.isEmpty()) {
            // Fallback to top 5 stories if none marked featured
            return getBlogs(null, null, null, "trending", 1, 5);
        }
        return blogs;
    }

    public BlogDto getBlogBySlug(String slug) {
        String query = "blogs?slug=eq." + URLEncoder.encode(slug.trim(), StandardCharsets.UTF_8) + "&limit=1";
        List<BlogDto> blogs = supabaseClient.getList(query, new TypeReference<List<BlogDto>>() {});
        return blogs.isEmpty() ? null : blogs.get(0);
    }

    public BlogDto getBlogById(String id) {
        String query = "blogs?id=eq." + URLEncoder.encode(id.trim(), StandardCharsets.UTF_8) + "&limit=1";
        List<BlogDto> blogs = supabaseClient.getList(query, new TypeReference<List<BlogDto>>() {});
        return blogs.isEmpty() ? null : blogs.get(0);
    }

    public List<BlogDto> getBlogsByAuthor(String username, boolean includeDrafts, String currentUserId) {
        StringBuilder query = new StringBuilder("blogs?author_username=eq.")
                .append(URLEncoder.encode(username.trim(), StandardCharsets.UTF_8));

        if (!includeDrafts) {
            query.append("&published=eq.true&status=eq.PUBLISHED");
        }
        query.append("&order=created_at.desc");

        return supabaseClient.getList(query.toString(), new TypeReference<List<BlogDto>>() {});
    }

    public BlogDto createBlog(BlogRequest req, String userId) {
        UserDto author = authService.getUserById(userId);
        if (author == null) {
            throw new RuntimeException("Author user not found");
        }

        String blogId = UUID.randomUUID().toString();
        String slug = req.getSlug();
        if (slug == null || slug.isBlank()) {
            slug = generateSlug(req.getTitle());
        }
        slug = makeSlugUnique(slug);

        int readTime = calculateReadingTime(req.getContent());

        String now = Instant.now().toString();
        boolean isPublished = Boolean.TRUE.equals(req.getPublished());

        Map<String, Object> map = new HashMap<>();
        map.put("id", blogId);
        map.put("title", req.getTitle());
        map.put("slug", slug);
        map.put("excerpt", req.getExcerpt() != null ? req.getExcerpt() : extractExcerpt(req.getContent()));
        map.put("content", req.getContent());
        map.put("content_json", req.getContentJson());
        map.put("tags", req.getTags());
        map.put("read_time", req.getReadTime() != null ? req.getReadTime() : (readTime + " min read"));
        map.put("cover_image", req.getCoverImage());
        map.put("category", req.getCategory() != null ? req.getCategory() : "Engineering");
        map.put("published", isPublished);
        map.put("status", isPublished ? "PUBLISHED" : "DRAFT");
        map.put("featured", false);
        map.put("views_count", 0);
        map.put("claps_count", 0);
        map.put("author_id", author.getId());
        map.put("author_username", author.getUsername());
        map.put("author_name", author.getFullName());
        map.put("author_avatar", author.getAvatarUrl());
        map.put("author_bio", author.getBio());
        map.put("created_at", now);
        map.put("updated_at", now);
        if (isPublished) {
            map.put("published_at", now);
        }

        List<BlogDto> result = supabaseClient.post("blogs", map, new TypeReference<List<BlogDto>>() {});
        if (result.isEmpty()) {
            throw new RuntimeException("Failed to save article");
        }
        return result.get(0);
    }

    public BlogDto updateBlog(String id, BlogRequest req, String userId, boolean isAdmin) {
        BlogDto existing = getBlogById(id);
        if (existing == null) {
            throw new RuntimeException("Article not found: " + id);
        }

        if (!isAdmin && (existing.getAuthorId() == null || !existing.getAuthorId().equals(userId))) {
            throw new RuntimeException("Unauthorized: You do not own this article");
        }

        int readTime = calculateReadingTime(req.getContent());
        boolean isPublished = Boolean.TRUE.equals(req.getPublished());
        String now = Instant.now().toString();

        Map<String, Object> map = new HashMap<>();
        if (req.getTitle() != null) map.put("title", req.getTitle());
        if (req.getExcerpt() != null) map.put("excerpt", req.getExcerpt());
        if (req.getContent() != null) map.put("content", req.getContent());
        if (req.getContentJson() != null) map.put("content_json", req.getContentJson());
        if (req.getTags() != null) map.put("tags", req.getTags());
        if (req.getCoverImage() != null) map.put("cover_image", req.getCoverImage());
        if (req.getCategory() != null) map.put("category", req.getCategory());
        map.put("read_time", req.getReadTime() != null ? req.getReadTime() : (readTime + " min read"));
        map.put("published", isPublished);
        map.put("status", isPublished ? "PUBLISHED" : "DRAFT");
        map.put("updated_at", now);
        if (isPublished && existing.getPublishedAt() == null) {
            map.put("published_at", now);
        }

        String path = "blogs?id=eq." + URLEncoder.encode(id, StandardCharsets.UTF_8);
        List<BlogDto> result = supabaseClient.patch(path, map, new TypeReference<List<BlogDto>>() {});
        if (result.isEmpty()) {
            throw new RuntimeException("Failed to update article");
        }
        return result.get(0);
    }

    public boolean deleteBlog(String id, String userId, boolean isAdmin) {
        BlogDto existing = getBlogById(id);
        if (existing == null) return false;
        if (!isAdmin && (existing.getAuthorId() == null || !existing.getAuthorId().equals(userId))) {
            throw new RuntimeException("Unauthorized: You do not own this article");
        }

        String path = "blogs?id=eq." + URLEncoder.encode(id, StandardCharsets.UTF_8);
        return supabaseClient.delete(path);
    }

    public BlogDto incrementClaps(String id, int amount) {
        BlogDto existing = getBlogById(id);
        if (existing == null) return null;

        int newClaps = existing.getClapsCount() + Math.max(1, amount);
        Map<String, Object> map = Map.of("claps_count", newClaps);
        String path = "blogs?id=eq." + URLEncoder.encode(id, StandardCharsets.UTF_8);
        List<BlogDto> result = supabaseClient.patch(path, map, new TypeReference<List<BlogDto>>() {});
        return result.isEmpty() ? existing : result.get(0);
    }

    public void incrementViews(String id) {
        BlogDto existing = getBlogById(id);
        if (existing != null) {
            int newViews = existing.getViewsCount() + 1;
            Map<String, Object> map = Map.of("views_count", newViews);
            String path = "blogs?id=eq." + URLEncoder.encode(id, StandardCharsets.UTF_8);
            supabaseClient.patch(path, map, new TypeReference<List<BlogDto>>() {});
        }
    }

    private String generateSlug(String title) {
        if (title == null || title.isBlank()) return "story-" + System.currentTimeMillis();
        String normalized = Normalizer.normalize(title, Normalizer.Form.NFD);
        Pattern pattern = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");
        String slug = pattern.matcher(normalized).replaceAll("")
                .toLowerCase()
                .replaceAll("[^a-z0-9\\s-]", "")
                .replaceAll("\\s+", "-")
                .replaceAll("-+", "-")
                .replaceAll("^-|-$", "");
        return slug.isBlank() ? "story-" + System.currentTimeMillis() : slug;
    }

    private String makeSlugUnique(String baseSlug) {
        String slug = baseSlug;
        int counter = 1;
        while (getBlogBySlug(slug) != null) {
            slug = baseSlug + "-" + counter;
            counter++;
        }
        return slug;
    }

    private int calculateReadingTime(String html) {
        if (html == null || html.isBlank()) return 1;
        String text = html.replaceAll("<[^>]*>", " ");
        String[] words = text.trim().split("\\s+");
        int count = words.length;
        return Math.max(1, (int) Math.ceil(count / 200.0));
    }

    private String extractExcerpt(String html) {
        if (html == null || html.isBlank()) return "";
        String text = html.replaceAll("<[^>]*>", " ").replaceAll("\\s+", " ").trim();
        return text.length() > 220 ? text.substring(0, 217) + "..." : text;
    }
}
