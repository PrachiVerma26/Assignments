package com.training.vehiclerentalsystem.service;

import com.training.vehiclerentalsystem.dto.signup.SignupResponse;
import com.training.vehiclerentalsystem.dto.login.LoginRequest;
import com.training.vehiclerentalsystem.dto.signup.SignupRequest;
import com.training.vehiclerentalsystem.dto.login.LoginResponse;
import com.training.vehiclerentalsystem.enums.RoleType;
import com.training.vehiclerentalsystem.mapper.UserMapper;
import com.training.vehiclerentalsystem.model.User;
import com.training.vehiclerentalsystem.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

/*
 * Service responsible for handling authentication and user registration logic.
 * - Register new users with validation and default role assignment
 * - Authenticate users by verifying credentials
 * - Passwords are stored in encrypted format using BCrypt
 * - Role-based authorization will be implemented using JWT in future
 */

@Service
public class AuthServiceImpl implements AuthService{

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final UserMapper userMapper;
    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    //constructor injection
    AuthServiceImpl(UserRepository userRepository, PasswordEncoder passwordEncoder, UserMapper userMapper){
        this.userRepository=userRepository;
        this.passwordEncoder=passwordEncoder;
        this.userMapper=userMapper;
    }

    @Override
    public SignupResponse signup(SignupRequest dto) {

        //Check if user exists
        if (userRepository.existsByEmail(dto.getEmail())) {
            log.error("User already exists...");
            throw new RuntimeException("User already exists");
        }

        User user = UserMapper.toEntity(dto);
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        user.getRole().add(RoleType.CUSTOMER);

        userRepository.save(user);
        log.info("Customer created successfully!");
        return new SignupResponse(
                user.getId(),
                user.getEmail(),
                user.getName(),
                user.getRole()
        );
    }

    @Override
    public LoginResponse login(LoginRequest dto){

        //fetch user
        User user = userRepository.findByEmail(dto.getEmail())
                .orElseThrow(() ->{
                    log.error("Invalid Credentials....enter correct email or password");
                     return new RuntimeException("Invalid email or password");
                });

            //comparing password
            if (!passwordEncoder.matches(dto.getPassword(), user.getPassword())) {
                log.error("Invalid Credentials....enter correct email or password");
                throw new RuntimeException("Invalid email or password");
            }
            log.info("User logged in successfully!");
            return new LoginResponse(
                    "Logged in successfully!",
                    user.getEmail(),
                    user.getRole()
            );
        }
}

