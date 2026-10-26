package com.arunpandian.blog.dto.contact;

import com.arunpandian.blog.entity.ContactMessage;
import java.time.Instant;
import java.util.UUID;

public class ContactMessageDto {
    private UUID id;
    private String name;
    private String email;
    private String subject;
    private String message;
    private boolean isRead;
    private Instant createdAt;

    public ContactMessageDto() {}

    public static ContactMessageDto from(ContactMessage msg) {
        if (msg == null) return null;
        ContactMessageDto dto = new ContactMessageDto();
        dto.setId(msg.getId());
        dto.setName(msg.getName());
        dto.setEmail(msg.getEmail());
        dto.setSubject(msg.getSubject());
        dto.setMessage(msg.getMessage());
        dto.setRead(msg.isRead());
        dto.setCreatedAt(msg.getCreatedAt());
        return dto;
    }

    public UUID getId() { return id; }
    public void setId(UUID id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getSubject() { return subject; }
    public void setSubject(String subject) { this.subject = subject; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public boolean isRead() { return isRead; }
    public void setRead(boolean read) { isRead = read; }

    public Instant getCreatedAt() { return createdAt; }
    public void setCreatedAt(Instant createdAt) { this.createdAt = createdAt; }
}
