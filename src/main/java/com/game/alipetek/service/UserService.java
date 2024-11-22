package com.game.alipetek.service;

import com.game.alipetek.dto.CreateUserRequest;
import com.game.alipetek.model.Game;
import com.game.alipetek.model.User;
import com.game.alipetek.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // TODO: Add CRUD Operations
    // TODO: Leaderboard, list users with highest scores
    // TODO: Leaderboard, list users with highest wins

    public User getUserByUsername(String username) {
        return userRepository.findByUsername(username).get();
    }

    public void setDisconnectScore(User user) {
        user.setScore(user.getScore() + 1000);
        userRepository.save(user);
    }

    public User createUser(CreateUserRequest createUserRequest) {
        if (createUserRequest == null) {
            // TODO: Exception Handling
            return null;
        }

        if (createUserRequest.getUsername().isBlank()) {
            // TODO: Exception Handling
            return null;
        }

        User user = User.builder()
                .username(createUserRequest.getUsername())
                .score(0)
                .friendsSet(new HashSet<>())
                .shareLocation(false)
                .build();

        userRepository.save(user);
        return user;
    }

    public User addFriend(String friendUsername, String sessionUsername) {
        User user = userRepository.findByUsername(sessionUsername).get();
        User friend = userRepository.findByUsername(friendUsername).get();

        // TODO: Check if user already has friend

        user.getFriendsSet().add(friend);
        friend.getFriendsSet().add(user);

        userRepository.save(user);
        userRepository.save(friend);

        return user;
    }

    public User removeFriend(String friendUsername, String sessionUsername) {
        User user = userRepository.findByUsername(sessionUsername).get();
        User friend = userRepository.findByUsername(friendUsername).get();

        user.getFriendsSet().remove(friend);
        friend.getFriendsSet().remove(user);

        userRepository.save(user);
        userRepository.save(friend);

        return user;
    }

    public boolean updatedUserLocationPreference(String username, boolean enabled) {
        User currentUser = userRepository.findByUsername(username).orElse(null);
        currentUser.setShareLocation(enabled);
        userRepository.save(currentUser);

        return enabled;
    }

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public void saveUser(User user) {
        userRepository.save(user);
    }

    public List<User> getAllUsersOrderByScore() {
        return userRepository.findAllUsersOrderByScore();
    }
}
