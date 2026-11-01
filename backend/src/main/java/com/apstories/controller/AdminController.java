package com.apstories.controller;

import com.apstories.dto.AbuseReportDto;
import com.apstories.dto.ReportRequest;
import com.apstories.dto.StatsResponse;
import com.apstories.dto.UserDto;
import com.apstories.service.AdminService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    @GetMapping("/stats")
    public ResponseEntity<StatsResponse> getStats() {
        return ResponseEntity.ok(adminService.getStats());
    }

    @GetMapping("/reports")
    public ResponseEntity<List<AbuseReportDto>> getReports(@RequestParam(required = false) String status) {
        return ResponseEntity.ok(adminService.getReports(status));
    }

    @PatchMapping("/reports/{id}/status")
    public ResponseEntity<?> updateReportStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        String status = body.getOrDefault("status", "RESOLVED");
        AbuseReportDto updated = adminService.updateReportStatus(id, status);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getUsers() {
        return ResponseEntity.ok(adminService.getAllUsers());
    }

    @PatchMapping("/users/{id}/role")
    public ResponseEntity<?> updateUserRole(@PathVariable String id, @RequestBody Map<String, String> body) {
        String role = body.getOrDefault("role", "ROLE_USER");
        UserDto updated = adminService.updateUserRole(id, role);
        return ResponseEntity.ok(updated);
    }
}

