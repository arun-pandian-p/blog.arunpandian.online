package com.arunpandian.blog.dto.comment;

import com.arunpandian.blog.entity.enums.CommentStatus;
import jakarta.validation.constraints.NotNull;

public class CommentStatusUpdateRequest {

    @NotNull(message = "Status is required")
    private CommentStatus status;

    public CommentStatusUpdateRequest() {}

    public CommentStatusUpdateRequest(CommentStatus status) {
        this.status = status;
    }

    public CommentStatus getStatus() { return status; }
    public void setStatus(CommentStatus status) { this.status = status; }
}
