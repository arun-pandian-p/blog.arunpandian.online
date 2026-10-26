package com.arunpandian.blog;

import com.arunpandian.blog.dto.auth.LoginRequest;
import com.arunpandian.blog.dto.comment.CommentCreateRequest;
import com.arunpandian.blog.dto.comment.CommentStatusUpdateRequest;
import com.arunpandian.blog.entity.enums.CommentStatus;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import java.util.UUID;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class CommentControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    private String adminToken;

    @BeforeEach
    void setUp() throws Exception {
        LoginRequest loginReq = new LoginRequest("admin@arunpandian.online", "Admin@12345");
        MvcResult loginResult = mockMvc.perform(post("/api/auth/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(loginReq)))
                .andReturn();
        adminToken = objectMapper.readTree(loginResult.getResponse().getContentAsString()).get("token").asText();
    }

    @Test
    @DisplayName("Public can submit comment and read approved comments")
    void testCommentLifecycle() throws Exception {
        CommentCreateRequest req = new CommentCreateRequest();
        req.setAuthorName("Jane Doe");
        req.setAuthorEmail("jane@example.com");
        req.setContent("Excellent write-up on Spring Boot migration!");
        req.setTargetSlug("building-production-ready-microservices");

        MvcResult createResult = mockMvc.perform(post("/api/comments")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.authorName").value("Jane Doe"))
                .andReturn();

        String commentIdStr = objectMapper.readTree(createResult.getResponse().getContentAsString()).get("id").asText();
        UUID commentId = UUID.fromString(commentIdStr);

        // Like comment
        mockMvc.perform(post("/api/comments/" + commentId + "/like"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.likes").value(1));

        // Admin moderation
        CommentStatusUpdateRequest updateReq = new CommentStatusUpdateRequest(CommentStatus.APPROVED);
        mockMvc.perform(patch("/api/admin/comments/" + commentId + "/status")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(updateReq)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("APPROVED"));
    }
}
