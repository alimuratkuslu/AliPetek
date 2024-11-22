package com.game.alipetek.controller;

import com.game.alipetek.dto.AddFriendRequest;
import com.game.alipetek.dto.CreateUserRequest;
import com.game.alipetek.model.User;
import com.game.alipetek.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Slf4j
@RequestMapping("/api/user")
public class UserController {

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/create")
    public ResponseEntity<User> createUser(@RequestBody CreateUserRequest createUserRequest) {
        return ResponseEntity.ok(userService.createUser(createUserRequest));
    }

    @PostMapping("/addFriend")
    public ResponseEntity<User> addFriend(@RequestBody AddFriendRequest addFriendRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        log.info("add friend request: {}", currentUser.getUsername());
        return ResponseEntity.ok(userService.addFriend(addFriendRequest.getUsername(), currentUser.getUsername()));
    }

    @PostMapping("/removeFriend")
    public ResponseEntity<User> removeFriend(@RequestBody AddFriendRequest addFriendRequest) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        log.info("remove friend request: {}", currentUser.getUsername());
        return ResponseEntity.ok(userService.removeFriend(addFriendRequest.getUsername(), currentUser.getUsername()));
    }

    @GetMapping("/getAllUsers")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/getAllUsersByScore")
    public ResponseEntity<List<User>> getAllUsersOrderByScore() {
        return ResponseEntity.ok(userService.getAllUsersOrderByScore());
    }

    @GetMapping("/profile")
    public ResponseEntity<User> getUserProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        return ResponseEntity.ok(currentUser);
    }

    @PostMapping("/sharing-preference")
    public ResponseEntity<Boolean> updateLocationSharingPreference(@RequestParam boolean enabled) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        boolean updated = userService.updatedUserLocationPreference(currentUser.getUsername(), enabled);
        return ResponseEntity.ok(updated);
    }

    @GetMapping("/sharing-preference")
    public ResponseEntity<Boolean> getLocationSharingPreference() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        return ResponseEntity.ok(currentUser.isShareLocation());
    }
}
