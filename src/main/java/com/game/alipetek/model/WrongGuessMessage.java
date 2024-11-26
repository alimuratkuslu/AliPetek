package com.game.alipetek.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class WrongGuessMessage {
    private Long gameId;
    private String player;
}
