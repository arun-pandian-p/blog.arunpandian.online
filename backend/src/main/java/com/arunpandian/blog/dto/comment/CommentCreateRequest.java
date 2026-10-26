package com.arunpandian.blog.dto.comment;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.util.UUID;

public class CommentCreateRequest {

    private UUID blogId;
    private UUID projectId;
    private String targetSlug;

    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name cannot exceed 100 characters")
    private String authorName;

    @Email(message = "Must be a valid email address")
    private String authorEmail;

    private String authorDomain;

    @NotBlank(message = "Comment content cannot be empty")
    @Size(max = 2000, message = "Comment cannot exceed 2000 characters")
    private String content;

    public CommentCreateRequest() {}

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
}
