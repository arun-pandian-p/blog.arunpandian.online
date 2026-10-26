package com.arunpandian.blog.service;

import com.arunpandian.blog.dto.common.PageResponse;
import com.arunpandian.blog.dto.contact.ContactMessageDto;
import com.arunpandian.blog.dto.contact.ContactMessageRequest;
import com.arunpandian.blog.entity.ContactMessage;
import com.arunpandian.blog.exception.ResourceNotFoundException;
import com.arunpandian.blog.repository.ContactMessageRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class ContactService {

    private static final Logger log = LoggerFactory.getLogger(ContactService.class);

    private final ContactMessageRepository contactMessageRepository;

    public ContactService(ContactMessageRepository contactMessageRepository) {
        this.contactMessageRepository = contactMessageRepository;
    }

    @Transactional
    public ContactMessageDto submitMessage(ContactMessageRequest req) {
        ContactMessage message = new ContactMessage();
        message.setName(req.getName().trim());
        message.setEmail(req.getEmail().trim().toLowerCase());
        message.setSubject(req.getSubject() != null ? req.getSubject().trim() : "No Subject");
        message.setMessage(req.getMessage().trim());
        message.setRead(false);

        ContactMessage saved = contactMessageRepository.save(message);
        log.info("Received contact message from {} ({})", saved.getName(), saved.getEmail());
        return ContactMessageDto.from(saved);
    }

    @Transactional(readOnly = true)
    public PageResponse<ContactMessageDto> getMessages(int page, int size) {
        Page<ContactMessage> msgPage = contactMessageRepository.findAllByOrderByCreatedAtDesc(PageRequest.of(page, size));
        List<ContactMessageDto> dtos = msgPage.getContent().stream().map(ContactMessageDto::from).toList();
        return new PageResponse<>(dtos, msgPage.getNumber(), msgPage.getSize(), msgPage.getTotalElements(), msgPage.getTotalPages(), msgPage.isLast());
    }

    @Transactional
    public void markAsRead(UUID id) {
        ContactMessage msg = contactMessageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contact message", "id", id));
        msg.setRead(true);
        contactMessageRepository.save(msg);
    }

    @Transactional
    public void deleteMessage(UUID id) {
        ContactMessage msg = contactMessageRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contact message", "id", id));
        contactMessageRepository.delete(msg);
    }
}
