package com.arunpandian.blog.dto.comment;

import com.arunpandian.blog.entity.Comment;
import com.arunpandian.blog.entity.enums.CommentStatus;
import java.time.Instant;
import java.util.UUID;

public class CommentDto {
    private UUID id;
    private UUID blogId;
    private UUID projectId;
    private String targetSlug;
    private String authorName;
    private String authorEmail;
    private String authorDomain;
    private String content;
    private CommentStatus status;
    private int likes;
    private Instant createdAt;

    public CommentDto() {}

    public static CommentDto from(Comment comment) {
        if (comment == null) return null;
        CommentDto dto = new CommentDto();
        dto.setId(comment.getId());
        dto.setBlogId(comment.getBlogId());
        dto.setProjectId(comment.getProjectId());
        dto.setTargetSlug(comment.getTargetSlug());
        dto.setAuthorName(comment.getAuthorName());
        dto.setAuthorEmail(comment.getAuthorEmail());
        dto.setAuthorDomain(comment.getAuthorDomain());
        dto.setContent(comment.getContent());
        dto.setStatus(comment.getStatus());
        dto.setLikes(comment.getLikes());
        dto.setCreatedAt(comment.getCreatedAt());
        return dto;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getBlogId() { return blogId; }
    public void setBlogId(UUID blogId) { this.blogId = blogId; }

    public UUID getProjectId() { return projectId; }
    public void setProjectId(UUID projectId) { this.projectId = projectId; }

    public String getTargetSlug() { return targetSlug; }
    public void setTargetSlug(String targetSlug) { this.targetSlug = targetSlug; }

    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }

    public String getAuthorEmail() { return authorEmail; }
    public void setAuthorEmail(String authorEmail) { this.authorEmail = authorEmail; }

    public String getAuthorDomain() { return authorDomain; }
    public void setAuthorDomain(String authorDomain) { this.authorDomain = authorDomain; }

    public String getContent() { return content; }
    public void setContent(String content) { this.content = content; }

    public CommentStatus getStatus() { return status; }
    public void setStatus(CommentStatus status) { this.status = status; }

    public int getLikes() { return likes; }
    public void setLikes(int likes) { this.likes = likes; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
