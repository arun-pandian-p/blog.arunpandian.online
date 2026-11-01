package com.apstories.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class BookmarkDto {
    private String id;

    @JsonProperty("user_id")
    private String userId;

    @JsonProperty("blog_id")
    private String blogId;

    @JsonProperty("created_at")
    private String createdAt;

    private BlogDto blog;

    public BookmarkDto() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getUserId() { return userId; }
    public void setUserId(String userId) { this.userId = userId; }

    public String getBlogId() { return blogId; }
    public void setBlogId(String blogId) { this.blogId = blogId; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public BlogDto getBlog() { return blog; }
    public void setBlog(BlogDto blog) { this.blog = blog; }
}

