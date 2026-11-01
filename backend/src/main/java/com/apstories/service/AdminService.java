package com.apstories.service;

import com.apstories.client.SupabaseClient;
import com.apstories.dto.AbuseReportDto;
import com.apstories.dto.BlogDto;
import com.apstories.dto.ReportRequest;
import com.apstories.dto.StatsResponse;
import com.apstories.dto.UserDto;
import com.fasterxml.jackson.core.type.TypeReference;
import org.springframework.stereotype.Service;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.*;

@Service
public class AdminService {

    private final SupabaseClient supabaseClient;

    public AdminService(SupabaseClient supabaseClient) {
        this.supabaseClient = supabaseClient;
    }

    public StatsResponse getStats() {
        StatsResponse stats = new StatsResponse();

        stats.setTotalStories(supabaseClient.count("blogs"));
        stats.setPublishedStories(supabaseClient.count("blogs?published=eq.true&status=eq.PUBLISHED"));
        stats.setDraftStories(supabaseClient.count("blogs?published=eq.false"));
        stats.setTotalUsers(supabaseClient.count("users"));
        stats.setTotalComments(supabaseClient.count("comments"));
        stats.setPendingReports(supabaseClient.count("abuse_reports?status=eq.PENDING"));

        // Sum views and claps from recent blogs
        List<BlogDto> blogs = supabaseClient.getList("blogs?select=views_count,claps_count&limit=1000", new TypeReference<List<BlogDto>>() {});
        long totalViews = 0;
        long totalClaps = 0;
        for (BlogDto b : blogs) {
            totalViews += b.getViewsCount();
            totalClaps += b.getClapsCount();
        }
        stats.setTotalViews(totalViews);
        stats.setTotalClaps(totalClaps);

        return stats;
    }

    public List<AbuseReportDto> getReports(String status) {
        StringBuilder query = new StringBuilder("abuse_reports?");
        if (status != null && !status.isBlank() && !"ALL".equalsIgnoreCase(status)) {
            query.append("status=eq.").append(URLEncoder.encode(status.trim().toUpperCase(), StandardCharsets.UTF_8)).append("&");
        }
        query.append("order=created_at.desc");

        return supabaseClient.getList(query.toString(), new TypeReference<List<AbuseReportDto>>() {});
    }

    public AbuseReportDto createReport(ReportRequest req, String reporterId) {
        String id = UUID.randomUUID().toString();
        Map<String, Object> map = new HashMap<>();
        map.put("id", id);
        map.put("reporter_id", reporterId);
        map.put("target_type", req.getTargetType());
        map.put("target_id", req.getTargetId());
        map.put("reason", req.getReason());
        map.put("details", req.getDetails());
        map.put("status", "PENDING");
        map.put("created_at", Instant.now().toString());

        List<AbuseReportDto> result = supabaseClient.post("abuse_reports", map, new TypeReference<List<AbuseReportDto>>() {});
        return result.isEmpty() ? null : result.get(0);
    }

    public AbuseReportDto updateReportStatus(String reportId, String status) {
        String path = "abuse_reports?id=eq." + URLEncoder.encode(reportId, StandardCharsets.UTF_8);
        Map<String, Object> map = Map.of(
                "status", status.toUpperCase(),
                "updated_at", Instant.now().toString()
        );
        List<AbuseReportDto> result = supabaseClient.patch(path, map, new TypeReference<List<AbuseReportDto>>() {});
        return result.isEmpty() ? null : result.get(0);
    }

    public List<UserDto> getAllUsers() {
        return supabaseClient.getList("users?order=created_at.desc&limit=100", new TypeReference<List<UserDto>>() {});
    }

    public UserDto updateUserRole(String userId, String role) {
        String formattedRole = role.startsWith("ROLE_") ? role : "ROLE_" + role;
        String path = "users?id=eq." + URLEncoder.encode(userId, StandardCharsets.UTF_8);
        Map<String, Object> map = Map.of("role", formattedRole);
        List<UserDto> result = supabaseClient.patch(path, map, new TypeReference<List<UserDto>>() {});
        return result.isEmpty() ? null : result.get(0);
    }
}

