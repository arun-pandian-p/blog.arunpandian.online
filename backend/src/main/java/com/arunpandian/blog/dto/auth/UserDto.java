package com.arunpandian.blog.dto.auth;

import com.arunpandian.blog.entity.User;
import com.arunpandian.blog.entity.enums.Role;
import java.util.UUID;

public class UserDto {
    private UUID id;
    private String email;
    private String username;
    private String fullName;
    private String bio;
    private String avatarUrl;
    private String website;
    private String github;
    private String twitter;
    private Role role;

    public UserDto() {}

    public UserDto(UUID id, String email, String username, String fullName, String bio, String avatarUrl, String website, String github, String twitter, Role role) {
        this.id = id;
        this.email = email;
        this.username = username;
        this.fullName = fullName;
        this.bio = bio;
        this.avatarUrl = avatarUrl;
        this.website = website;
        this.github = github;
        this.twitter = twitter;
        this.role = role;
    }

    public static UserDto from(User user) {
        if (user == null) return null;
        return new UserDto(
                user.getId(),
                user.getEmail(),
                user.getUsername(),
                user.getFullName(),
                user.getBio(),
                user.getAvatarUrl(),
                user.getWebsite(),
                user.getGithub(),
                user.getTwitter(),
                user.getRole()
        );
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

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

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
}
