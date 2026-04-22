package com.training.vehiclerentalsystem.mapper;

import com.training.vehiclerentalsystem.dto.auth.SignupRequest;
import com.training.vehiclerentalsystem.model.User;
import org.springframework.stereotype.Component;

@Component
public class UserMapper {

    public static User toEntity(SignupRequest dto) {
        User user = new User();

        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPassword(dto.getPassword());
        user.setPhoneNumber(dto.getPhoneNumber());
        user.setAddress(dto.getAddress());

        return user;
    }
}