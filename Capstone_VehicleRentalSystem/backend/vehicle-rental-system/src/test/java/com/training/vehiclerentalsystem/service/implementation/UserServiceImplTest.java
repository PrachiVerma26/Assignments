package com.training.vehiclerentalsystem.service.implementation;

import com.training.vehiclerentalsystem.dto.profile.ProfileRequest;
import com.training.vehiclerentalsystem.dto.profile.ProfileResponse;
import com.training.vehiclerentalsystem.mapper.ProfileMapper;
import com.training.vehiclerentalsystem.model.User;
import com.training.vehiclerentalsystem.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

/* this class tests UserServiceImpl for profile-related operations
Fetch user profile (success + user not found)
Update user profile (success + user not found)
 */
@ExtendWith(MockitoExtension.class)
class UserServiceImplTest {

    //mock dependencies
    @Mock
    private UserRepository userRepository;

    @Mock
    private ProfileMapper profileMapper;

    //inject dependencies to the service layer
    @InjectMocks
    private UserServiceImpl userService;
    private User user;
    private ProfileRequest profileRequest;
    private ProfileResponse profileResponse;
    private String userEmail;

    // runs before each test to keep data consistent and avoid duplication
    @BeforeEach
    void setUp() {

        userEmail = "test@gmail.com";

        user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail(userEmail);
        user.setName("Ram Verma");
        user.setPhoneNumber("1234567890");

        profileRequest = ProfileRequest.builder()
                .name("Ram Verma")
                .phoneNumber("9876543210")
                .address("Indore")
                .drivingLicenseNumber("DL987654325221")
                .build();

        profileResponse = ProfileResponse.builder()
                .email(userEmail)
                .name("Ram Verma")
                .build();
    }

    // if user email is valid then successfully fetch the user profile
    @Test
    void getUserProfile_Success() {

        // Mock repository and mapper behavior
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(user));
        when(profileMapper.toProfileResponse(user)).thenReturn(profileResponse);

        ProfileResponse result = userService.getUserProfile(userEmail);

        // Assertions
        assertNotNull(result);
        assertEquals(userEmail, result.getEmail());

        // Verify mapper is used
        verify(profileMapper).toProfileResponse(user);
    }

    //if the user does not exist or found then exception should be thrown
    @Test
    void getUserProfile_UserNotFound() {
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.empty());

        // Expect exception
        assertThrows(UsernameNotFoundException.class,
                () -> userService.getUserProfile(userEmail));
    }

    //user profile should be successfully updated
    @Test
    void updateUserProfile_Success() {

        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(user));
        when(userRepository.save(any(User.class))).thenReturn(user);
        when(profileMapper.toProfileResponse(user)).thenReturn(profileResponse);
        ProfileResponse result = userService.updateUserProfile(userEmail, profileRequest);
        assertNotNull(result);

        // Verify updated fields
        assertEquals("Ram Verma", user.getName());
        assertEquals("9876543210", user.getPhoneNumber());
        assertEquals("Indore", user.getAddress());
        assertEquals("DL987654325221", user.getDrivingLicenseNumber());

        verify(userRepository).save(user);
    }

    //if the user does not exist then profile should be updated
    @Test
    void updateUserProfile_UserNotFound() {
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.empty());
        assertThrows(RuntimeException.class,
                () -> userService.updateUserProfile(userEmail, profileRequest));
    }
}