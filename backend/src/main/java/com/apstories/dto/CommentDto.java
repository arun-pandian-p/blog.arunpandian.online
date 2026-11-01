package com.apstories.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.ArrayList;
import java.util.List;

public class CommentDto {
    private String id;

    @JsonProperty("blog_id")
    private String blogId;

    @JsonProperty("target_slug")
    private String targetSlug;

    @JsonProperty("author_id")
    private String authorId;

    @JsonProperty("author_name")
    private String authorName;

    @JsonProperty("author_email")
    private String authorEmail;

    @JsonProperty("author_avatar")
    private String authorAvatar;

    private String content;
    private String status;
    private Integer likes;

    @JsonProperty("parent_id")
    private String parentId;

    @JsonProperty("created_at")
    private String createdAt;

    private List<CommentDto> replies = new ArrayList<>();

    public CommentDto() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getBlogId() { return blogId; }
    public void setBlogId(String blogId) { this.blogId = blogId; }

    public String getTargetSlug() { return targetSlug; }
    public void setTargetSlug(String targetSlug) { this.targetSlug = targetSlug; }

    public String getAuthorId() { return authorId; }
    public void setAuthorId(String authorId) { this.authorId = authorId; }

    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }

    public String getAuthorEmail() { return authorEmail; }
    public void setAuthorEmail(String authorEmail) { this.authorEmail = authorEmail; }

    public String getAuthorAvatar() { return authorAvatar; }
    public void setAuthorAvatar(String authorAvatar) { this.authorAvatar = authorAvatar; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public Integer getLikes() { return likes != null ? likes : 0; }
    public void setLikes(Integer likes) { this.likes = likes; }

    public String getParentId() { return parentId; }
    public void setParentId(String parentId) { this.parentId = parentId; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }

    public List<CommentDto> getReplies() { return replies; }
    public void setReplies(List<CommentDto> replies) { this.replies = replies; }
}

