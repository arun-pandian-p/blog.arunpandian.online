package com.arunpandian.blog.dto.blog;

import com.arunpandian.blog.entity.enums.BlogStatus;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;

public class BlogCreateRequest {

    @NotBlank(message = "Title is required")
    @Size(max = 255, message = "Title cannot exceed 255 characters")
    private String title;

    private String slug; // Optional: auto-generated if blank

    private String excerpt;

    private String content;

    private String contentJson;

    @Size(max = 4, message = "A blog post can have at most four tags")
    private List<String> tags;

    private String readTime;

    private String coverImage;

    private String coverVideoUrl;

    private String authorName;

    private String authorAvatar;

    private String category;

    private boolean published = false;

    private BlogStatus status = BlogStatus.DRAFT;

    private boolean featured = false;

    private int sortOrder = 0;

    private Instant publishedAt;

    private Instant scheduledAt;

    public BlogCreateRequest() {}

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

    @com.fasterxml.jackson.annotation.JsonSetter
    public void setTags(Object rawTags) {
        if (rawTags instanceof List<?> list) {
            this.tags = list.stream().map(Object::toString).map(String::trim).filter(s -> !s.isEmpty()).toList();
        } else if (rawTags instanceof String str) {
            this.tags = java.util.Arrays.stream(str.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .toList();
        } else {
            this.tags = null;
        }
    }

    public String getReadTime() { return readTime; }
    public void setReadTime(String readTime) { this.readTime = readTime; }

    public String getCoverImage() { return coverImage; }
    public void setCoverImage(String coverImage) { this.coverImage = coverImage; }

    public String getCoverVideoUrl() { return coverVideoUrl; }
    public void setCoverVideoUrl(String coverVideoUrl) { this.coverVideoUrl = coverVideoUrl; }

    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }

    public String getAuthorAvatar() { return authorAvatar; }
    public void setAuthorAvatar(String authorAvatar) { this.authorAvatar = authorAvatar; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

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
}
