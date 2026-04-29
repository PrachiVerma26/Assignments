package com.training.vehiclerentalsystem.mapper;

import com.training.vehiclerentalsystem.dto.signup.SignupRequest;
import com.training.vehiclerentalsystem.model.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public static User toEntity(SignupRequest SignupRequestDTO) {
        User user = new User();
        user.setName(SignupRequestDTO.getName());
        user.setEmail(SignupRequestDTO.getEmail());
        user.setPassword(SignupRequestDTO.getPassword());
        user.setPhoneNumber(SignupRequestDTO.getPhoneNumber());
        user.setAddress(SignupRequestDTO.getAddress());
        user.setDrivingLicenseNumber(SignupRequestDTO.getDrivingLicenseNumber());
        return user;
    }
}