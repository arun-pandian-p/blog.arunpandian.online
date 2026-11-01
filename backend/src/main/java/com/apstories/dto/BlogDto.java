package com.apstories.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;
import java.util.Map;

public class BlogDto {
    private String id;
    private String title;
    private String slug;
    private String excerpt;
    private String content;

    @JsonProperty("content_json")
    private Object contentJson;

    private Object tags;

    @JsonProperty("read_time")
    private Object readTime;

    @JsonProperty("cover_image")
    private String coverImage;

    @JsonProperty("author_id")
    private String authorId;

    @JsonProperty("author_username")
    private String authorUsername;

    @JsonProperty("author_name")
    private String authorName;

    @JsonProperty("author_avatar")
    private String authorAvatar;

    @JsonProperty("author_bio")
    private String authorBio;

    private String category;
    private Boolean published;
    private String status;
    private Boolean featured;

    @JsonProperty("views_count")
    private Integer viewsCount;

    @JsonProperty("claps_count")
    private Integer clapsCount;

    @JsonProperty("published_at")
    private String publishedAt;

    @JsonProperty("created_at")
    private String createdAt;

    @JsonProperty("updated_at")
    private String updatedAt;

    public BlogDto() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getSlug() { return slug; }
    public void setSlug(String slug) { this.slug = slug; }

    public String getExcerpt() { return excerpt; }
    public void setExcerpt(String excerpt) { this.excerpt = excerpt; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public Object getContentJson() { return contentJson; }
    public void setContentJson(Object contentJson) { this.contentJson = contentJson; }

    public Object getTags() { return tags; }
    public void setTags(Object tags) { this.tags = tags; }

    public Object getReadTime() { return readTime; }
    public void setReadTime(Object readTime) { this.readTime = readTime; }

    public String getCoverImage() { return coverImage; }
    public void setCoverImage(String coverImage) { this.coverImage = coverImage; }

    public String getAuthorId() { return authorId; }
    public void setAuthorId(String authorId) { this.authorId = authorId; }

    public String getAuthorUsername() { return authorUsername; }
    public void setAuthorUsername(String authorUsername) { this.authorUsername = authorUsername; }

    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }

    public String getAuthorAvatar() { return authorAvatar; }
    public void setAuthorAvatar(String authorAvatar) { this.authorAvatar = authorAvatar; }

    public String getAuthorBio() { return authorBio; }
    public void setAuthorBio(String authorBio) { this.authorBio = authorBio; }

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Boolean getPublished() { return published; }
    public void setPublished(Boolean published) { this.published = published; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Boolean getFeatured() { return featured; }
    public void setFeatured(Boolean featured) { this.featured = featured; }

    public Integer getViewsCount() { return viewsCount != null ? viewsCount : 0; }
    public void setViewsCount(Integer viewsCount) { this.viewsCount = viewsCount; }

    public Integer getClapsCount() { return clapsCount != null ? clapsCount : 0; }
    public void setClapsCount(Integer clapsCount) { this.clapsCount = clapsCount; }

    public String getPublishedAt() { return publishedAt; }
    public void setPublishedAt(String publishedAt) { this.publishedAt = publishedAt; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public String getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(String updatedAt) { this.updatedAt = updatedAt; }
}
