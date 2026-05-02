package com.training.vehiclerentalsystem.service.implementation;

import com.training.vehiclerentalsystem.dto.login.LoginRequest;
import com.training.vehiclerentalsystem.dto.login.LoginResponse;
import com.training.vehiclerentalsystem.dto.signup.SignupRequest;
import com.training.vehiclerentalsystem.dto.signup.SignupResponse;
import com.training.vehiclerentalsystem.enums.RoleType;
import com.training.vehiclerentalsystem.exceptions.InvalidCredentialsException;
import com.training.vehiclerentalsystem.exceptions.UserAlreadyExistsException;
import com.training.vehiclerentalsystem.mapper.UserMapper;
import com.training.vehiclerentalsystem.model.User;
import com.training.vehiclerentalsystem.repository.UserRepository;
import com.training.vehiclerentalsystem.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private UserMapper userMapper;
    @Mock
    private JwtUtil jwtUtil;

    @InjectMocks
    private AuthServiceImpl authService;

    private SignupRequest signupRequest;
    private LoginRequest loginRequest;
    private User user;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();

        signupRequest = new SignupRequest();
        signupRequest.setEmail("test@example.com");
        signupRequest.setPassword("password123");
        signupRequest.setName("John Doe");
        signupRequest.setDrivingLicenseNumber("DL123456789");
        signupRequest.setPhoneNumber("1234567890");

        loginRequest = new LoginRequest();
        loginRequest.setEmail("test@example.com");
        loginRequest.setPassword("password123");

        user = new User();
        user.setId(userId);
        user.setEmail("test@example.com");
        user.setPassword("encodedPassword");
        user.setName("John Doe");
        user.setRole(new HashSet<>());
    }

    @Test
    void signup_Success_Customer() {
        when(userRepository.existsByEmail(signupRequest.getEmail())).thenReturn(false);
        when(userRepository.existsByDrivingLicenseNumber(signupRequest.getDrivingLicenseNumber())).thenReturn(false);
        when(userMapper.toEntity(signupRequest)).thenReturn(user);
        when(passwordEncoder.encode(any())).thenReturn("encodedPassword");
        when(userRepository.save(user)).thenReturn(user);

        SignupResponse response = authService.signup(signupRequest);

        assertNotNull(response);
        assertEquals(userId, response.getUserId());
        assertEquals("test@example.com", response.getEmail());
        assertEquals("John Doe", response.getName());
        assertTrue(response.getRoles().contains(RoleType.CUSTOMER));
        verify(userRepository).save(user);
        assertEquals("encodedPassword", user.getPassword());
    }

    @Test
    void signup_Success_Admin() {
        signupRequest.setEmail("admin@rapidrental.com");
        user.setEmail("admin@rapidrental.com");

        when(userRepository.existsByEmail(signupRequest.getEmail())).thenReturn(false);
        when(userRepository.existsByDrivingLicenseNumber(signupRequest.getDrivingLicenseNumber())).thenReturn(false);
        when(userMapper.toEntity(signupRequest)).thenReturn(user);
        when(passwordEncoder.encode(any())).thenReturn("encodedPassword");
        when(userRepository.save(user)).thenReturn(user);

        SignupResponse response = authService.signup(signupRequest);

        assertNotNull(response);
        assertEquals("admin@rapidrental.com", response.getEmail());
        assertTrue(response.getRoles().contains(RoleType.ADMIN));
        assertTrue(user.getRole().contains(RoleType.ADMIN));
    }

    @Test
    void signup_EmailAlreadyExists() {
        when(userRepository.existsByEmail(signupRequest.getEmail())).thenReturn(true);

        UserAlreadyExistsException exception = assertThrows(UserAlreadyExistsException.class,
                () -> authService.signup(signupRequest));

        assertEquals("User already exists", exception.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    void signup_DrivingLicenseAlreadyExists() {
        when(userRepository.existsByEmail(signupRequest.getEmail())).thenReturn(false);
        when(userRepository.existsByDrivingLicenseNumber(signupRequest.getDrivingLicenseNumber())).thenReturn(true);

        UserAlreadyExistsException exception = assertThrows(UserAlreadyExistsException.class,
                () -> authService.signup(signupRequest));

        assertEquals("Driving license number already exists", exception.getMessage());
        verify(userRepository, never()).save(any());
    }

    @Test
    void signup_PasswordEncoded() {
        when(userRepository.existsByEmail(signupRequest.getEmail())).thenReturn(false);
        when(userRepository.existsByDrivingLicenseNumber(signupRequest.getDrivingLicenseNumber())).thenReturn(false);
        when(userMapper.toEntity(signupRequest)).thenReturn(user);
        when(passwordEncoder.encode(any())).thenReturn("encodedPassword123");
        when(userRepository.save(user)).thenReturn(user);

        authService.signup(signupRequest);

        verify(passwordEncoder).encode(any());
        assertEquals("encodedPassword123", user.getPassword());
    }

    @Test
    void login_Success() {
        Set<RoleType> roles = new HashSet<>();
        roles.add(RoleType.CUSTOMER);
        user.setRole(roles);

        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())).thenReturn(true);
        when(jwtUtil.generateToken(user)).thenReturn("jwt-token");

        LoginResponse response = authService.login(loginRequest);

        assertNotNull(response);
        assertEquals("jwt-token", response.getToken());
        assertEquals("Logged in successfully!", response.getMessage());
        assertEquals("test@example.com", response.getEmail());
        assertEquals("CUSTOMER", response.getRole());
    }

    @Test
    void login_Success_DefaultRole() {
        // User with no roles should default to CUSTOMER
        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())).thenReturn(true);
        when(jwtUtil.generateToken(user)).thenReturn("jwt-token");

        LoginResponse response = authService.login(loginRequest);

        assertEquals("CUSTOMER", response.getRole());
    }

    @Test
    void login_Success_AdminRole() {
        Set<RoleType> roles = new HashSet<>();
        roles.add(RoleType.ADMIN);
        user.setRole(roles);

        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())).thenReturn(true);
        when(jwtUtil.generateToken(user)).thenReturn("jwt-token");

        LoginResponse response = authService.login(loginRequest);

        assertEquals("ADMIN", response.getRole());
    }

    @Test
    void login_UserNotFound() {
        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.empty());

        InvalidCredentialsException exception = assertThrows(InvalidCredentialsException.class,
                () -> authService.login(loginRequest));

        assertEquals("Invalid email or password", exception.getMessage());
        verify(passwordEncoder, never()).matches(any(), any());
        verify(jwtUtil, never()).generateToken(any());
    }

    @Test
    void login_InvalidPassword() {
        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())).thenReturn(false);

        InvalidCredentialsException exception = assertThrows(InvalidCredentialsException.class,
                () -> authService.login(loginRequest));

        assertEquals("Invalid email or password", exception.getMessage());
        verify(jwtUtil, never()).generateToken(any());
    }

    @Test
    void login_TokenGenerated() {
        Set<RoleType> roles = new HashSet<>();
        roles.add(RoleType.CUSTOMER);
        user.setRole(roles);

        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())).thenReturn(true);
        when(jwtUtil.generateToken(user)).thenReturn("generated-jwt-token");

        LoginResponse response = authService.login(loginRequest);

        assertEquals("generated-jwt-token", response.getToken());
        verify(jwtUtil).generateToken(user);
    }

    @Test
    void signup_RoleAssignmentLogic() {
        // Test customer role assignment
        when(userRepository.existsByEmail(signupRequest.getEmail())).thenReturn(false);
        when(userRepository.existsByDrivingLicenseNumber(signupRequest.getDrivingLicenseNumber())).thenReturn(false);
        when(userMapper.toEntity(signupRequest)).thenReturn(user);
        when(passwordEncoder.encode(any())).thenReturn("encoded");
        when(userRepository.save(user)).thenReturn(user);

        authService.signup(signupRequest);

        assertTrue(user.getRole().contains(RoleType.CUSTOMER));
        assertFalse(user.getRole().contains(RoleType.ADMIN));
    }

    @Test
    void signup_AdminEmailRoleAssignment() {
        signupRequest.setEmail("admin@rapidrental.com");
        user.setEmail("admin@rapidrental.com");

        when(userRepository.existsByEmail(signupRequest.getEmail())).thenReturn(false);
        when(userRepository.existsByDrivingLicenseNumber(signupRequest.getDrivingLicenseNumber())).thenReturn(false);
        when(userMapper.toEntity(signupRequest)).thenReturn(user);
        when(passwordEncoder.encode(any())).thenReturn("encoded");
        when(userRepository.save(user)).thenReturn(user);

        authService.signup(signupRequest);

        assertTrue(user.getRole().contains(RoleType.ADMIN));
        assertFalse(user.getRole().contains(RoleType.CUSTOMER));
    }
}
