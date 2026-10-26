package com.arunpandian.blog;

import com.arunpandian.blog.dto.auth.LoginRequest;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Test
    @DisplayName("Login with valid seeded admin credentials returns JWT")
    void testValidLogin() throws Exception {
        LoginRequest req = new LoginRequest("admin@arunpandian.online", "Admin@12345");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.user.email").value("admin@arunpandian.online"))
                .andExpect(jsonPath("$.user.role").value("ROLE_ADMIN"));
    }

    @Test
    @DisplayName("Login with incorrect password returns 401 Unauthorized")
    void testInvalidLogin() throws Exception {
        LoginRequest req = new LoginRequest("admin@arunpandian.online", "WrongPassword!");

        mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.status").value(401));
    }

    @Test
    @DisplayName("GET /api/auth/me without token returns 401 Unauthorized")
    void testGetMeWithoutToken() throws Exception {
        mockMvc.perform(get("/api/auth/me"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("GET /api/auth/me with valid Bearer token returns current user")
    void testGetMeWithToken() throws Exception {
        LoginRequest loginReq = new LoginRequest("admin@arunpandian.online", "Admin@12345");
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andExpect(status().isOk())
                .andReturn();

        String token = objectMapper.readTree(loginResult.getResponse().getContentAsString()).get("token").asText();

        mockMvc.perform(get("/api/auth/me")
                        .header("Authorization", "Bearer " + token))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value("admin@arunpandian.online"));
    }

    @Test
    @DisplayName("User registration creates standard ROLE_USER account and returns JWT")
    void testRegisterUser() throws Exception {
        com.arunpandian.blog.dto.auth.RegisterRequest req = new com.arunpandian.blog.dto.auth.RegisterRequest(
                "author@example.com",
                "janedoe",
                "Password123!",
                "Jane Doe"
        );

        mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.token").isString())
                .andExpect(jsonPath("$.user.username").value("janedoe"))
                .andExpect(jsonPath("$.user.email").value("author@example.com"))
                .andExpect(jsonPath("$.user.role").value("ROLE_USER"));
    }

    @Test
    @DisplayName("Public author profile can be retrieved by username without authentication")
    void testGetPublicProfile() throws Exception {
        mockMvc.perform(get("/api/users/arunpandian"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.username").value("arunpandian"))
                .andExpect(jsonPath("$.fullName").value("Arun Pandian"));
    }
}
