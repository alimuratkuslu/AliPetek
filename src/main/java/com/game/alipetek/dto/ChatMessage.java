package com.game.alipetek.dto;

import lombok.Data;

@Data
public class ChatMessage {

    private String gameId;
    private String sender;
    private String content;
    private String timestamp;
}
