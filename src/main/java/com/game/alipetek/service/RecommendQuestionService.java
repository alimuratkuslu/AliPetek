package com.game.alipetek.service;

import com.game.alipetek.dto.SaveRecommendQuestionRequest;
import com.game.alipetek.model.RecommendQuestion;
import com.game.alipetek.repository.RecommendQuestionRepository;
import org.springframework.stereotype.Service;

@Service
public class RecommendQuestionService {

    private final RecommendQuestionRepository recommendQuestionRepository;

    public RecommendQuestionService(RecommendQuestionRepository recommendQuestionRepository) {
        this.recommendQuestionRepository = recommendQuestionRepository;
    }

    public RecommendQuestion saveRecommendQuestion(SaveRecommendQuestionRequest request) {

        RecommendQuestion recommendQuestion = RecommendQuestion.builder()
                .recommendedUser(request.getUsername())
                .text(request.getText())
                .answer(request.getAnswer())
                .points(request.getPoints())
                .questionDifficultyEnum(request.getQuestionDifficultyEnum())
                .letter(request.getLetter())
                .build();

        recommendQuestionRepository.save(recommendQuestion);

        return recommendQuestion;
    }
}
