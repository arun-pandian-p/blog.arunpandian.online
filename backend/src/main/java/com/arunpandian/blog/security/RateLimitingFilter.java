package com.arunpandian.blog.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Component
public class RateLimitingFilter extends OncePerRequestFilter {

    private final int publicRequestsPerMinute;
    private final int authRequestsPerMinute;
    private final ObjectMapper objectMapper = new ObjectMapper();

    private final ConcurrentHashMap<String, RequestBucket> buckets = new ConcurrentHashMap<>();

    public RateLimitingFilter(
            @Value("${app.rate-limit.public-requests-per-minute:60}") int publicRequestsPerMinute,
            @Value("${app.rate-limit.auth-requests-per-minute:15}") int authRequestsPerMinute) {
        this.publicRequestsPerMinute = publicRequestsPerMinute;
        this.authRequestsPerMinute = authRequestsPerMinute;
    }

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain) throws ServletException, IOException {

        if ("OPTIONS".equalsIgnoreCase(request.getMethod())) {
            filterChain.doFilter(request, response);
            return;
        }

        String uri = request.getRequestURI();
        String clientIp = getClientIp(request);

        int maxRequests;
        String bucketPrefix;

        if (uri.startsWith("/api/auth/login")) {
            maxRequests = authRequestsPerMinute;
            bucketPrefix = "auth:";
        } else if (uri.startsWith("/api/comments") || uri.startsWith("/api/contact")
                || uri.startsWith("/api/newsletter") || uri.startsWith("/api/reactions")) {
            maxRequests = publicRequestsPerMinute;
            bucketPrefix = "write:";
        } else {
            // General read endpoints have generous limits or proceed
            filterChain.doFilter(request, response);
            return;
        }

        String key = bucketPrefix + clientIp;
        long now = System.currentTimeMillis();

        RequestBucket bucket = buckets.compute(key, (k, existing) -> {
            if (existing == null || now - existing.windowStart > 60000) {
                return new RequestBucket(now, 1);
            } else {
                existing.counter.incrementAndGet();
                return existing;
            }
        });

        if (bucket.counter.get() > maxRequests) {
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            Map<String, Object> errorBody = Map.of(
                    "status", HttpStatus.TOO_MANY_REQUESTS.value(),
                    "error", "Too Many Requests",
                    "message", "Rate limit exceeded. Please try again later.",
                    "path", uri
            );
            response.getWriter().write(objectMapper.writeValueAsString(errorBody));
            return;
        }

        filterChain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String xf = request.getHeader("X-Forwarded-For");
        if (xf != null && !xf.isBlank()) {
            return xf.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }

    private static class RequestBucket {
        final long windowStart;
        final AtomicInteger counter;

        RequestBucket(long windowStart, int initialCount) {
            this.windowStart = windowStart;
            this.counter = new AtomicInteger(initialCount);
        }
    }
}
