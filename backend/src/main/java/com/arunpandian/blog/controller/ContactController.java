package com.arunpandian.blog.controller;

import com.arunpandian.blog.dto.common.PageResponse;
import com.arunpandian.blog.dto.contact.ContactMessageDto;
import com.arunpandian.blog.dto.contact.ContactMessageRequest;
import com.arunpandian.blog.service.ContactService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
public class ContactController {

    private final ContactService contactService;

    public ContactController(ContactService contactService) {
        this.contactService = contactService;
    }

    @PostMapping("/api/contact")
    public ResponseEntity<ContactMessageDto> submitContactMessage(@Valid @RequestBody ContactMessageRequest request) {
        ContactMessageDto created = contactService.submitMessage(request);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping("/api/admin/messages")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<PageResponse<ContactMessageDto>> getMessages(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size) {
        return ResponseEntity.ok(contactService.getMessages(page, size));
    }

    @PatchMapping("/api/admin/messages/{id}/read")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> markAsRead(@PathVariable UUID id) {
        contactService.markAsRead(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/api/admin/messages/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteMessage(@PathVariable UUID id) {
        contactService.deleteMessage(id);
        return ResponseEntity.noContent().build();
    }
}
