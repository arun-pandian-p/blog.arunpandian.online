package com.arunpandian.blog.repository;

import com.arunpandian.blog.entity.AbuseReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface AbuseReportRepository extends JpaRepository<AbuseReport, UUID> {
    Page<AbuseReport> findByStatus(String status, Pageable pageable);
}
