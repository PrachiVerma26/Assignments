package com.training.vehiclerentalsystem.mapper;

import com.training.vehiclerentalsystem.dto.profile.ProfileResponse;
import com.training.vehiclerentalsystem.model.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/* Test class for ProfileMapper( tests conversion between User Entity and ProfileResponse DTO)*/
@ExtendWith(MockitoExtension.class)
class ProfileMapperTest {

    //injecting dependencies
    @InjectMocks
    private ProfileMapper profileMapper;
    private User user;
    private UUID userId;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();

        // Setup user
        user = new User();
        user.setId(userId);
        user.setName("Ram Verma");
        user.setEmail("ram@gmail.com");
        user.setPhoneNumber("1234567890");
        user.setAddress("123 Main St");
        user.setDrivingLicenseNumber("DL123456789");
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());
    }

    /* Convert User Entity to ProfileResponse DTO */
    @Test
    void toProfileResponse_Success() {
        ProfileResponse result = profileMapper.toProfileResponse(user);

        assertNotNull(result);
        assertEquals(user.getId(), result.getId());
        assertEquals(user.getName(), result.getName());
        assertEquals(user.getEmail(), result.getEmail());
        assertEquals(user.getPhoneNumber(), result.getPhoneNumber());
        assertEquals(user.getAddress(), result.getAddress());
        assertEquals(user.getDrivingLicenseNumber(), result.getDrivingLicenseNumber());
    }

    /* Convert User with all fields to ProfileResponse */
    @Test
    void toProfileResponse_AllFieldsMapped() {
        ProfileResponse result = profileMapper.toProfileResponse(user);

        assertNotNull(result);
        assertNotNull(result.getId());
        assertNotNull(result.getName());
        assertNotNull(result.getEmail());
        assertNotNull(result.getPhoneNumber());
        assertNotNull(result.getAddress());
        assertNotNull(result.getDrivingLicenseNumber());
        assertNotNull(result.getCreatedAt());
        assertNotNull(result.getUpdatedAt());
    }

    /* Verify name is correctly mapped */
    @Test
    void toProfileResponse_VerifyName() {
        ProfileResponse result = profileMapper.toProfileResponse(user);
        assertEquals("Ram Verma", result.getName());
    }

    /* verify email is correctly mapped */
    @Test
    void toProfileResponse_VerifyEmail() {
        ProfileResponse result = profileMapper.toProfileResponse(user);
        assertEquals("ram@gmail.com", result.getEmail());
    }

    /* verify phone number is correctly mapped */
    @Test
    void toProfileResponse_VerifyPhoneNumber() {
        ProfileResponse result = profileMapper.toProfileResponse(user);
        assertEquals("1234567890", result.getPhoneNumber());
    }

    /* Verify address is correctly mapped */
    @Test
    void toProfileResponse_VerifyAddress() {
        ProfileResponse result = profileMapper.toProfileResponse(user);
        assertEquals("123 Main St", result.getAddress());
    }

    /* Verify driving license number is correctly mapped */
    @Test
    void toProfileResponse_VerifyDrivingLicenseNumber() {
        ProfileResponse result = profileMapper.toProfileResponse(user);
        assertEquals("DL123456789", result.getDrivingLicenseNumber());
    }
}