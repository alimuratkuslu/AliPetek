package com.game.alipetek.dto;

import com.game.alipetek.model.QuestionDifficultyEnum;
import lombok.Data;

@Data
public class CreateQuestionRequest {
    private String text;
    private String answer;
    private int points;
    private QuestionDifficultyEnum questionDifficultyEnum;
}
