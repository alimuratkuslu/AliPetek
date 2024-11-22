package com.game.alipetek.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class CreateGameRequest {
    private String sessionId;
}
