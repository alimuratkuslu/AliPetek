package com.game.alipetek.dto;

import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Getter
@Setter
public class JoinFriendsGameRequest {
    private String username;
    private String gameId;
    private String sessionId;
}
