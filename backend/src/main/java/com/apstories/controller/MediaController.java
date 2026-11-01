package com.apstories.controller;

import com.apstories.dto.AbuseReportDto;
import com.apstories.dto.ReportRequest;
import com.apstories.service.AdminService;
import com.apstories.service.MediaService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api")
public class MediaController {

    private final MediaService mediaService;
    private final AdminService adminService;

    public MediaController(MediaService mediaService, AdminService adminService) {
        this.mediaService = mediaService;
        this.adminService = adminService;
    }

    @PostMapping("/media/upload")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            Map<String, Object> result = mediaService.processUpload(file);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/reports")
    public ResponseEntity<?> submitReport(@Valid @RequestBody ReportRequest request, Authentication authentication) {
        try {
            String reporterId = authentication != null ? authentication.getName() : "anonymous";
            AbuseReportDto report = adminService.createReport(request, reporterId);
            return ResponseEntity.ok(report);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
}

