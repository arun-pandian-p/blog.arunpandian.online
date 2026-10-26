package com.arunpandian.blog.controller;

import com.arunpandian.blog.dto.reaction.ReactionRequest;
import com.arunpandian.blog.dto.reaction.ReactionSummaryDto;
import com.arunpandian.blog.service.ReactionService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reactions")
public class ReactionController {

    private final ReactionService reactionService;

    public ReactionController(ReactionService reactionService) {
        this.reactionService = reactionService;
    }

    @PostMapping
    public ResponseEntity<ReactionSummaryDto> addReaction(@Valid @RequestBody ReactionRequest request) {
        ReactionSummaryDto summary = reactionService.addReaction(request);
        return ResponseEntity.ok(summary);
    }

    @GetMapping
    public ResponseEntity<ReactionSummaryDto> getReactions(
            @RequestParam String targetType,
            @RequestParam String targetId) {
        ReactionSummaryDto summary = reactionService.getSummary(targetType, targetId);
        return ResponseEntity.ok(summary);
    }
}
