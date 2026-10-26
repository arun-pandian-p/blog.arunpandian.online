package com.arunpandian.blog.dto.auth;

import com.arunpandian.blog.dto.blog.BlogDto;
import com.arunpandian.blog.entity.User;
import java.util.List;
import java.util.UUID;

public class UserProfileDto {
    private UUID id;
    private String username;
    private String fullName;
    private String bio;
    private String avatarUrl;
    private String website;
    private String github;
    private String twitter;
    private long articlesCount;
    private List<BlogDto> recentArticles;

    public UserProfileDto() {}

    public static UserProfileDto from(User user, long articlesCount, List<BlogDto> recentArticles) {
        if (user == null) return null;
        UserProfileDto dto = new UserProfileDto();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setFullName(user.getFullName());
        dto.setBio(user.getBio());
        dto.setAvatarUrl(user.getAvatarUrl());
        dto.setWebsite(user.getWebsite());
        dto.setGithub(user.getGithub());
        dto.setTwitter(user.getTwitter());
        dto.setArticlesCount(articlesCount);
        dto.setRecentArticles(recentArticles);
        return dto;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getBio() { return bio; }
    public void setBio(String bio) { this.bio = bio; }

    public String getAvatarUrl() { return avatarUrl; }
    public void setAvatarUrl(String avatarUrl) { this.avatarUrl = avatarUrl; }

    public String getWebsite() { return website; }
    public void setWebsite(String website) { this.website = website; }

    public String getGithub() { return github; }
    public void setGithub(String github) { this.github = github; }

    public String getTwitter() { return twitter; }
    public void setTwitter(String twitter) { this.twitter = twitter; }

    public long getArticlesCount() { return articlesCount; }
    public void setArticlesCount(long articlesCount) { this.articlesCount = articlesCount; }

    public List<BlogDto> getRecentArticles() { return recentArticles; }
    public void setRecentArticles(List<BlogDto> recentArticles) { this.recentArticles = recentArticles; }
}
