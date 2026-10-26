package com.arunpandian.blog.service;

import com.arunpandian.blog.entity.Media;
import com.arunpandian.blog.exception.BadRequestException;
import com.arunpandian.blog.exception.ResourceNotFoundException;
import com.arunpandian.blog.repository.MediaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.net.MalformedURLException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.Objects;
import java.util.Set;
import java.util.UUID;

@Service
public class MediaService {

    private static final Logger log = LoggerFactory.getLogger(MediaService.class);

    private static final Set<String> ALLOWED_EXTENSIONS = Set.of(
            "jpg", "jpeg", "png", "gif", "webp", "svg", "mp4", "webm", "pdf"
    );

    private final Path uploadLocation;
    private final MediaRepository mediaRepository;

    public MediaService(
            @Value("${app.storage.upload-dir:uploads}") String uploadDir,
            MediaRepository mediaRepository) {
        this.uploadLocation = Paths.get(uploadDir).toAbsolutePath().normalize();
        this.mediaRepository = mediaRepository;

        try {
            Files.createDirectories(this.uploadLocation);
        } catch (IOException e) {
            log.error("Could not create upload directory at {}: {}", uploadLocation, e.getMessage());
            throw new RuntimeException("Could not create upload directory", e);
        }
    }

    @Transactional
    public Media storeFile(MultipartFile file) {
        if (file.isEmpty()) {
            throw new BadRequestException("Failed to store empty file");
        }

        String originalFilename = StringUtils.cleanPath(Objects.requireNonNullElse(file.getOriginalFilename(), "file"));
        String extension = getFileExtension(originalFilename).toLowerCase();

        if (!ALLOWED_EXTENSIONS.contains(extension)) {
            throw new BadRequestException("File type not allowed: ." + extension);
        }

        String storedFilename = UUID.randomUUID() + "." + extension;

        try {
            Path targetLocation = this.uploadLocation.resolve(storedFilename);
            Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);

            String contentType = file.getContentType() != null ? file.getContentType() : "application/octet-stream";
            long sizeBytes = file.getSize();
            String filePath = "/uploads/" + storedFilename;

            Media media = new Media(storedFilename, originalFilename, filePath, contentType, sizeBytes);
            Media saved = mediaRepository.save(media);
            log.info("Stored media file: {} (original: {}, size: {} bytes)", storedFilename, originalFilename, sizeBytes);
            return saved;
        } catch (IOException e) {
            throw new BadRequestException("Could not store file " + originalFilename + ". Please try again!", e);
        }
    }

    @Transactional(readOnly = true)
    public Resource loadFileAsResource(String filename) {
        try {
            Path filePath = this.uploadLocation.resolve(filename).normalize();
            Resource resource = new UrlResource(filePath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new ResourceNotFoundException("Media file", "filename", filename);
            }
        } catch (MalformedURLException e) {
            throw new ResourceNotFoundException("Media file", "filename", filename);
        }
    }

    @Transactional(readOnly = true)
    public Page<Media> listMedia(int page, int size) {
        return mediaRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));
    }

    @Transactional
    public void deleteMedia(UUID id) {
        Media media = mediaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Media", "id", id));

        try {
            Path filePath = this.uploadLocation.resolve(media.getFilename()).normalize();
            Files.deleteIfExists(filePath);
        } catch (IOException e) {
            log.warn("Failed to delete physical media file {}: {}", media.getFilename(), e.getMessage());
        }

        mediaRepository.delete(media);
        log.info("Deleted media record {}", id);
    }

    private String getFileExtension(String filename) {
        int dotIndex = filename.lastIndexOf('.');
        return (dotIndex == -1) ? "" : filename.substring(dotIndex + 1);
    }
}
