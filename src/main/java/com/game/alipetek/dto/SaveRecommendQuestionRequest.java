package com.game.alipetek.dto;

import com.game.alipetek.model.QuestionDifficultyEnum;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class SaveRecommendQuestionRequest {

    private String username;
    private String text;
    private String answer;
    private Character letter;
    @Enumerated(EnumType.STRING)
    private QuestionDifficultyEnum questionDifficultyEnum;
    private int points;
}
