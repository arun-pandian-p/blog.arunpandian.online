package com.arunpandian.blog.repository;

import com.arunpandian.blog.entity.Reaction;
import com.arunpandian.blog.entity.enums.ReactionType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReactionRepository extends JpaRepository<Reaction, UUID> {
    long countByTargetTypeAndTargetIdAndReactionType(String targetType, String targetId, ReactionType reactionType);
    List<Reaction> findByTargetTypeAndTargetId(String targetType, String targetId);
    boolean existsByTargetTypeAndTargetIdAndReactionTypeAndSessionId(String targetType, String targetId, ReactionType reactionType, String sessionId);
}
