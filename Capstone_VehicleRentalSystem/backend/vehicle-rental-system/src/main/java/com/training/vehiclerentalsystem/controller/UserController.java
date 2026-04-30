package com.training.vehiclerentalsystem.controller;

import com.training.vehiclerentalsystem.constants.ApiConstants;
import com.training.vehiclerentalsystem.dto.profile.ProfileRequest;
import com.training.vehiclerentalsystem.dto.profile.ProfileResponse;
import com.training.vehiclerentalsystem.service.UserService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping(ApiConstants.PROFILE_API)
public class UserController {

    private final UserService userService;
    private static final Logger log = LoggerFactory.getLogger(UserController.class);

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    public ResponseEntity<ProfileResponse> getUserProfile(Authentication authentication) {
        String email = authentication.getName();
        log.info("Fetching profile for user: {}", email);
        ProfileResponse response = userService.getUserProfile(email);
        return ResponseEntity.ok(response);
    }

    @PutMapping
    public ResponseEntity<ProfileResponse> updateUserProfile(
            Authentication authentication,
            @Valid @RequestBody ProfileRequest request) {
        String email = authentication.getName();
        log.info("Updating profile for user: {}", email);
        ProfileResponse response = userService.updateUserProfile(email, request);
        return ResponseEntity.ok(response);
    }
}