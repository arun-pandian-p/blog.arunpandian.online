package com.arunpandian.blog.controller;

import com.arunpandian.blog.entity.Media;
import com.arunpandian.blog.service.MediaService;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;
import java.util.UUID;

@RestController
public class MediaController {

    private final MediaService mediaService;

    public MediaController(MediaService mediaService) {
        this.mediaService = mediaService;
    }

    @PostMapping({"/api/media/upload", "/api/admin/media/upload"})
    public ResponseEntity<Map<String, Object>> uploadMedia(@RequestParam("file") MultipartFile file) {
        Media media = mediaService.storeFile(file);
        return new ResponseEntity<>(Map.of(
                "id", media.getId(),
                "filename", media.getFilename(),
                "originalFilename", media.getOriginalFilename(),
                "url", media.getFilePath(),
                "size", media.getSizeBytes(),
                "contentType", media.getContentType()
        ), HttpStatus.CREATED);
    }

    @GetMapping("/api/media/{filename}")
    public ResponseEntity<Resource> getMediaFile(@PathVariable String filename) {
        Resource resource = mediaService.loadFileAsResource(filename);
        String contentType = "application/octet-stream";
        if (filename.endsWith(".png")) contentType = "image/png";
        else if (filename.endsWith(".jpg") || filename.endsWith(".jpeg")) contentType = "image/jpeg";
        else if (filename.endsWith(".webp")) contentType = "image/webp";
        else if (filename.endsWith(".gif")) contentType = "image/gif";
        else if (filename.endsWith(".svg")) contentType = "image/svg+xml";
        else if (filename.endsWith(".pdf")) contentType = "application/pdf";

        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(contentType))
                .header(HttpHeaders.CONTENT_DISPOSITION, "inline; filename=\"" + resource.getFilename() + "\"")
                .body(resource);
    }

    @GetMapping("/api/admin/media")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Page<Media>> listMedia(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(mediaService.listMedia(page, size));
    }

    @DeleteMapping("/api/admin/media/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteMedia(@PathVariable UUID id) {
        mediaService.deleteMedia(id);
        return ResponseEntity.noContent().build();
    }
}
