package com.arunpandian.blog.dto.blog;

import com.arunpandian.blog.entity.Blog;
import com.arunpandian.blog.entity.enums.BlogStatus;
import java.time.Instant;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

public class BlogDto {
    private UUID id;
    private String title;
    private String slug;
    private String excerpt;
    private String content;
    private String contentJson;
    private List<String> tags;
    private String readTime;
    private String coverImage;
    private String coverVideoUrl;
    private UUID authorId;
    private String authorUsername;
    private String authorName;
    private String authorAvatar;
    private String authorBio;
    private String category;
    private boolean published;
    private BlogStatus status;
    private boolean featured;
    private int sortOrder;
    private Instant publishedAt;
    private Instant scheduledAt;
    private int viewsCount;
    private int clapsCount;
    private Instant createdAt;
    private Instant updatedAt;

    public BlogDto() {}

    public static BlogDto from(Blog blog) {
        if (blog == null) return null;
        BlogDto dto = new BlogDto();
        dto.setId(blog.getId());
        dto.setTitle(blog.getTitle());
        dto.setSlug(blog.getSlug());
        dto.setExcerpt(blog.getExcerpt());
        dto.setContent(blog.getContent());
        dto.setContentJson(blog.getContentJson());
        if (blog.getTags() != null && !blog.getTags().isBlank()) {
            dto.setTags(Arrays.stream(blog.getTags().split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList()));
        } else {
            dto.setTags(Collections.emptyList());
        }
        dto.setReadTime(blog.getReadTime());
        dto.setCoverImage(blog.getCoverImage());
        dto.setCoverVideoUrl(blog.getCoverVideoUrl());
        dto.setAuthorId(blog.getAuthorId());
        dto.setAuthorUsername(blog.getAuthorUsername());
        dto.setAuthorName(blog.getAuthorName());
        dto.setAuthorAvatar(blog.getAuthorAvatar());
        dto.setAuthorBio(blog.getAuthorBio());
        dto.setCategory(blog.getCategory());
        dto.setPublished(blog.isPublished());
        dto.setStatus(blog.getStatus());
        dto.setFeatured(blog.isFeatured());
        dto.setSortOrder(blog.getSortOrder());
        dto.setPublishedAt(blog.getPublishedAt());
        dto.setScheduledAt(blog.getScheduledAt());
        dto.setViewsCount(blog.getViewsCount());
        dto.setClapsCount(blog.getClapsCount());
        dto.setCreatedAt(blog.getCreatedAt());
        dto.setUpdatedAt(blog.getUpdatedAt());
        return dto;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getExcerpt() { return excerpt; }
    public void setExcerpt(String excerpt) { this.excerpt = excerpt; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getContentJson() { return contentJson; }
    public void setContentJson(String contentJson) { this.contentJson = contentJson; }

    public List<String> getTags() { return tags; }
    public void setTags(List<String> tags) { this.tags = tags; }

    public String getReadTime() { return readTime; }
    public void setReadTime(String readTime) { this.readTime = readTime; }

    public String getCoverImage() { return coverImage; }
    public void setCoverImage(String coverImage) { this.coverImage = coverImage; }

    public String getCoverVideoUrl() { return coverVideoUrl; }
    public void setCoverVideoUrl(String coverVideoUrl) { this.coverVideoUrl = coverVideoUrl; }

    public UUID getAuthorId() { return authorId; }
    public void setAuthorId(UUID authorId) { this.authorId = authorId; }

    public String getAuthorUsername() { return authorUsername; }
    public void setAuthorUsername(String authorUsername) { this.authorUsername = authorUsername; }

    public String getAuthorBio() { return authorBio; }
    public void setAuthorBio(String authorBio) { this.authorBio = authorBio; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }

    public String getAuthorAvatar() { return authorAvatar; }
    public void setAuthorAvatar(String authorAvatar) { this.authorAvatar = authorAvatar; }

    public boolean isPublished() { return published; }
    public void setPublished(boolean published) { this.published = published; }

    public BlogStatus getStatus() { return status; }
    public void setStatus(BlogStatus status) { this.status = status; }

    public boolean isFeatured() { return featured; }
    public void setFeatured(boolean featured) { this.featured = featured; }

    public int getSortOrder() { return sortOrder; }
    public void setSortOrder(int sortOrder) { this.sortOrder = sortOrder; }

    public Instant getPublishedAt() { return publishedAt; }
    public void setPublishedAt(Instant publishedAt) { this.publishedAt = publishedAt; }

    public Instant getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(Instant scheduledAt) { this.scheduledAt = scheduledAt; }

    public int getViewsCount() { return viewsCount; }
    public void setViewsCount(int viewsCount) { this.viewsCount = viewsCount; }

    public int getClapsCount() { return clapsCount; }
    public void setClapsCount(int clapsCount) { this.clapsCount = clapsCount; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
