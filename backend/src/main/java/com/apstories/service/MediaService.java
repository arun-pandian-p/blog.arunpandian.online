package com.apstories.service;

import com.apstories.client.SupabaseClient;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.util.Base64;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

@Service
public class MediaService {

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"
    );

    private final SupabaseClient supabaseClient;

    public MediaService(SupabaseClient supabaseClient) {
        this.supabaseClient = supabaseClient;
    }

    public Map<String, Object> processUpload(MultipartFile file) throws IOException {
        if (file.isEmpty()) {
            throw new IllegalArgumentException("Uploaded file cannot be empty");
        }

        String contentType = file.getContentType();
        String originalFilename = file.getOriginalFilename() != null ? file.getOriginalFilename() : "image.png";
        boolean isSvg = "image/svg+xml".equalsIgnoreCase(contentType) || originalFilename.toLowerCase().endsWith(".svg");

        if (contentType == null || (!ALLOWED_TYPES.contains(contentType.toLowerCase()) && !isSvg)) {
            throw new IllegalArgumentException("Unsupported image format. Allowed: JPEG, PNG, WEBP, GIF, SVG");
        }

        byte[] bytes = file.getBytes();
        String mime = isSvg ? "image/svg+xml" : (contentType != null ? contentType : "image/png");

        // Clean filename for storage
        String sanitizedFilename = originalFilename.replaceAll("[^a-zA-Z0-9._-]", "_");
        String storagePath = "blog-media/" + UUID.randomUUID().toString() + "-" + sanitizedFilename;

        // Upload to Supabase Storage "assets" bucket
        String publicUrl = supabaseClient.uploadStorage("assets", storagePath, bytes, mime);

        // Fallback to data URI only if storage upload fails
        if (publicUrl == null || publicUrl.isBlank()) {
            String base64Prefix = "data:" + mime + ";base64,";
            publicUrl = base64Prefix + Base64.getEncoder().encodeToString(bytes);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("url", publicUrl);
        response.put("filename", originalFilename);
        response.put("type", mime);
        response.put("size", bytes.length);
        response.put("isSvg", isSvg);

        return response;
    }
}
