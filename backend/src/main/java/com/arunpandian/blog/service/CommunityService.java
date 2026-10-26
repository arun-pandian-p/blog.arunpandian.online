package com.arunpandian.blog.service;

import com.arunpandian.blog.entity.AbuseReport;
import com.arunpandian.blog.entity.User;
import com.arunpandian.blog.entity.UserFollow;
import com.arunpandian.blog.exception.BadRequestException;
import com.arunpandian.blog.exception.ResourceNotFoundException;
import com.arunpandian.blog.repository.AbuseReportRepository;
import com.arunpandian.blog.repository.UserFollowRepository;
import com.arunpandian.blog.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Map;
import java.util.UUID;

@Service
public class CommunityService {

    private final UserFollowRepository followRepository;
    private final AbuseReportRepository reportRepository;
    private final UserRepository userRepository;

    public CommunityService(UserFollowRepository followRepository,
                            AbuseReportRepository reportRepository,
                            UserRepository userRepository) {
        this.followRepository = followRepository;
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public Map<String, Object> toggleFollow(User follower, UUID targetUserId) {
        if (follower.getId().equals(targetUserId)) {
            throw new BadRequestException("You cannot follow yourself");
        }

        User target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", targetUserId));

        var existing = followRepository.findByFollowerAndFollowing(follower, target);
        boolean following;
        if (existing.isPresent()) {
            followRepository.delete(existing.get());
            following = false;
        } else {
            followRepository.save(new UserFollow(follower, target));
            following = true;
        }

        long count = followRepository.countByFollowing(target);
        return Map.of("following", following, "followersCount", count);
    }

    @Transactional(readOnly = true)
    public Map<String, Object> getFollowStatus(User follower, UUID targetUserId) {
        User target = userRepository.findById(targetUserId)
                .orElseThrow(() -> new ResourceNotFoundException("User", "id", targetUserId));

        boolean following = follower != null && followRepository.existsByFollowerAndFollowing(follower, target);
        long count = followRepository.countByFollowing(target);
        return Map.of("following", following, "followersCount", count);
    }

    @Transactional
    public AbuseReport submitReport(User reporter, String targetType, UUID targetId, String reason, String details) {
        UUID reporterId = reporter != null ? reporter.getId() : null;
        AbuseReport report = new AbuseReport(reporterId, targetType, targetId, reason, details);
        return reportRepository.save(report);
    }

    @Transactional(readOnly = true)
    public Page<AbuseReport> getReports(String status, int page, int size) {
        return reportRepository.findByStatus(status != null ? status : "PENDING", PageRequest.of(page, size));
    }

    @Transactional
    public AbuseReport updateReportStatus(UUID reportId, String status) {
        AbuseReport report = reportRepository.findById(reportId)
                .orElseThrow(() -> new ResourceNotFoundException("AbuseReport", "id", reportId));
        report.setStatus(status);
        return reportRepository.save(report);
    }
}
