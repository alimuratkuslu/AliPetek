package com.game.alipetek.service;

import com.game.alipetek.dto.LocationUpdateRequest;
import com.game.alipetek.model.User;
import com.game.alipetek.model.UserLocation;
import com.game.alipetek.repository.UserLocationRepository;
import com.game.alipetek.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserLocationService {

    private final UserLocationRepository locationRepository;
    private final UserRepository userRepository;

    public UserLocationService(UserLocationRepository locationRepository, UserRepository userRepository) {
        this.locationRepository = locationRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public UserLocation updateLocation(LocationUpdateRequest request) {
        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("User not found"));

        UserLocation location = locationRepository.findUserByUsername(request.getUsername())
                .orElse(new UserLocation());

        location.setUser(user);
        location.setLatitude(request.getLatitude());
        location.setLongitude(request.getLongitude());
        location.setLastLogin(LocalDateTime.now());
        location.setIsOnline(true);

        return locationRepository.save(location);
    }

    @Transactional
    public void setUserOffline(String username) {
        locationRepository.findUserByUsername(username)
                .ifPresent(location -> {
                    location.setIsOnline(false);
                    locationRepository.save(location);
                });
    }

    public List<UserLocation> getOnlineUsers() {

        return locationRepository.findAll().stream()
                .filter(location -> Boolean.TRUE.equals(location.getIsOnline()))
                .toList();
    }

    public List<UserLocation> getFriendOnlineUsers(User currentUser) {

        Set<User> friends = currentUser.getFriendsSet();

        List<User> filteredFriends = friends.stream().filter(u -> Boolean.TRUE.equals(u.isShareLocation()))
                .collect(Collectors.toList());

        return locationRepository.findAll().stream()
                .filter(ul -> Boolean.TRUE.equals(ul.getIsOnline()))
                .filter(ul -> filteredFriends.contains(ul.getUser()))
                .collect(Collectors.toList());
    }
}
