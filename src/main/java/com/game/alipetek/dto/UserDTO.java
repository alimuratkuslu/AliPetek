package com.game.alipetek.dto;

import com.game.alipetek.model.User;
import lombok.Data;

import java.util.Set;
import java.util.stream.Collectors;

@Data
public class UserDTO {

    private Long id;
    private String username;
    private String email;
    private int score;
    private Set<FriendDTO> friends;

    public UserDTO(User user) {
        this.id = user.getId();
        this.username = user.getUsername();
        this.email = user.getEmail();
        this.score = user.getScore();
        this.friends = user.getFriendsSet().stream()
                .map(friend -> new FriendDTO(
                        friend.getId(),
                        friend.getUsername(),
                        friend.getScore(),
                        friend.getAvatarUrl()))
                .collect(Collectors.toSet());
    }
}
