package com.game.alipetek.controller;


import com.game.alipetek.dto.UpdateUserAvatarDto;
import com.game.alipetek.model.Game;
import com.game.alipetek.model.User;
import com.game.alipetek.repository.UserRepository;
import com.game.alipetek.service.GameService;
import com.game.alipetek.service.UserService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@Slf4j
@RequestMapping("/api/profile")
public class ProfileController {

    private final UserService userService;
    private final GameService gameService;

    public ProfileController(UserService userService, GameService gameService) {
        this.userService = userService;
        this.gameService = gameService;
    }

    @GetMapping
    public ResponseEntity<User> getUserProfile() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        return ResponseEntity.ok(userService.getUserByUsername(currentUser.getUsername()));
    }

    @GetMapping("/prevGames")
    public ResponseEntity<List<Game>> getPreviousGames() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        return ResponseEntity.ok(gameService.getPreviousGamesByUsername(currentUser.getUsername()));
    }

    @PostMapping("/updateAvatar")
    public ResponseEntity<User> updateUserAvatar(@RequestBody UpdateUserAvatarDto updateUserAvatarDto) {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();
        currentUser.setAvatarUrl(updateUserAvatarDto.getAvatarUrl());
        userService.saveUser(currentUser);
        return ResponseEntity.ok(currentUser);
    }
}
