package com.arunpandian.blog.service;

import com.arunpandian.blog.dto.auth.PasswordUpdateRequest;
import com.arunpandian.blog.dto.auth.ProfileUpdateRequest;
import com.arunpandian.blog.dto.auth.UserDto;
import com.arunpandian.blog.dto.auth.UserProfileDto;
import com.arunpandian.blog.dto.blog.BlogDto;
import com.arunpandian.blog.entity.Blog;
import com.arunpandian.blog.entity.User;
import com.arunpandian.blog.exception.BadRequestException;
import com.arunpandian.blog.exception.ResourceNotFoundException;
import com.arunpandian.blog.repository.BlogRepository;
import com.arunpandian.blog.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final BlogRepository blogRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, BlogRepository blogRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.blogRepository = blogRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional(readOnly = true)
    public UserProfileDto getPublicProfile(String username) {
        User user = userRepository.findByUsername(username.toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("User", "username", username));

        Page<Blog> articlesPage = blogRepository.findPublicPublishedByAuthor(
                user.getUsername(),
                Instant.now(),
                PageRequest.of(0, 10, Sort.by("publishedAt").descending())
        );

        List<BlogDto> recentArticles = articlesPage.getContent().stream()
                .map(BlogDto::from)
                .toList();

        return UserProfileDto.from(user, articlesPage.getTotalElements(), recentArticles);
    }

    @Transactional
    public UserDto updateProfile(User currentUser, ProfileUpdateRequest req) {
        currentUser.setFullName(req.getFullName().trim());
        if (req.getBio() != null) {
            currentUser.setBio(req.getBio().trim());
        }
        if (req.getAvatarUrl() != null) {
            currentUser.setAvatarUrl(req.getAvatarUrl().trim());
        }
        if (req.getWebsite() != null) {
            currentUser.setWebsite(req.getWebsite().trim());
        }
        if (req.getGithub() != null) {
            currentUser.setGithub(req.getGithub().trim());
        }
        if (req.getTwitter() != null) {
            currentUser.setTwitter(req.getTwitter().trim());
        }

        User saved = userRepository.save(currentUser);
        return UserDto.from(saved);
    }

    @Transactional
    public void updatePassword(User currentUser, PasswordUpdateRequest req) {
        if (!passwordEncoder.matches(req.getCurrentPassword(), currentUser.getPasswordHash())) {
            throw new BadRequestException("Current password does not match");
        }
        currentUser.setPasswordHash(passwordEncoder.encode(req.getNewPassword()));
        userRepository.save(currentUser);
    }
}
