package com.arunpandian.blog.controller;

import com.arunpandian.blog.dto.auth.PasswordUpdateRequest;
import com.arunpandian.blog.dto.auth.ProfileUpdateRequest;
import com.arunpandian.blog.dto.auth.UserDto;
import com.arunpandian.blog.dto.auth.UserProfileDto;
import com.arunpandian.blog.entity.User;
import com.arunpandian.blog.service.AuthService;
import com.arunpandian.blog.service.UserService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final AuthService authService;

    public UserController(UserService userService, AuthService authService) {
        this.userService = userService;
        this.authService = authService;
    }

    @GetMapping("/{username}")
    public ResponseEntity<UserProfileDto> getPublicProfile(@PathVariable String username) {
        return ResponseEntity.ok(userService.getPublicProfile(username));
    }

    @PutMapping("/profile")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<UserDto> updateProfile(@Valid @RequestBody ProfileUpdateRequest request) {
        User currentUser = authService.getCurrentUserEntity();
        return ResponseEntity.ok(userService.updateProfile(currentUser, request));
    }

    @PutMapping("/password")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Map<String, String>> updatePassword(@Valid @RequestBody PasswordUpdateRequest request) {
        User currentUser = authService.getCurrentUserEntity();
        userService.updatePassword(currentUser, request);
        return ResponseEntity.ok(Map.of("message", "Password updated successfully"));
    }
}
