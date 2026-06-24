package com.example.expensetracker.controller;

import com.example.expensetracker.security.UserDetailsImpl;
import com.example.expensetracker.service.AiService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@CrossOrigin(origins = "*", maxAge = 3600)
@RestController
@RequestMapping("/api/ai")
public class AiController {

    @Autowired
    private AiService aiService;

    private String getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        return userDetails.getId();
    }

    @GetMapping("/insights")
    @PreAuthorize("hasAnyRole('NORMAL', 'PREMIUM', 'ADMIN')")
    public ResponseEntity<Map<String, Object>> getAiInsights() {
        Map<String, Object> insights = aiService.getInsights(getCurrentUserId());
        return ResponseEntity.ok(insights);
    }

    @GetMapping("/analyze")
    @PreAuthorize("hasAnyRole('NORMAL', 'PREMIUM', 'ADMIN')")
    public ResponseEntity<Map<String, String>> getCustomAnalysis(
            @RequestParam("type") String type,
            @RequestHeader(value = "X-Gemini-Key", required = false) String clientApiKey) {
        String analysisResult = aiService.getCustomAnalysis(getCurrentUserId(), type, clientApiKey);
        return ResponseEntity.ok(Map.of("analysis", analysisResult));
    }

    @PostMapping("/query")
    @PreAuthorize("hasAnyRole('NORMAL', 'PREMIUM', 'ADMIN')")
    public ResponseEntity<Map<String, String>> askUserQuestion(@RequestBody Map<String, String> body) {
        String question = body.get("question");
        if (question == null || question.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Question cannot be empty"));
        }
        String answer = aiService.answerQuestion(getCurrentUserId(), question);
        return ResponseEntity.ok(Map.of("answer", answer));
    }
}
