package com.arunpandian.blog.service;

import com.arunpandian.blog.dto.reaction.ReactionRequest;
import com.arunpandian.blog.dto.reaction.ReactionSummaryDto;
import com.arunpandian.blog.entity.Reaction;
import com.arunpandian.blog.entity.enums.ReactionType;
import com.arunpandian.blog.repository.ReactionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class ReactionService {

    private static final Logger log = LoggerFactory.getLogger(ReactionService.class);

    private final ReactionRepository reactionRepository;

    public ReactionService(ReactionRepository reactionRepository) {
        this.reactionRepository = reactionRepository;
    }

    @Transactional
    public ReactionSummaryDto addReaction(ReactionRequest req) {
        Reaction reaction = new Reaction();
        reaction.setTargetType(req.getTargetType().toUpperCase());
        reaction.setTargetId(req.getTargetId());
        reaction.setReactionType(req.getReactionType());
        reaction.setSessionId(req.getSessionId());

        reactionRepository.save(reaction);
        log.debug("Recorded {} reaction for {} / {}", req.getReactionType(), req.getTargetType(), req.getTargetId());

        return getSummary(req.getTargetType(), req.getTargetId());
    }

    @Transactional(readOnly = true)
    public ReactionSummaryDto getSummary(String targetType, String targetId) {
        List<Reaction> reactions = reactionRepository.findByTargetTypeAndTargetId(targetType.toUpperCase(), targetId);

        Map<String, Long> countsByType = new HashMap<>();
        for (ReactionType type : ReactionType.values()) {
            countsByType.put(type.name(), 0L);
        }

        for (Reaction r : reactions) {
            String typeName = r.getReactionType().name();
            countsByType.put(typeName, countsByType.getOrDefault(typeName, 0L) + 1);
        }

        return new ReactionSummaryDto(targetType.toUpperCase(), targetId, reactions.size(), countsByType);
    }
}
