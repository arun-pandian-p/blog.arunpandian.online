package com.arunpandian.blog.config;

import com.arunpandian.blog.security.JwtAuthenticationFilter;
import com.arunpandian.blog.security.RateLimitingFilter;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.Arrays;
import java.util.List;
import java.util.Map;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final RateLimitingFilter rateLimitingFilter;
    private final String[] allowedOrigins;
    private final ObjectMapper objectMapper = new ObjectMapper();

    public SecurityConfig(
            JwtAuthenticationFilter jwtAuthenticationFilter,
            RateLimitingFilter rateLimitingFilter,
            @Value("${app.cors.allowed-origins:http://localhost:5173,http://localhost:3000,http://localhost:4173,https://blog.arunpandian.online,https://arunpandian.online}") String[] allowedOrigins) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
        this.rateLimitingFilter = rateLimitingFilter;
        this.allowedOrigins = allowedOrigins;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authConfig) throws Exception {
        return authConfig.getAuthenticationManager();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();
        configuration.setAllowedOrigins(Arrays.asList(allowedOrigins));
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"));
        configuration.setAllowedHeaders(Arrays.asList("Authorization", "Content-Type", "Accept", "X-Requested-With", "Cache-Control", "apikey", "X-Client-Info"));
        configuration.setExposedHeaders(Arrays.asList("Authorization", "Link", "X-Total-Count"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource()))
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .exceptionHandling(exceptions -> exceptions
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpStatus.UNAUTHORIZED.value());
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            Map<String, Object> error = Map.of(
                                    "status", HttpStatus.UNAUTHORIZED.value(),
                                    "error", "Unauthorized",
                                    "message", authException.getMessage() != null ? authException.getMessage() : "Authentication required",
                                    "path", request.getRequestURI()
                            );
                            response.getWriter().write(objectMapper.writeValueAsString(error));
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(HttpStatus.FORBIDDEN.value());
                            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
                            Map<String, Object> error = Map.of(
                                    "status", HttpStatus.FORBIDDEN.value(),
                                    "error", "Forbidden",
                                    "message", "Access is denied",
                                    "path", request.getRequestURI()
                            );
                            response.getWriter().write(objectMapper.writeValueAsString(error));
                        })
                )
                .authorizeHttpRequests(auth -> auth
                        // Browser preflight requests must always be allowed
                        .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()

                        // Public Feeds & Static / Actuator / Social Crawlers
                        .requestMatchers("/feed.xml", "/rss.xml", "/feed", "/sitemap.xml", "/actuator/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/og/**", "/api/og", "/posts/*/og", "/blog/*/og").permitAll()

                        // Authentication routes
                        .requestMatchers("/api/auth/me").authenticated()
                        .requestMatchers("/api/auth/**").permitAll()

                        // Protected user routes
                        .requestMatchers(HttpMethod.GET, "/api/blogs/me").authenticated()
                        .requestMatchers("/api/bookmarks/**").authenticated()
                        .requestMatchers(HttpMethod.PUT, "/api/users/profile", "/api/users/password").authenticated()
                        .requestMatchers("/api/auth/me").authenticated()

                        // Public Read APIs
                        .requestMatchers(HttpMethod.GET, "/api/blogs/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/users/*").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/comments/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/reactions/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/settings/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/media/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/uploads/**").permitAll()

                        // Public Write APIs
                        .requestMatchers(HttpMethod.POST, "/api/comments/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/blogs/*/clap").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/reactions/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/contact/**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/api/newsletter/**").permitAll()

                        // Admin Only
                        .requestMatchers("/api/admin/**").hasRole("ADMIN")

                        // Default
                        .anyRequest().authenticated()
                );

        http.addFilterBefore(rateLimitingFilter, UsernamePasswordAuthenticationFilter.class);
        http.addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
