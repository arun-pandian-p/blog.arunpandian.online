package com.arunpandian.blog.dto.blog;

import com.arunpandian.blog.entity.Blog;
import com.arunpandian.blog.entity.Bookmark;
import java.time.Instant;
import java.util.UUID;

public class BookmarkDto {
    private UUID id;
    private UUID blogId;
    private String blogTitle;
    private String blogSlug;
    private String blogExcerpt;
    private String coverImage;
    private String authorName;
    private String authorAvatar;
    private String readTime;
    private Instant bookmarkedAt;

    public BookmarkDto() {}

    public static BookmarkDto from(Bookmark bookmark, Blog blog) {
        BookmarkDto dto = new BookmarkDto();
        dto.setId(bookmark.getId());
        dto.setBlogId(bookmark.getBlogId());
        dto.setBookmarkedAt(bookmark.getCreatedAt());

        if (blog != null) {
            dto.setBlogTitle(blog.getTitle());
            dto.setBlogSlug(blog.getSlug());
            dto.setBlogExcerpt(blog.getExcerpt());
            dto.setCoverImage(blog.getCoverImage());
            dto.setAuthorName(blog.getAuthorName());
            dto.setAuthorAvatar(blog.getAuthorAvatar());
            dto.setReadTime(blog.getReadTime());
        }

        return dto;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public UUID getBlogId() { return blogId; }
    public void setBlogId(UUID blogId) { this.blogId = blogId; }

    public String getBlogTitle() { return blogTitle; }
    public void setBlogTitle(String blogTitle) { this.blogTitle = blogTitle; }

    public String getBlogSlug() { return blogSlug; }
    public void setBlogSlug(String blogSlug) { this.blogSlug = blogSlug; }

    public String getBlogExcerpt() { return blogExcerpt; }
    public void setBlogExcerpt(String blogExcerpt) { this.blogExcerpt = blogExcerpt; }

    public String getCoverImage() { return coverImage; }
    public void setCoverImage(String coverImage) { this.coverImage = coverImage; }

    public String getAuthorName() { return authorName; }
    public void setAuthorName(String authorName) { this.authorName = authorName; }

    public String getAuthorAvatar() { return authorAvatar; }
    public void setAuthorAvatar(String authorAvatar) { this.authorAvatar = authorAvatar; }

    public String getReadTime() { return readTime; }
    public void setReadTime(String readTime) { this.readTime = readTime; }

    public Instant getBookmarkedAt() { return bookmarkedAt; }
    public void setBookmarkedAt(Instant bookmarkedAt) { this.bookmarkedAt = bookmarkedAt; }
}
