package com.training.vehiclerentalsystem.service.implementation;

import com.training.vehiclerentalsystem.dto.profile.ProfileRequest;
import com.training.vehiclerentalsystem.dto.profile.ProfileResponse;
import com.training.vehiclerentalsystem.mapper.ProfileMapper;
import com.training.vehiclerentalsystem.model.User;
import com.training.vehiclerentalsystem.repository.UserRepository;
import com.training.vehiclerentalsystem.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final ProfileMapper profileMapper;
    private static final Logger log = LoggerFactory.getLogger(UserServiceImpl.class);

    public UserServiceImpl(UserRepository userRepository, ProfileMapper profileMapper) {
        this.userRepository = userRepository;
        this.profileMapper = profileMapper;
    }

    @Override
    @Transactional
    public ProfileResponse getUserProfile(String email) {
        log.info("Fetching user profile for email: {}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.error("User not found with email: {}", email);
                    return new UsernameNotFoundException("User not found with email: " + email);
                });
        return profileMapper.toProfileResponse(user);
    }

    @Override
    public ProfileResponse updateUserProfile(String email, ProfileRequest profileRequestDTO) {
        log.info("Updating profile for email: {}", email);
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.error("User not found with email: {}", email);
                    return new RuntimeException("User not found with email: " + email);
                });
        // Update allowed fields only
        user.setName(profileRequestDTO.getName());
        user.setPhoneNumber(profileRequestDTO.getPhoneNumber());
        user.setAddress(profileRequestDTO.getAddress());
        user.setDrivingLicenseNumber(profileRequestDTO.getDrivingLicenseNumber());
        User updatedUser = userRepository.save(user);
        return profileMapper.toProfileResponse(updatedUser);
    }
}