package com.game.alipetek.controller;

import com.game.alipetek.dto.ChatMessage;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Controller
public class ChatController {

    @MessageMapping("/chat/{gameId}")
    @SendTo("/topic/chat/{gameId}")
    public ChatMessage handleChat(ChatMessage message, @DestinationVariable String gameId) {
        message.setGameId(gameId);
        message.setTimestamp(LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm")));
        return message;
    }
}
