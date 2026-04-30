package com.training.vehiclerentalsystem.dto.profile;

import lombok.Builder;
import lombok.Data;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class ProfileResponse {

    private UUID id;
    private String name;
    private String email;
    private String phoneNumber;
    private String address;
    private String drivingLicenseNumber;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}