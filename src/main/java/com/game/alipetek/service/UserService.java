package com.game.alipetek.service;

import com.game.alipetek.dto.CreateUserRequest;
import com.game.alipetek.model.FriendRequest;
import com.game.alipetek.model.User;
import com.game.alipetek.repository.FriendRequestRepository;
import com.game.alipetek.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final FriendRequestRepository friendRequestRepository;

    public UserService(UserRepository userRepository, FriendRequestRepository friendRequestRepository) {
        this.userRepository = userRepository;
        this.friendRequestRepository = friendRequestRepository;
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

    public void sendFriendRequest(String senderUsername, String receiverUsername) {
        User sender = userRepository.findByUsername(senderUsername)
                .orElseThrow(() -> new RuntimeException("Sender not found"));
        User receiver = userRepository.findByUsername(receiverUsername)
                .orElseThrow(() -> new RuntimeException("Receiver not found"));

        FriendRequest request = new FriendRequest();
        request.setSender(sender);
        request.setReceiver(receiver);
        request.setAccepted(false);
        friendRequestRepository.save(request);
    }

    @Transactional
    public void acceptFriendRequest(Long requestId) {
        FriendRequest request = friendRequestRepository.findById(requestId)
                .orElseThrow(() -> new RuntimeException("Friend request not found"));

        User sender = request.getSender();
        User receiver = request.getReceiver();
        sender.getFriendsSet().add(receiver);
        receiver.getFriendsSet().add(sender);

        userRepository.save(sender);

        request.setAccepted(true);
        friendRequestRepository.save(request);
        //userRepository.save(receiver);
    }

    public void denyFriendRequest(Long requestId) {
        friendRequestRepository.deleteById(requestId);
    }

    public List<FriendRequest> getFriendRequestsForUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return friendRequestRepository.findByReceiver(user);
    }

    public User addFriend(String friendUsername, String sessionUsername) {
        User user = userRepository.findByUsername(sessionUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));
        User friend = userRepository.findByUsername(friendUsername)
                .orElseThrow(() -> new RuntimeException("Friend not found"));

        if (user.getFriendsSet().contains(friend)) {
            throw new RuntimeException("Users are already friends");
        }

        if (user.getId().equals(friend.getId())) {
            throw new RuntimeException("Cannot add yourself as a friend");
        }

        user.getFriendsSet().add(friend);

        userRepository.save(user);

        return user;
    }

    public User removeFriend(String friendUsername, String sessionUsername) {
        User user = userRepository.findByUsername(sessionUsername)
                .orElseThrow(() -> new RuntimeException("User not found"));
        User friend = userRepository.findByUsername(friendUsername)
                .orElseThrow(() -> new RuntimeException("Friend not found"));

        user.getFriendsSet().remove(friend);
        friend.getFriendsSet().remove(user);

        userRepository.save(user);
        userRepository.save(friend);

        return user;
    }

    public boolean updatedUserLocationPreference(String username, boolean enabled) {
        User currentUser = userRepository.findByUsername(username).orElse(null);
        if (currentUser != null) {
            currentUser.setShareLocation(enabled);
        }
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
