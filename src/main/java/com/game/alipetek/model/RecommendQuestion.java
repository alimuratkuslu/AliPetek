package com.game.alipetek.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@Builder
@Table(name = "recommend_questions")
@AllArgsConstructor
@NoArgsConstructor
public class RecommendQuestion {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "id", nullable = false)
    private Long id;

    private String text;
    private String answer;
    private Character letter;
    @Enumerated(EnumType.STRING)
    private QuestionDifficultyEnum questionDifficultyEnum;
    private int points;
    private String recommendedUser;
}
