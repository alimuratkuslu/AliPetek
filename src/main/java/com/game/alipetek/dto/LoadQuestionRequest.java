package com.game.alipetek.dto;

import lombok.Data;

@Data
public class LoadQuestionRequest {
    private Long gameId;
    private String letter;
}
