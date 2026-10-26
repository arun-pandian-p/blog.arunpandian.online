package com.arunpandian.blog.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.Map;
import java.util.Optional;

@Service
public class SupabaseClientService {

    private static final Logger log = LoggerFactory.getLogger(SupabaseClientService.class);

    private final String supabaseUrl;
    private final String publishableKey;
    private final String serviceRoleKey;
    private final HttpClient httpClient;
    private final ObjectMapper objectMapper;

    public SupabaseClientService(
            @Value("${app.supabase.url:}") String supabaseUrl,
            @Value("${app.supabase.publishable-key:}") String publishableKey,
            @Value("${app.supabase.service-role-key:}") String serviceRoleKey) {
        this.supabaseUrl = cleanUrl(supabaseUrl);
        this.publishableKey = publishableKey != null ? publishableKey.trim() : "";
        this.serviceRoleKey = serviceRoleKey != null ? serviceRoleKey.trim() : "";
        this.httpClient = HttpClient.newBuilder()
                .connectTimeout(Duration.ofSeconds(10))
                .build();
        this.objectMapper = new ObjectMapper();
    }

    private String cleanUrl(String url) {
        if (url == null || url.isBlank()) return "";
        String trimmed = url.trim();
        return trimmed.endsWith("/") ? trimmed.substring(0, trimmed.length() - 1) : trimmed;
    }

    public boolean isConfigured() {
        return !supabaseUrl.isBlank() && (!publishableKey.isBlank() || !serviceRoleKey.isBlank());
    }

    public boolean hasAdminPrivileges() {
        return !supabaseUrl.isBlank() && !serviceRoleKey.isBlank();
    }

    /**
     * Creates a user using the Supabase Auth Admin API with email automatically confirmed.
     * Privileged operation using the backend service-role key.
     */
    public Optional<String> createUserAdmin(String email, String password, String fullName, String username) {
        if (!hasAdminPrivileges()) {
            return Optional.empty();
        }

        try {
            Map<String, Object> payload = Map.of(
                    "email", email,
                    "password", password,
                    "email_confirm", true,
                    "user_metadata", Map.of(
                            "full_name", fullName,
                            "username", username
                    )
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(supabaseUrl + "/auth/v1/admin/users"))
                    .timeout(Duration.ofSeconds(15))
                    .header("Content-Type", "application/json")
                    .header("apikey", serviceRoleKey)
                    .header("Authorization", "Bearer " + serviceRoleKey)
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                JsonNode root = objectMapper.readTree(response.body());
                String id = root.path("id").asText();
                if (!id.isBlank()) {
                    log.info("Supabase Admin user created successfully: {}", id);
                    return Optional.of(id);
                }
            } else {
                log.warn("Supabase Admin createUser response code {}: {}", response.statusCode(), response.body());
            }
        } catch (Exception e) {
            log.error("Failed to create user via Supabase Admin API: {}", e.getMessage());
        }
        return Optional.empty();
    }

    /**
     * Authenticates with Supabase Auth GoTrue endpoint.
     */
    public Optional<SupabaseAuthResult> signInWithPassword(String email, String password) {
        if (!isConfigured()) {
            return Optional.empty();
        }

        String apiKey = !publishableKey.isBlank() ? publishableKey : serviceRoleKey;

        try {
            Map<String, String> payload = Map.of(
                    "email", email,
                    "password", password
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(supabaseUrl + "/auth/v1/token?grant_type=password"))
                    .timeout(Duration.ofSeconds(15))
                    .header("Content-Type", "application/json")
                    .header("apikey", apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                JsonNode root = objectMapper.readTree(response.body());
                String accessToken = root.path("access_token").asText();
                String refreshToken = root.path("refresh_token").asText();
                String userId = root.path("user").path("id").asText();
                return Optional.of(new SupabaseAuthResult(accessToken, refreshToken, userId));
            } else {
                log.debug("Supabase signInWithPassword returned {}: {}", response.statusCode(), response.body());
            }
        } catch (Exception e) {
            log.warn("Supabase signInWithPassword failed: {}", e.getMessage());
        }
        return Optional.empty();
    }

    /**
     * Sends password recovery email via Supabase.
     */
    public boolean sendPasswordReset(String email, String redirectTo) {
        if (!isConfigured()) return false;
        String apiKey = !publishableKey.isBlank() ? publishableKey : serviceRoleKey;

        try {
            Map<String, Object> payload = Map.of("email", email);
            String url = supabaseUrl + "/auth/v1/recover";
            if (redirectTo != null && !redirectTo.isBlank()) {
                url += "?redirect_to=" + java.net.URLEncoder.encode(redirectTo, java.nio.charset.StandardCharsets.UTF_8);
            }

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(url))
                    .timeout(Duration.ofSeconds(10))
                    .header("Content-Type", "application/json")
                    .header("apikey", apiKey)
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(payload)))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
            return response.statusCode() >= 200 && response.statusCode() < 300;
        } catch (Exception e) {
            log.error("Failed to send Supabase password reset: {}", e.getMessage());
            return false;
        }
    }

    public static record SupabaseAuthResult(String accessToken, String refreshToken, String userId) {}
}
