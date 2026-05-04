package com.training.vehiclerentalsystem.controller;

import com.training.vehiclerentalsystem.constants.AuthConstants;
import com.training.vehiclerentalsystem.dto.signup.SignupResponse;
import com.training.vehiclerentalsystem.dto.login.LoginRequest;
import com.training.vehiclerentalsystem.dto.signup.SignupRequest;
import com.training.vehiclerentalsystem.dto.login.LoginResponse;
import com.training.vehiclerentalsystem.service.AuthService;

import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

/*
 REST controller responsible for handling authentication-related APIs
 endpoints are: user registration :(signup), user authentication (login)
 */

 @RestController
public class AuthController {

    private final AuthService authService;
    private static final Logger log = LoggerFactory.getLogger(AuthController.class);

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping(AuthConstants.SIGNUP_PATH)
    public ResponseEntity<SignupResponse> signup(@RequestBody @Valid SignupRequest signupRequestDTO) {
        log.info("Signup API called with email: {}", signupRequestDTO.getEmail());
        SignupResponse response = authService.signup(signupRequestDTO);
        log.info("Registration successful.");
        return ResponseEntity.status(HttpStatus.CREATED).body(response);

    }
    @PostMapping(AuthConstants.LOGIN_PATH)
    public ResponseEntity<LoginResponse> login(@RequestBody @Valid LoginRequest loginRequestDTO) {
        LoginResponse response = authService.login(loginRequestDTO);
        log.info("Login successfully with email: {}",loginRequestDTO.getEmail());
        return ResponseEntity.status(HttpStatus.OK).body(response);
    }
}
