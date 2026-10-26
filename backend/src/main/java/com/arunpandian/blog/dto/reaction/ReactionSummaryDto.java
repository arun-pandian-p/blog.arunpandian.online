package com.arunpandian.blog.dto.reaction;

import java.util.Map;

public class ReactionSummaryDto {
    private String targetType;
    private String targetId;
    private long totalReactions;
    private Map<String, Long> countsByType;

    public ReactionSummaryDto() {}

    public ReactionSummaryDto(String targetType, String targetId, long totalReactions, Map<String, Long> countsByType) {
        this.targetType = targetType;
        this.targetId = targetId;
        this.totalReactions = totalReactions;
        this.countsByType = countsByType;
    }

    public String getTargetType() { return targetType; }
    public void setTargetType(String targetType) { this.targetType = targetType; }

    public String getTargetId() { return targetId; }
    public void setTargetId(String targetId) { this.targetId = targetId; }

    public long getTotalReactions() { return totalReactions; }
    public void setTotalReactions(long totalReactions) { this.totalReactions = totalReactions; }

    public Map<String, Long> getCountsByType() { return countsByType; }
    public void setCountsByType(Map<String, Long> countsByType) { this.countsByType = countsByType; }
}
