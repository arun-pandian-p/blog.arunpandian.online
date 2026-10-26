package com.arunpandian.blog.dto.reaction;

import com.arunpandian.blog.entity.enums.ReactionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ReactionRequest {

    @NotBlank(message = "Target type is required")
    private String targetType; // BLOG or PROJECT

    @NotBlank(message = "Target ID is required")
    private String targetId;

    @NotNull(message = "Reaction type is required")
    private ReactionType reactionType = ReactionType.CLAP;

    private String sessionId;

    public ReactionRequest() {}

    public String getTargetType() { return targetType; }
    public void setTargetType(String targetType) { this.targetType = targetType; }

    public String getTargetId() { return targetId; }
    public void setTargetId(String targetId) { this.targetId = targetId; }

    public ReactionType getReactionType() { return reactionType; }
    public void setReactionType(ReactionType reactionType) { this.reactionType = reactionType; }

    public String getSessionId() { return sessionId; }
    public void setSessionId(String sessionId) { this.sessionId = sessionId; }
}
