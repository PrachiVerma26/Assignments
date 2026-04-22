package com.training.vehiclerentalsystem.controller;

import com.training.vehiclerentalsystem.dto.signup.SignupResponse;
import com.training.vehiclerentalsystem.dto.login.LoginRequest;
import com.training.vehiclerentalsystem.dto.signup.SignupRequest;
import com.training.vehiclerentalsystem.dto.login.LoginResponse;
import com.training.vehiclerentalsystem.repository.UserRepository;
import com.training.vehiclerentalsystem.service.AuthService;

import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller responsible for handling authentication-related APIs
 * endpoints are
 * - user registration :(signup)
 * - user authentication (login)
 */

 @RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final UserRepository userRepository;
    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    public AuthController(AuthService authService, UserRepository userRepository) {
        this.authService = authService;
        this.userRepository=userRepository;
    }

    @PostMapping("/signup")
    public ResponseEntity<SignupResponse> signup(@RequestBody @Valid SignupRequest dto) {
        log.info("Signup API called with email: {}", dto.getEmail());

        SignupResponse response = authService.signup(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);

    }
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(@RequestBody @Valid LoginRequest dto) {

        LoginResponse response = authService.login(dto);
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }
}
