package com.training.vehiclerentalsystem.service;

import com.training.vehiclerentalsystem.dto.signup.SignupResponse;
import com.training.vehiclerentalsystem.dto.login.LoginRequest;
import com.training.vehiclerentalsystem.dto.signup.SignupRequest;
import com.training.vehiclerentalsystem.dto.login.LoginResponse;

public interface AuthService {

    SignupResponse signup(SignupRequest signupRequestDTO);
    LoginResponse login(LoginRequest loginRequestDTO);
}
