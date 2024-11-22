package com.game.alipetek.controller;

import com.game.alipetek.dto.CreateQuestionRequest;
import com.game.alipetek.model.Question;
import com.game.alipetek.service.QuestionService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@Slf4j
@RequestMapping("/api/question")
public class QuestionController {

    private final QuestionService questionService;

    public QuestionController(QuestionService questionService) {
        this.questionService = questionService;
    }

    @PostMapping("/create")
    public ResponseEntity<Question> createQuestion(@RequestBody CreateQuestionRequest createQuestionRequest) {
        return ResponseEntity.ok(questionService.createQuestion(createQuestionRequest));
    }
}
