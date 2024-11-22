package com.game.alipetek.controller;

import com.game.alipetek.dto.LocationUpdateRequest;
import com.game.alipetek.model.User;
import com.game.alipetek.model.UserLocation;
import com.game.alipetek.service.UserLocationService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/locations")
public class UserLocationController {

    private final UserLocationService locationService;

    public UserLocationController(UserLocationService locationService) {
        this.locationService = locationService;
    }

    @PostMapping("/update")
    public ResponseEntity<UserLocation> updateLocation(@RequestBody LocationUpdateRequest request) {
        return ResponseEntity.ok(locationService.updateLocation(request));
    }

    @PostMapping("/offline/{username}")
    public ResponseEntity<Void> setUserOffline(@PathVariable String username) {
        locationService.setUserOffline(username);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/online")
    public ResponseEntity<List<UserLocation>> getOnlineUsers() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User currentUser = (User) authentication.getPrincipal();

        //List<UserLocation> userLocations = locationService.getOnlineUsers();
        List<UserLocation> userLocations = locationService.getFriendOnlineUsers(currentUser);
        return ResponseEntity.ok(userLocations);
    }
}
