package com.apstories.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class BlogRequest {
    @NotBlank(message = "Title is required")
    private String title;

    private String slug;
    private String excerpt;

    @NotBlank(message = "Content is required")
    private String content;

    @JsonProperty("content_json")
    private Object contentJson;

    private Object tags;

    @JsonProperty("read_time")
    private Object readTime;

    @JsonProperty("cover_image")
    private String coverImage;

    private String category;
    private Boolean published;
    private String status;

    public BlogRequest() {}

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

    public String getCategory() { return category; }
    public void setCategory(String category) { this.category = category; }

    public Boolean getPublished() { return published != null ? published : false; }
    public void setPublished(Boolean published) { this.published = published; }

    public String getStatus() { return status != null ? status : (Boolean.TRUE.equals(published) ? "PUBLISHED" : "DRAFT"); }
    public void setStatus(String status) { this.status = status; }
}
