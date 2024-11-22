package com.game.alipetek.dto;

import lombok.Data;

@Data
public class GamePlay {
    private String username;
    private String userAnswer;
    private Long questionId;
    private Long gameId;
}
