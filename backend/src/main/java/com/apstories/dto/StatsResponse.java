package com.apstories.dto;

public class StatsResponse {
    private long totalStories;
    private long publishedStories;
    private long draftStories;
    private long totalUsers;
    private long totalComments;
    private long totalViews;
    private long totalClaps;
    private long pendingReports;

    public StatsResponse() {}

    public long getTotalStories() { return totalStories; }
    public void setTotalStories(long totalStories) { this.totalStories = totalStories; }

    public long getPublishedStories() { return publishedStories; }
    public void setPublishedStories(long publishedStories) { this.publishedStories = publishedStories; }

    public long getDraftStories() { return draftStories; }
    public void setDraftStories(long draftStories) { this.draftStories = draftStories; }

    public long getTotalUsers() { return totalUsers; }
    public void setTotalUsers(long totalUsers) { this.totalUsers = totalUsers; }

    public long getTotalComments() { return totalComments; }
    public void setTotalComments(long totalComments) { this.totalComments = totalComments; }

    public long getTotalViews() { return totalViews; }
    public void setTotalViews(long totalViews) { this.totalViews = totalViews; }

    public long getTotalClaps() { return totalClaps; }
    public void setTotalClaps(long totalClaps) { this.totalClaps = totalClaps; }

    public long getPendingReports() { return pendingReports; }
    public void setPendingReports(long pendingReports) { this.pendingReports = pendingReports; }
}

