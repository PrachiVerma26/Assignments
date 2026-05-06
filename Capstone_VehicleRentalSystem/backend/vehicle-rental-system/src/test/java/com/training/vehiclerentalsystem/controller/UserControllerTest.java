package com.training.vehiclerentalsystem.controller;

import com.training.vehiclerentalsystem.dto.profile.ProfileRequest;
import com.training.vehiclerentalsystem.dto.profile.ProfileResponse;
import com.training.vehiclerentalsystem.service.UserService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/* testing user controller endpoints */
@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    //mock dependencies
    @Mock
    private UserService userService;

    @Mock
    private Authentication authentication;

    // inject dependencies to the service layer
    @InjectMocks
    private UserController userController;
    private ProfileRequest profileRequest;
    private ProfileResponse profileResponse;
    private String userEmail;

    // runs before each test case
    @BeforeEach
    void setUp() {

        // Mock logged-in user email
        userEmail = "ram@gmail.com";
        when(authentication.getName()).thenReturn(userEmail);

        profileRequest = ProfileRequest.builder()
                .name("John Doe")
                .phoneNumber("1234567890")
                .build();

        // Response returned from service
        profileResponse = ProfileResponse.builder()
                .email(userEmail)
                .name("Ram Verma")
                .build();
    }

    @Test
    void getUserProfile_Success() {

        // mock service response
        when(userService.getUserProfile(userEmail)).thenReturn(profileResponse);

        ResponseEntity<ProfileResponse> response = userController.getUserProfile(authentication);

        // verify response
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(userEmail, response.getBody().getEmail());

        // verify service call
        verify(userService).getUserProfile(userEmail);
    }

    // update user profile successfully
    @Test
    void updateUserProfile_Success() {

        // Mock service response
        when(userService.updateUserProfile(userEmail, profileRequest))
                .thenReturn(profileResponse);

        ResponseEntity<ProfileResponse> response =
                userController.updateUserProfile(authentication, profileRequest);

        // Verify response
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(userEmail, response.getBody().getEmail());

        // Verify service call
        verify(userService).updateUserProfile(userEmail, profileRequest);
    }
}