package com.arunpandian.blog.dto.blog;

import com.arunpandian.blog.entity.enums.BlogStatus;
import jakarta.validation.constraints.Size;

import java.time.Instant;
import java.util.List;

public class BlogUpdateRequest {

    @Size(max = 255, message = "Title cannot exceed 255 characters")
    private String title;

    private String slug;

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

    private Boolean published;

    private BlogStatus status;

    private Boolean featured;

    private Integer sortOrder;

    private Instant publishedAt;

    private Instant scheduledAt;

    public BlogUpdateRequest() {}

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

    public Boolean getPublished() { return published; }
    public void setPublished(Boolean published) { this.published = published; }

    public BlogStatus getStatus() { return status; }
    public void setStatus(BlogStatus status) { this.status = status; }

    public Boolean getFeatured() { return featured; }
    public void setFeatured(Boolean featured) { this.featured = featured; }

    public Integer getSortOrder() { return sortOrder; }
    public void setSortOrder(Integer sortOrder) { this.sortOrder = sortOrder; }

    public Instant getPublishedAt() { return publishedAt; }
    public void setPublishedAt(Instant publishedAt) { this.publishedAt = publishedAt; }

    public Instant getScheduledAt() { return scheduledAt; }
    public void setScheduledAt(Instant scheduledAt) { this.scheduledAt = scheduledAt; }
}
