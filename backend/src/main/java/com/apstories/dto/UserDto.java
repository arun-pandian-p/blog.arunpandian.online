package com.apstories.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public class UserDto {
    private String id;

    @JsonProperty("supabase_uid")
    private String supabaseUid;

    private String email;
    private String username;

    @JsonProperty("full_name")
    private String fullName;

    @JsonProperty("password_hash")
    private String passwordHash;

    private String bio;

    @JsonProperty("avatar_url")
    private String avatarUrl;

    private String website;
    private String github;
    private String twitter;
    private String role;

    @JsonProperty("created_at")
    private String createdAt;

    public UserDto() {}

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getSupabaseUid() { return supabaseUid; }
    public void setSupabaseUid(String supabaseUid) { this.supabaseUid = supabaseUid; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getUsername() { return username; }
    public void setUsername(String username) { this.username = username; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }

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

    public String getRole() { return role != null ? role : "ROLE_USER"; }
    public void setRole(String role) { this.role = role; }

    public String getCreatedAt() { return createdAt; }
    public void setCreatedAt(String createdAt) { this.createdAt = createdAt; }
}

