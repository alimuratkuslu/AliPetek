package com.game.alipetek.dto;

import lombok.Data;

@Data
public class FriendDTO {

    private Long id;
    private String username;
    private int score;
    private String avatarUrl;

    public FriendDTO(Long id, String username, int score, String avatarUrl) {
        this.id = id;
        this.username = username;
        this.score = score;
        this.avatarUrl = avatarUrl;
    }
}
