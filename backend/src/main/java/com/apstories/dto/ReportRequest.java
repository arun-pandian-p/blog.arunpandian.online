package com.apstories.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;

public class ReportRequest {
    @NotBlank(message = "Target type is required")
    @JsonProperty("target_type")
    private String targetType;

    @NotBlank(message = "Target ID is required")
    @JsonProperty("target_id")
    private String targetId;

    @NotBlank(message = "Reason is required")
    private String reason;

    private String details;

    public ReportRequest() {}

    public String getTargetType() { return targetType; }
    public void setTargetType(String targetType) { this.targetType = targetType; }

    public String getTargetId() { return targetId; }
    public void setTargetId(String targetId) { this.targetId = targetId; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public String getDetails() { return details; }
    public void setDetails(String details) { this.details = details; }
}

