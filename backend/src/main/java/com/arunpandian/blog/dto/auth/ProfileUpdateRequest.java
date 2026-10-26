package com.arunpandian.blog.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class ProfileUpdateRequest {

    @NotBlank(message = "Full name cannot be empty")
    @Size(max = 100, message = "Full name cannot exceed 100 characters")
    private String fullName;

    @Size(max = 1000, message = "Bio cannot exceed 1000 characters")
    private String bio;

    private String avatarUrl;

    @Size(max = 500, message = "Website URL cannot exceed 500 characters")
    private String website;

    @Size(max = 255, message = "GitHub username cannot exceed 255 characters")
    private String github;

    @Size(max = 255, message = "Twitter username cannot exceed 255 characters")
    private String twitter;

    public ProfileUpdateRequest() {}

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
}
