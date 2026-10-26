package com.arunpandian.blog.service;

import com.arunpandian.blog.dto.auth.AuthResponse;
import com.arunpandian.blog.dto.auth.LoginRequest;
import com.arunpandian.blog.dto.auth.RegisterRequest;
import com.arunpandian.blog.dto.auth.UserDto;
import com.arunpandian.blog.entity.User;
import com.arunpandian.blog.entity.enums.Role;
import com.arunpandian.blog.exception.BadRequestException;
import com.arunpandian.blog.exception.ResourceNotFoundException;
import com.arunpandian.blog.repository.UserRepository;
import com.arunpandian.blog.security.JwtUtils;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;
import java.util.UUID;

@Service
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final JwtUtils jwtUtils;
    private final PasswordEncoder passwordEncoder;
    private final SupabaseClientService supabaseClientService;

    public AuthService(
            AuthenticationManager authenticationManager,
            UserRepository userRepository,
            JwtUtils jwtUtils,
            PasswordEncoder passwordEncoder,
            SupabaseClientService supabaseClientService) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.jwtUtils = jwtUtils;
        this.passwordEncoder = passwordEncoder;
        this.supabaseClientService = supabaseClientService;
    }

    /**
     * Generates a URL-safe, lowercase, deterministic unique username.
     * E.g. "Arun Pandian" -> "arun-pandian", duplicates -> "arun-pandian-1", "arun-pandian-2"
     */
    public String generateUniqueUsername(String preferredUsername, String fullName, String email) {
        String base = preferredUsername;
        if (base == null || base.isBlank()) {
            base = fullName;
        }
        if (base == null || base.isBlank()) {
            base = (email != null && email.contains("@")) ? email.split("@")[0] : "user";
        }

        // Normalize to URL-safe slug: lower case, replace non-alphanumeric with hyphen
        String slug = base.toLowerCase()
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("^-+|-+$", "");

        if (slug.isBlank()) {
            slug = "user";
        }

        String candidate = slug;
        int suffix = 1;
        while (userRepository.existsByUsername(candidate)) {
            candidate = slug + "-" + suffix;
            suffix++;
        }
        return candidate;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();

        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email is already registered: " + email);
        }

        // Generate deterministic, unique, URL-safe slug for username
        String username = generateUniqueUsername(request.getUsername(), request.getFullName(), email);

        // Provision user in Supabase Auth Admin API if configured
        Optional<String> supabaseUidOpt = supabaseClientService.createUserAdmin(
                email,
                request.getPassword(),
                request.getFullName().trim(),
                username
        );

        User user = new User();
        if (supabaseUidOpt.isPresent()) {
            try {
                user.setId(UUID.fromString(supabaseUidOpt.get()));
            } catch (IllegalArgumentException ignored) {}
            user.setSupabaseUid(supabaseUidOpt.get());
        }

        user.setEmail(email);
        user.setUsername(username);
        user.setFullName(request.getFullName().trim());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        // Enforce standard USER role: never allow users to assign themselves privileged roles
        user.setRole(Role.ROLE_USER);

        User saved = userRepository.save(user);

        // Authenticate with Supabase GoTrue or generate token
        String token;
        Optional<SupabaseClientService.SupabaseAuthResult> authResult =
                supabaseClientService.signInWithPassword(email, request.getPassword());

        if (authResult.isPresent()) {
            token = authResult.get().accessToken();
        } else {
            token = jwtUtils.generateToken(saved.getEmail(), saved.getRole().name());
        }

        log.info("Registered user: {} (@{}) associated with Supabase ID: {}",
                saved.getEmail(), saved.getUsername(), saved.getSupabaseUid());

        return new AuthResponse(token, UserDto.from(saved));
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        String identifier = request.getEmail().trim();
        String email = identifier;

        // If user logged in using their username, resolve to their email
        Optional<User> existingUser = userRepository.findByEmailOrUsername(identifier);
        if (existingUser.isPresent()) {
            email = existingUser.get().getEmail();
        }

        // 1. Try Supabase Auth if configured
        Optional<SupabaseClientService.SupabaseAuthResult> supabaseAuth =
                supabaseClientService.signInWithPassword(email, request.getPassword());

        if (supabaseAuth.isPresent()) {
            SupabaseClientService.SupabaseAuthResult auth = supabaseAuth.get();
            User user = syncOrProvisionSupabaseUser(auth.userId(), email, null, null);
            return new AuthResponse(auth.accessToken(), UserDto.from(user));
        }

        // 2. Fallback to Spring Security local authentication
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(identifier, request.getPassword())
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByEmailOrUsername(identifier)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with identifier: " + identifier));

        String token = jwtUtils.generateToken(user.getEmail(), user.getRole().name());
        return new AuthResponse(token, UserDto.from(user));
    }

    /**
     * Synchronizes or provisions a user profile when authenticated via Supabase.
     */
    @Transactional
    public User syncOrProvisionSupabaseUser(String supabaseUid, String email, String fullName, String preferredUsername) {
        // Try by Supabase UID
        if (supabaseUid != null && !supabaseUid.isBlank()) {
            try {
                UUID uuid = UUID.fromString(supabaseUid);
                Optional<User> byUid = userRepository.findBySupabaseUid(uuid);
                if (byUid.isPresent()) return byUid.get();

                Optional<User> byId = userRepository.findById(uuid);
                if (byId.isPresent()) return byId.get();
            } catch (IllegalArgumentException ignored) {}
        }

        // Try by email
        if (email != null && !email.isBlank()) {
            Optional<User> byEmail = userRepository.findByEmail(email.toLowerCase());
            if (byEmail.isPresent()) {
                User user = byEmail.get();
                if (user.getSupabaseUid() == null && supabaseUid != null) {
                    user.setSupabaseUid(supabaseUid);
                    user = userRepository.save(user);
                }
                return user;
            }
        }

        // Auto-provision user profile
        User newUser = new User();
        if (supabaseUid != null) {
            try {
                newUser.setId(UUID.fromString(supabaseUid));
            } catch (IllegalArgumentException ignored) {}
            newUser.setSupabaseUid(supabaseUid);
        }

        String safeEmail = email != null ? email.toLowerCase() : "user-" + UUID.randomUUID() + "@example.com";
        String safeName = fullName != null && !fullName.isBlank() ? fullName : "Reader";
        String username = generateUniqueUsername(preferredUsername, safeName, safeEmail);

        newUser.setEmail(safeEmail);
        newUser.setFullName(safeName);
        newUser.setUsername(username);
        newUser.setRole(Role.ROLE_USER);

        User saved = userRepository.save(newUser);
        log.info("Auto-provisioned user profile for Supabase user: {} (@{})", saved.getEmail(), saved.getUsername());
        return saved;
    }

    private Optional<User> findUserByIdentifier(String identifier) {
        if (identifier == null || identifier.isBlank()) return Optional.empty();
        Optional<User> byEmailOrUsername = userRepository.findByEmailOrUsername(identifier);
        if (byEmailOrUsername.isPresent()) return byEmailOrUsername;

        try {
            UUID uuid = UUID.fromString(identifier);
            Optional<User> byUid = userRepository.findBySupabaseUid(uuid);
            if (byUid.isPresent()) return byUid;
            return userRepository.findById(uuid);
        } catch (IllegalArgumentException e) {
            return Optional.empty();
        }
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUser(String identifier) {
        User user = findUserByIdentifier(identifier)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with identifier: " + identifier));

        return UserDto.from(user);
    }

    @Transactional(readOnly = true)
    public User getCurrentUserEntity() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()) {
            throw new BadRequestException("No authenticated user found in context");
        }
        String identifier = authentication.getName();
        return findUserByIdentifier(identifier)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with identifier: " + identifier));
    }
}
