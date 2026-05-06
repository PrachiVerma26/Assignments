package com.training.vehiclerentalsystem.controller;

import com.training.vehiclerentalsystem.dto.login.LoginRequest;
import com.training.vehiclerentalsystem.dto.login.LoginResponse;
import com.training.vehiclerentalsystem.dto.signup.SignupRequest;
import com.training.vehiclerentalsystem.dto.signup.SignupResponse;
import com.training.vehiclerentalsystem.enums.RoleType;
import com.training.vehiclerentalsystem.exceptions.InvalidCredentialsException;
import com.training.vehiclerentalsystem.exceptions.UserAlreadyExistsException;
import com.training.vehiclerentalsystem.repository.UserRepository;
import com.training.vehiclerentalsystem.service.AuthService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/* Tests auth controller endpoints(User signup (customer and admin), User login (customer and admin) */
@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    //mock dependencies
    @Mock
    private AuthService authService;
    @Mock
    private UserRepository userRepository;

    // inject dependencies to the service layer
    @InjectMocks
    private AuthController authController;
    private SignupRequest signupRequest;
    private SignupResponse signupResponse;
    private LoginRequest loginRequest;
    private LoginResponse loginResponse;

    // setup common test request and response data
    @BeforeEach
    void setUp() {
        // signup request data
        signupRequest = new SignupRequest();
        signupRequest.setEmail("ram@gmail.com");
        signupRequest.setPassword("ram123");
        signupRequest.setName("Ram Verma");
        signupRequest.setDrivingLicenseNumber("DL123456789");

        Set<RoleType> roles = new HashSet<>();
        roles.add(RoleType.CUSTOMER);

        // signup response data
        signupResponse = new SignupResponse();
        signupResponse.setUserId(UUID.randomUUID());
        signupResponse.setEmail("ram@gmail.com");
        signupResponse.setName("Ram Verma");
        signupResponse.setRoles(roles);

        // login request data
        loginRequest = new LoginRequest();
        loginRequest.setEmail("ram@gmail.com");
        loginRequest.setPassword("ram123");

        //login response data
        loginResponse = new LoginResponse();
        loginResponse.setToken("jwt-token");
        loginResponse.setMessage("Logged in successfully!");
        loginResponse.setEmail("ram@gmail.com");
        loginResponse.setRole("CUSTOMER");
    }

    // user signup should return CREATED status with user details
    @Test
    void signup_Success() {
        when(authService.signup(signupRequest)).thenReturn(signupResponse);

        ResponseEntity<SignupResponse> response = authController.signup(signupRequest);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("ram@gmail.com", response.getBody().getEmail());
        assertEquals("Ram Verma", response.getBody().getName());
        assertTrue(response.getBody().getRoles().contains(RoleType.CUSTOMER));
        verify(authService).signup(signupRequest);
    }

    // admin should return admin role
    @Test
    void signup_AdminRole() {
        signupRequest.setEmail("admin@rapidrental.com");
        Set<RoleType> adminRoles = new HashSet<>();
        adminRoles.add(RoleType.ADMIN);
        signupResponse.setEmail("admin@rapidrental.com");
        signupResponse.setRoles(adminRoles);

        when(authService.signup(signupRequest)).thenReturn(signupResponse);

        ResponseEntity<SignupResponse> response = authController.signup(signupRequest);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertTrue(response.getBody().getRoles().contains(RoleType.ADMIN));
    }

    // Test when user already exists
    @Test
    void signup_UserAlreadyExistsException() {
        when(authService.signup(signupRequest))
                .thenThrow(new UserAlreadyExistsException("User already exists"));

        assertThrows(UserAlreadyExistsException.class,
                () -> authController.signup(signupRequest));
        verify(authService).signup(signupRequest);
    }

    //test when driving license already exists
    @Test
    void signup_DrivingLicenseAlreadyExists() {
        when(authService.signup(signupRequest))
                .thenThrow(new UserAlreadyExistsException("Driving license number already exists"));

        assertThrows(UserAlreadyExistsException.class,
                () -> authController.signup(signupRequest));
    }

    // valid login should return token and user details
    @Test
    void login_Success() {
        when(authService.login(loginRequest)).thenReturn(loginResponse);

        ResponseEntity<LoginResponse> response = authController.login(loginRequest);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("jwt-token", response.getBody().getToken());
        assertEquals("Logged in successfully!", response.getBody().getMessage());
        assertEquals("ram@gmail.com", response.getBody().getEmail());
        assertEquals("CUSTOMER", response.getBody().getRole());
        verify(authService).login(loginRequest);
    }

    // admin login should return ADMIN role
    @Test
    void login_AdminUser() {
        loginRequest.setEmail("admin@rapidrental.com");
        loginResponse.setEmail("admin@rapidrental.com");
        loginResponse.setRole("ADMIN");

        when(authService.login(loginRequest)).thenReturn(loginResponse);

        ResponseEntity<LoginResponse> response = authController.login(loginRequest);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals("ADMIN", response.getBody().getRole());
    }

    // test login with invalid credentials
    @Test
    void login_InvalidCredentialsException() {
        when(authService.login(loginRequest))
                .thenThrow(new InvalidCredentialsException("Invalid email or password"));

        assertThrows(InvalidCredentialsException.class,
                () -> authController.login(loginRequest));
        verify(authService).login(loginRequest);
    }


    // test all login response fields
    @Test
    void login_CompleteResponseValidation() {
        when(authService.login(loginRequest)).thenReturn(loginResponse);

        ResponseEntity<LoginResponse> response = authController.login(loginRequest);

        LoginResponse body = response.getBody();
        assertNotNull(body.getToken());
        assertNotNull(body.getMessage());
        assertNotNull(body.getEmail());
        assertNotNull(body.getRole());
        assertTrue(body.getToken().length() > 0);
    }
}
