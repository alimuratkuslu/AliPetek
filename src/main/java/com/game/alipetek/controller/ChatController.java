package com.game.alipetek.controller;

import com.game.alipetek.dto.ChatMessage;
import com.game.alipetek.service.BadWordFilterService;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Controller
public class ChatController {

    private final BadWordFilterService badWordFilterService;

    public ChatController(BadWordFilterService badWordFilterService) {
        this.badWordFilterService = badWordFilterService;
    }

    @MessageMapping("/chat/{gameId}")
    @SendTo("/topic/chat/{gameId}")
    public ChatMessage handleChat(ChatMessage message, @DestinationVariable String gameId) {
        String filteredContent = badWordFilterService.filterMessage(message.getContent());
        message.setContent(filteredContent);

        message.setGameId(gameId);
        message.setTimestamp(LocalDateTime.now().format(DateTimeFormatter.ofPattern("HH:mm")));
        return message;
    }
}
