package com.arunpandian.blog.entity;

import com.arunpandian.blog.entity.enums.CommentStatus;
import jakarta.persistence.*;
import java.time.Instant;
import java.util.UUID;

@Entity
@Table(name = "comments")
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "blog_id")
    private UUID blogId;

    @Column(name = "project_id")
    private UUID projectId;

    @Column(name = "target_slug")
    private String targetSlug;

    @Column(name = "author_name", nullable = false, length = 100)
    private String authorName;

    @Column(name = "author_email")
    private String authorEmail;

    @Column(name = "author_domain")
    private String authorDomain;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CommentStatus status = CommentStatus.APPROVED;

    @Column(nullable = false)
    private int likes = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private Instant createdAt = Instant.now();

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt = Instant.now();

    public Comment() {}

    @PreUpdate
    public void preUpdate() {
        this.updatedAt = Instant.now();
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

    public Instant getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(Instant updatedAt) { this.updatedAt = updatedAt; }
}
