package com.arunpandian.blog.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtils {

    private static final Logger log = LoggerFactory.getLogger(JwtUtils.class);

    private final SecretKey key;
    private final SecretKey supabaseKey;
    private final long expirationMs;
    private final String supabaseUrl;
    private final String supabasePublishableKey;

    public JwtUtils(
            @Value("${app.jwt.secret}") String secret,
            @Value("${app.jwt.expiration-ms:86400000}") long expirationMs,
            @Value("${app.supabase.jwt-secret:}") String supabaseSecret,
            @Value("${app.supabase.url:}") String supabaseUrl,
            @Value("${app.supabase.publishable-key:}") String supabasePublishableKey) {
        this.key = createKey(secret);
        this.supabaseKey = (supabaseSecret != null && !supabaseSecret.isBlank() && !supabaseSecret.equals(secret))
                ? createKey(supabaseSecret)
                : null;
        this.expirationMs = expirationMs;
        this.supabaseUrl = supabaseUrl;
        this.supabasePublishableKey = supabasePublishableKey;
    }

    private SecretKey createKey(String secretStr) {
        byte[] keyBytes = secretStr.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            byte[] padded = new byte[32];
            System.arraycopy(keyBytes, 0, padded, 0, keyBytes.length);
            keyBytes = padded;
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateToken(String username, String role) {
        Date now = new Date();
        Date expiryDate = new Date(now.getTime() + expirationMs);

        return Jwts.builder()
                .subject(username)
                .claim("role", role)
                .claim("email", username.contains("@") ? username : null)
                .issuedAt(now)
                .expiration(expiryDate)
                .signWith(key)
                .compact();
    }

    public Claims getClaimsFromToken(String token) {
        try {
            return Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();
        } catch (Exception primaryEx) {
            if (supabaseKey != null) {
                try {
                    return Jwts.parser()
                            .verifyWith(supabaseKey)
                            .build()
                            .parseSignedClaims(token)
                            .getPayload();
                } catch (Exception secondaryEx) {
                    // Fallthrough
                }
            }
            throw primaryEx;
        }
    }

    public String getUsernameFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        String email = claims.get("email", String.class);
        if (email != null && !email.isBlank()) {
            return email;
        }
        return claims.getSubject();
    }

    public String getRoleFromToken(String token) {
        Claims claims = getClaimsFromToken(token);
        String role = claims.get("role", String.class);
        if (role != null) {
            return role;
        }
        return "ROLE_USER";
    }

    public boolean validateToken(String token) {
        try {
            getClaimsFromToken(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            log.debug("JWT verification via HMAC failed: {}", e.getMessage());
            return false;
        }
    }
}
