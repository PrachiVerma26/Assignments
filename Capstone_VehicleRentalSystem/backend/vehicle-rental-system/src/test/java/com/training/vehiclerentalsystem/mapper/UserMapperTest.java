package com.training.vehiclerentalsystem.mapper;

import com.training.vehiclerentalsystem.dto.signup.SignupRequest;
import com.training.vehiclerentalsystem.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/* Test class for UserMapper ( Tests conversion between SignupRequest DTO and User Entity) */
@ExtendWith(MockitoExtension.class)
class UserMapperTest {

    @InjectMocks
    private UserMapper userMapper;

    private SignupRequest signupRequest;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();

        // Setup signup request
        signupRequest = new SignupRequest();
        signupRequest.setName("Ram Verma");
        signupRequest.setEmail("Ram@gmail.com");
        signupRequest.setPassword("password123");
        signupRequest.setPhoneNumber("1234567890");
        signupRequest.setAddress("123 Main St");
        signupRequest.setDrivingLicenseNumber("DL123456789");
    }

    /* Convert SignupRequest to User Entity */
    @Test
    void toEntity_Success() {
        User result = userMapper.toEntity(signupRequest);

        assertNotNull(result);
        assertEquals(signupRequest.getName(), result.getName());
        assertEquals(signupRequest.getEmail(), result.getEmail());
        assertEquals(signupRequest.getPassword(), result.getPassword());
        assertEquals(signupRequest.getPhoneNumber(), result.getPhoneNumber());
        assertEquals(signupRequest.getAddress(), result.getAddress());
        assertEquals(signupRequest.getDrivingLicenseNumber(), result.getDrivingLicenseNumber());
    }

    /* Convert SignupRequest with minimal fields */
    @Test
    void toEntity_MinimalFields() {
        SignupRequest minimalRequest = new SignupRequest();
        minimalRequest.setName("Jyoti");
        minimalRequest.setEmail("jyoti@gmail.com");
        minimalRequest.setPassword("pass");
        minimalRequest.setDrivingLicenseNumber("DL987654321");

        User result = userMapper.toEntity(minimalRequest);

        assertNotNull(result);
        assertEquals("Jyoti", result.getName());
        assertEquals("jyoti@gmail.com", result.getEmail());
        assertEquals("pass", result.getPassword());
        assertEquals("DL987654321", result.getDrivingLicenseNumber());
    }

    /* Verify user entity is not null after mapping */
    @Test
    void toEntity_ResultNotNull() {
        User result = userMapper.toEntity(signupRequest);
        assertNotNull(result);
    }

    /* Verify user entity has all required fields populated */
    @Test
    void toEntity_VerifyAllFieldsPopulated() {
        User result = userMapper.toEntity(signupRequest);
        
        assertNotNull(result.getName());
        assertNotNull(result.getEmail());
        assertNotNull(result.getPassword());
        assertNotNull(result.getDrivingLicenseNumber());
    }
}
