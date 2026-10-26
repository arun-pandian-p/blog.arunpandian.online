package com.arunpandian.blog.controller;

import com.arunpandian.blog.entity.SiteSetting;
import com.arunpandian.blog.service.SiteSettingService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
public class SiteSettingController {

    private final SiteSettingService siteSettingService;

    public SiteSettingController(SiteSettingService siteSettingService) {
        this.siteSettingService = siteSettingService;
    }

    @GetMapping("/api/settings")
    public ResponseEntity<Map<String, String>> getAllSettings() {
        return ResponseEntity.ok(siteSettingService.getAllSettings());
    }

    @GetMapping("/api/settings/{key}")
    public ResponseEntity<Map<String, String>> getSetting(@PathVariable String key) {
        String value = siteSettingService.getSetting(key, null);
        if (value == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(Map.of("key", key, "value", value));
    }

    @PutMapping("/api/admin/settings/{key}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<SiteSetting> updateSetting(
            @PathVariable String key,
            @RequestBody Map<String, String> body) {
        String value = body.getOrDefault("value", "");
        SiteSetting setting = siteSettingService.setSetting(key, value);
        return ResponseEntity.ok(setting);
    }
}
