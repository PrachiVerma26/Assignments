package com.training.vehiclerentalsystem.service;

import com.training.vehiclerentalsystem.dto.profile.ProfileRequest;
import com.training.vehiclerentalsystem.dto.profile.ProfileResponse;


public interface UserService {

    ProfileResponse getUserProfile(String email);
    ProfileResponse updateUserProfile(String email, ProfileRequest profileRequestDTO);
}