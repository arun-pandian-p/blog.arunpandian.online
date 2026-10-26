package com.arunpandian.blog.controller;

import com.arunpandian.blog.dto.auth.AuthResponse;
import com.arunpandian.blog.dto.auth.LoginRequest;
import com.arunpandian.blog.dto.auth.UserDto;
import com.arunpandian.blog.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody com.arunpandian.blog.dto.auth.RegisterRequest request) {
        AuthResponse response = authService.register(request);
        return ResponseEntity.status(org.springframework.http.HttpStatus.CREATED).body(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<java.util.Map<String, String>> logout() {
        return ResponseEntity.ok(java.util.Map.of("message", "Logged out successfully"));
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(401).build();
        }
        UserDto user = authService.getCurrentUser(authentication.getName());
        return ResponseEntity.ok(user);
    }
}
