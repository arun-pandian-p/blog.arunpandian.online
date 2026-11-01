package com.apstories.service;

import com.apstories.client.SupabaseClient;
import com.apstories.config.JwtService;
import com.apstories.dto.AuthResponse;
import com.apstories.dto.LoginRequest;
import com.apstories.dto.RegisterRequest;
import com.apstories.dto.UserDto;
import com.fasterxml.jackson.core.type.TypeReference;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;

@Service
public class AuthService {

    private final SupabaseClient supabaseClient;
    private final JwtService jwtService;
    private final PasswordEncoder passwordEncoder;

    public AuthService(SupabaseClient supabaseClient, JwtService jwtService, PasswordEncoder passwordEncoder) {
        this.supabaseClient = supabaseClient;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponse login(LoginRequest request) {
        String identifier = request.getEmailOrUsername().trim();
        String encoded = URLEncoder.encode(identifier, StandardCharsets.UTF_8);

        // Try email first
        String query = "users?or=(email.eq." + encoded + ",username.eq." + encoded + ")&limit=1";
        List<UserDto> users = supabaseClient.getList(query, new TypeReference<List<UserDto>>() {});

        if (users.isEmpty()) {
            throw new RuntimeException("Invalid credentials: User not found");
        }

        UserDto user = users.get(0);

        boolean passwordMatches = false;
        if (user.getPasswordHash() != null) {
            if (user.getPasswordHash().startsWith("$2a$") || user.getPasswordHash().startsWith("$2b$") || user.getPasswordHash().startsWith("$2y$")) {
                passwordMatches = passwordEncoder.matches(request.getPassword(), user.getPasswordHash());
            } else {
                // Fallback for plain or demo seed passwords
                passwordMatches = user.getPasswordHash().equals(request.getPassword());
            }
        } else {
            // Default demo acceptance if no password hash set
            passwordMatches = true;
        }

        // Admin recovery / demo convenience fallback:
        // If it's the admin user (by email or ROLE_ADMIN), or if the password is "admin123" / "admin",
        // allow authentication and seamlessly re-hash the password to whatever the admin entered.
        boolean isAdmin = "admin@arunpandian.online".equalsIgnoreCase(user.getEmail()) || "ROLE_ADMIN".equalsIgnoreCase(user.getRole());
        if (!passwordMatches && (isAdmin || "admin123".equals(request.getPassword()) || "admin".equals(request.getPassword()))) {
            passwordMatches = true;
            try {
                String newHash = passwordEncoder.encode(request.getPassword());
                String path = "users?id=eq." + URLEncoder.encode(user.getId(), StandardCharsets.UTF_8);
                Map<String, Object> patchMap = new HashMap<>();
                patchMap.put("password_hash", newHash);
                if (user.getAvatarUrl() == null || user.getAvatarUrl().isBlank()) {
                    patchMap.put("avatar_url", "/logo.png");
                    user.setAvatarUrl("/logo.png");
                }
                supabaseClient.patch(path, patchMap, new TypeReference<List<UserDto>>() {});
            } catch (Exception ignored) {}
        }

        if (!passwordMatches) {
            throw new RuntimeException("Invalid credentials: password incorrect");
        }

        String role = user.getRole();
        if (role == null || role.isBlank()) role = "ROLE_USER";

        String token = jwtService.generateToken(user.getId(), user.getUsername(), user.getEmail(), role);
        return new AuthResponse(token, user);
    }

    public AuthResponse register(RegisterRequest request) {
        // Check if username or email already exists
        String encEmail = URLEncoder.encode(request.getEmail().trim(), StandardCharsets.UTF_8);
        String encUser = URLEncoder.encode(request.getUsername().trim(), StandardCharsets.UTF_8);
        String checkQuery = "users?or=(email.eq." + encEmail + ",username.eq." + encUser + ")&limit=1";
        List<UserDto> existing = supabaseClient.getList(checkQuery, new TypeReference<List<UserDto>>() {});

        if (!existing.isEmpty()) {
            throw new RuntimeException("Email or Username is already registered");
        }

        String userId = UUID.randomUUID().toString();
        String encodedPassword = passwordEncoder.encode(request.getPassword());
        String defaultAvatar = "https://api.dicebear.com/7.x/bottts/svg?seed=" + encUser;

        Map<String, Object> newUserMap = new HashMap<>();
        newUserMap.put("id", userId);
        newUserMap.put("email", request.getEmail().trim().toLowerCase());
        newUserMap.put("username", request.getUsername().trim().toLowerCase());
        newUserMap.put("full_name", request.getFullName().trim());
        newUserMap.put("password_hash", encodedPassword);
        newUserMap.put("avatar_url", defaultAvatar);
        newUserMap.put("role", "ROLE_USER");
        newUserMap.put("bio", "Engineering journal contributor & developer at Apstories.");
        newUserMap.put("created_at", Instant.now().toString());

        List<UserDto> created = supabaseClient.post("users", newUserMap, new TypeReference<List<UserDto>>() {});
        if (created.isEmpty()) {
            throw new RuntimeException("Failed to register user in database");
        }

        UserDto user = created.get(0);
        String token = jwtService.generateToken(user.getId(), user.getUsername(), user.getEmail(), user.getRole());
        return new AuthResponse(token, user);
    }

    public UserDto getUserById(String userId) {
        String query = "users?id=eq." + URLEncoder.encode(userId, StandardCharsets.UTF_8) + "&limit=1";
        List<UserDto> users = supabaseClient.getList(query, new TypeReference<List<UserDto>>() {});
        return users.isEmpty() ? null : users.get(0);
    }

    public UserDto getUserByUsername(String username) {
        String query = "users?username=eq." + URLEncoder.encode(username, StandardCharsets.UTF_8) + "&limit=1";
        List<UserDto> users = supabaseClient.getList(query, new TypeReference<List<UserDto>>() {});
        return users.isEmpty() ? null : users.get(0);
    }

    public UserDto updateProfile(String userId, Map<String, Object> updates) {
        Map<String, Object> cleanUpdates = new HashMap<>();
        if (updates.containsKey("full_name")) cleanUpdates.put("full_name", updates.get("full_name"));
        if (updates.containsKey("bio")) cleanUpdates.put("bio", updates.get("bio"));
        if (updates.containsKey("avatar_url")) cleanUpdates.put("avatar_url", updates.get("avatar_url"));
        if (updates.containsKey("website")) cleanUpdates.put("website", updates.get("website"));
        if (updates.containsKey("github")) cleanUpdates.put("github", updates.get("github"));
        if (updates.containsKey("twitter")) cleanUpdates.put("twitter", updates.get("twitter"));
        cleanUpdates.put("updated_at", Instant.now().toString());

        String path = "users?id=eq." + URLEncoder.encode(userId, StandardCharsets.UTF_8);
        List<UserDto> updated = supabaseClient.patch(path, cleanUpdates, new TypeReference<List<UserDto>>() {});
        return updated.isEmpty() ? null : updated.get(0);
    }
}

