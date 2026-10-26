package com.arunpandian.blog;

import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest(properties = {
        "app.rate-limit.auth-requests-per-minute=3"
})
@AutoConfigureMockMvc
@ActiveProfiles("test")
class RateLimitingTest {

    @Autowired
    private MockMvc mockMvc;

    @Test
    @DisplayName("Exceeding auth endpoint rate limit triggers HTTP 429 Too Many Requests")
    void testRateLimitExceeded() throws Exception {
        String payload = "{\"email\":\"admin@arunpandian.online\",\"password\":\"WrongPass\"}";

        // First 3 requests permitted (status 401 Bad credentials)
        for (int i = 0; i < 3; i++) {
            mockMvc.perform(post("/api/auth/login")
                            .header("X-Forwarded-For", "198.51.100.42")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(payload))
                    .andExpect(status().isUnauthorized());
        }

        // 4th request from same IP within the minute is blocked with 429
        mockMvc.perform(post("/api/auth/login")
                        .header("X-Forwarded-For", "198.51.100.42")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isTooManyRequests());
    }
}
