package com.training.vehiclerentalsystem.mapper;

import com.training.vehiclerentalsystem.dto.profile.ProfileResponse;
import com.training.vehiclerentalsystem.model.User;
import org.springframework.stereotype.Component;

@Component
public class ProfileMapper {

    public ProfileResponse toProfileResponse(User user) {
        if (user == null) {
            throw new IllegalArgumentException("User cannot be null");
        }

        return ProfileResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .phoneNumber(user.getPhoneNumber())
                .address(user.getAddress())
                .drivingLicenseNumber(user.getDrivingLicenseNumber())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();
    }
}