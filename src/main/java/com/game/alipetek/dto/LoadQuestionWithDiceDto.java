package com.game.alipetek.dto;

import com.game.alipetek.model.Game;
import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class LoadQuestionWithDiceDto {

    private int dice;
    private Game game;
}
