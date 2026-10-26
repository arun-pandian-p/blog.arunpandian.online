package com.arunpandian.blog;

import com.arunpandian.blog.dto.auth.LoginRequest;
import com.arunpandian.blog.dto.blog.BlogCreateRequest;
import com.arunpandian.blog.entity.enums.BlogStatus;
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

import java.util.List;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class BlogControllerTest {

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
    @DisplayName("Public can list published blogs")
    void testGetPublicBlogs() throws Exception {
        mockMvc.perform(get("/api/blogs"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray());
    }

    @Test
    @DisplayName("Anonymous users cannot access admin blog management")
    void testAnonymousAccessDeniedToAdminBlogs() throws Exception {
        mockMvc.perform(get("/api/admin/blogs"))
                .andExpect(status().isUnauthorized());
    }

    @Test
    @DisplayName("Admin can create a new blog post")
    void testAdminCreateBlog() throws Exception {
        BlogCreateRequest req = new BlogCreateRequest();
        req.setTitle("Spring Boot 3 Migration Guide");
        req.setContent("Complete details about migrating to Spring Boot 3.");
        req.setExcerpt("A comprehensive guide.");
        req.setTags(List.of("Java", "SpringBoot", "Flyway"));
        req.setStatus(BlogStatus.PUBLISHED);

        mockMvc.perform(post("/api/admin/blogs")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Spring Boot 3 Migration Guide"))
                .andExpect(jsonPath("$.slug").value("spring-boot-3-migration-guide"))
                .andExpect(jsonPath("$.tags.length()").value(3));
    }

    @Test
    @DisplayName("Creating blog post with more than 4 tags is rejected with 400 Bad Request")
    void testTagLimitConstraint() throws Exception {
        BlogCreateRequest req = new BlogCreateRequest();
        req.setTitle("Too Many Tags Blog");
        req.setContent("Content here...");
        req.setTags(List.of("Tag1", "Tag2", "Tag3", "Tag4", "Tag5"));

        mockMvc.perform(post("/api/admin/blogs")
                        .header("Authorization", "Bearer " + adminToken)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(req)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.validationErrors.tags").exists());
    }

    @Test
    @DisplayName("Public can read RSS feed")
    void testGetRssFeed() throws Exception {
        mockMvc.perform(get("/feed.xml"))
                .andExpect(status().isOk())
                .andExpect(content().contentTypeCompatibleWith("application/rss+xml"))
                .andExpect(content().string(org.hamcrest.Matchers.containsString("<rss version=\"2.0\"")));
    }

    @Test
    @DisplayName("Public can view existing article by slug")
    void testGetArticleBySlug() throws Exception {
        mockMvc.perform(get("/api/blogs/job-posting-data-hiring"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.slug").value("job-posting-data-hiring"))
                .andExpect(jsonPath("$.title").exists());
    }

    @Test
    @DisplayName("Authenticated user can toggle and retrieve bookmarks")
    void testBookmarkFlow() throws Exception {
        // 1. Get blog ID
        MvcResult blogRes = mockMvc.perform(get("/api/blogs/job-posting-data-hiring"))
                .andExpect(status().isOk())
                .andReturn();
        String blogId = objectMapper.readTree(blogRes.getResponse().getContentAsString()).get("id").asText();

        // 2. Toggle bookmark
        mockMvc.perform(post("/api/bookmarks/" + blogId)
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.bookmarked").value(true));

        // 3. Get user bookmarks
        mockMvc.perform(get("/api/bookmarks")
                        .header("Authorization", "Bearer " + adminToken))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$.length()").value(org.hamcrest.Matchers.greaterThanOrEqualTo(1)));
    }
}
