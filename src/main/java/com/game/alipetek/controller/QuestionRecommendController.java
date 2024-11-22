package com.game.alipetek.controller;

import com.game.alipetek.dto.SaveRecommendQuestionRequest;
import com.game.alipetek.model.RecommendQuestion;
import com.game.alipetek.model.User;
import com.game.alipetek.service.RecommendQuestionService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Slf4j
@RequestMapping("/api/recommend")
public class QuestionRecommendController {

    private final RecommendQuestionService recommendQuestionService;

    public QuestionRecommendController(RecommendQuestionService recommendQuestionService) {
        this.recommendQuestionService = recommendQuestionService;
    }

    @PostMapping("/create")
    public ResponseEntity<RecommendQuestion> saveRecommendQuestion(@RequestBody SaveRecommendQuestionRequest request) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        request.setUsername(currentUser.getUsername());

        return ResponseEntity.ok(recommendQuestionService.saveRecommendQuestion(request));
    }
}
