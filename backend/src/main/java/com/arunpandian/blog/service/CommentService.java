package com.arunpandian.blog.service;

import com.arunpandian.blog.dto.comment.CommentCreateRequest;
import com.arunpandian.blog.dto.comment.CommentDto;
import com.arunpandian.blog.dto.common.PageResponse;
import com.arunpandian.blog.entity.Comment;
import com.arunpandian.blog.entity.enums.CommentStatus;
import com.arunpandian.blog.exception.ResourceNotFoundException;
import com.arunpandian.blog.repository.CommentRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.UUID;

@Service
public class CommentService {

    private static final Logger log = LoggerFactory.getLogger(CommentService.class);

    private final CommentRepository commentRepository;

    public CommentService(CommentRepository commentRepository) {
        this.commentRepository = commentRepository;
    }

    @Transactional(readOnly = true)
    public List<CommentDto> getApprovedComments(String targetSlug, UUID blogId) {
        if (StringUtils.hasText(targetSlug)) {
            return commentRepository.findByTargetSlugAndStatusOrderByCreatedAtDesc(targetSlug, CommentStatus.APPROVED)
                    .stream()
                    .map(CommentDto::from)
                    .toList();
        } else if (blogId != null) {
            return commentRepository.findByBlogIdAndStatusOrderByCreatedAtDesc(blogId, CommentStatus.APPROVED)
                    .stream()
                    .map(CommentDto::from)
                    .toList();
        }
        return List.of();
    }

    @Transactional
    public CommentDto createComment(CommentCreateRequest req) {
        Comment comment = new Comment();
        comment.setBlogId(req.getBlogId());
        comment.setProjectId(req.getProjectId());
        comment.setTargetSlug(req.getTargetSlug());
        comment.setAuthorName(req.getAuthorName().trim());
        comment.setAuthorEmail(req.getAuthorEmail() != null ? req.getAuthorEmail().trim() : null);
        comment.setAuthorDomain(req.getAuthorDomain() != null ? req.getAuthorDomain().trim() : null);
        comment.setContent(req.getContent().trim());
        comment.setStatus(CommentStatus.APPROVED);

        Comment saved = commentRepository.save(comment);
        log.info("New comment submitted for target {} by {}", req.getTargetSlug(), req.getAuthorName());
        return CommentDto.from(saved);
    }

    @Transactional
    public int likeComment(UUID id) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", id));
        comment.setLikes(comment.getLikes() + 1);
        commentRepository.save(comment);
        return comment.getLikes();
    }

    @Transactional(readOnly = true)
    public PageResponse<CommentDto> getAllCommentsForAdmin(CommentStatus status, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Comment> commentPage;

        if (status != null) {
            commentPage = commentRepository.findByStatusOrderByCreatedAtDesc(status, pageable);
        } else {
            commentPage = commentRepository.findAllByOrderByCreatedAtDesc(pageable);
        }

        List<CommentDto> dtos = commentPage.getContent().stream().map(CommentDto::from).toList();
        return new PageResponse<>(dtos, commentPage.getNumber(), commentPage.getSize(), commentPage.getTotalElements(), commentPage.getTotalPages(), commentPage.isLast());
    }

    @Transactional
    public CommentDto updateCommentStatus(UUID id, CommentStatus status) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", id));
        comment.setStatus(status);
        Comment saved = commentRepository.save(comment);
        log.info("Comment {} status updated to {}", id, status);
        return CommentDto.from(saved);
    }

    @Transactional
    public void deleteComment(UUID id) {
        Comment comment = commentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Comment", "id", id));
        commentRepository.delete(comment);
        log.info("Deleted comment with id: {}", id);
    }
}
