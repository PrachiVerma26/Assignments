package com.training.vehiclerentalsystem.dto.profile;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ProfileRequest {

    @NotBlank(message = "Name is required")
    @Pattern(regexp = "^[A-Za-z]+(?:\\s[A-Za-z]+)*$", message="name cannot be less than 3 characters")
    private String name;

    @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be 10 digits")
    private String phoneNumber;

    private String address;

    @Pattern(regexp = "^DL\\d{14}$",
            message = "Driving license must start with 'DL' followed by exactly 15 digits" )
    private String drivingLicenseNumber;
}