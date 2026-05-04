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

/* This class tests AuthServiceImpl for signup and login functionality.
 Signup (customer + admin + validation failures)
 Login (success + failure cases + role handling)
 Role assignment logic
 JWT token generation
*/
@ExtendWith(MockitoExtension.class)
class AuthServiceImplTest {

    // mocking external dependencies
    @Mock
    private UserRepository userRepository;
    @Mock
    private PasswordEncoder passwordEncoder;
    @Mock
    private UserMapper userMapper;
    @Mock
    private JwtUtil jwtUtil;

    // injecting mock into service
    @InjectMocks
    private AuthServiceImpl authService;
    private SignupRequest signupRequest;
    private LoginRequest loginRequest;
    private User user;
    private UUID userId;

    // runs before each test to keep data consistent and avoid duplication
    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();

        signupRequest = new SignupRequest();
        signupRequest.setEmail("ram@gmail.com");
        signupRequest.setPassword("Ram123");
        signupRequest.setName("Ram Verma");
        signupRequest.setDrivingLicenseNumber("DL123456789");
        signupRequest.setPhoneNumber("1234567890");

        loginRequest = new LoginRequest();
        loginRequest.setEmail("ram@gmail.com");
        loginRequest.setPassword("Ram123");

        user = new User();
        user.setId(userId);
        user.setEmail("ram@gmail.com");
        user.setPassword("encodedPassword");
        user.setName("Ram Verma");
        user.setRole(new HashSet<>());
    }

    // 1. valid signup should create CUSTOMER user
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
        assertEquals("ram@gmail.com", response.getEmail());
        assertEquals("Ram Verma", response.getName());
        assertTrue(response.getRoles().contains(RoleType.CUSTOMER));
        verify(userRepository).save(user);
        assertEquals("encodedPassword", user.getPassword());
    }

    //Admin email should assign ADMIN role
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

    // signup should fail if email already exists
    @Test
    void signup_EmailAlreadyExists() {
        when(userRepository.existsByEmail(signupRequest.getEmail())).thenReturn(true);

        UserAlreadyExistsException exception = assertThrows(UserAlreadyExistsException.class,
                () -> authService.signup(signupRequest));

        assertEquals("User already exists", exception.getMessage());
        verify(userRepository, never()).save(any());
    }

    //signup should fail if driving license is already exists
    @Test
    void signup_DrivingLicenseAlreadyExists() {
        when(userRepository.existsByEmail(signupRequest.getEmail())).thenReturn(false);
        when(userRepository.existsByDrivingLicenseNumber(signupRequest.getDrivingLicenseNumber())).thenReturn(true);

        UserAlreadyExistsException exception = assertThrows(UserAlreadyExistsException.class,
                () -> authService.signup(signupRequest));

        assertEquals("Driving license number already exists", exception.getMessage());
        verify(userRepository, never()).save(any());
    }

    // valid credentials should return JWT token
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
        assertEquals("ram@gmail.com", response.getEmail());
        assertEquals("CUSTOMER", response.getRole());
    }

    // if user has no roles, system assigns CUSTOMER by default
    @Test
    void login_Success_DefaultRole() {
        // User with no roles should be set to default as CUSTOMER
        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())).thenReturn(true);
        when(jwtUtil.generateToken(user)).thenReturn("jwt-token");

        LoginResponse response = authService.login(loginRequest);

        assertEquals("CUSTOMER", response.getRole());
    }

    // If user has ADMIN role, response should reflect ADMIN
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

    // login should fail if user does not exist
    @Test
    void login_UserNotFound() {
        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.empty());

        InvalidCredentialsException exception = assertThrows(InvalidCredentialsException.class,
                () -> authService.login(loginRequest));

        assertEquals("Invalid email or password", exception.getMessage());
        verify(passwordEncoder, never()).matches(any(), any());
        verify(jwtUtil, never()).generateToken(any());
    }

    // login should fail if password is incorrect
    @Test
    void login_InvalidPassword() {
        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())).thenReturn(false);

        InvalidCredentialsException exception = assertThrows(InvalidCredentialsException.class,
                () -> authService.login(loginRequest));

        assertEquals("Invalid email or password", exception.getMessage());
        verify(jwtUtil, never()).generateToken(any());
    }

    // verifying that JWT token is generated and returned correctly
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

    // test case for checking that the password entered is matched with the password entered during signup
    @Test
    void login_PasswordMatched() {
        Set<RoleType> roles = new HashSet<>();
        roles.add(RoleType.CUSTOMER);
        user.setRole(roles);

        when(userRepository.findByEmail(loginRequest.getEmail())).thenReturn(Optional.of(user));
        when(passwordEncoder.matches(loginRequest.getPassword(), user.getPassword())).thenReturn(true);
        when(jwtUtil.generateToken(user)).thenReturn("jwt-token");

        LoginResponse response = authService.login(loginRequest);

        assertNotNull(response.getToken());
        verify(passwordEncoder).matches(loginRequest.getPassword(), user.getPassword());
    }


    // default signup assigns CUSTOMER role only
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

    // admin email assigns ADMIN role only (not CUSTOMER)
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
