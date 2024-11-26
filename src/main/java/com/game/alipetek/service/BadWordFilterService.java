package com.game.alipetek.service;

import org.springframework.stereotype.Service;

import java.util.Arrays;
import java.util.HashSet;
import java.util.Set;

@Service
public class BadWordFilterService {

    private final Set<String> badWords;

    public BadWordFilterService() {
        badWords = new HashSet<>(Arrays.asList(

        ));
    }

    public String filterMessage(String message) {
        if (message == null || message.trim().isEmpty()) {
            return message;
        }

        String[] words = message.split("\\s+");
        StringBuilder filteredMessage = new StringBuilder();

        for (String word : words) {
            if (badWords.contains(word.toLowerCase())) {
                filteredMessage.append("***");
            } else {
                filteredMessage.append(word);
            }
            filteredMessage.append(" ");
        }

        return filteredMessage.toString().trim();
    }
}
