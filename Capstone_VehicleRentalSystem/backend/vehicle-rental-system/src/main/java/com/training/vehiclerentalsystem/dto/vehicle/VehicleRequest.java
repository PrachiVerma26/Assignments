package com.training.vehiclerentalsystem.dto.vehicle;

import com.training.vehiclerentalsystem.enums.VehicleStatus;
import com.training.vehiclerentalsystem.enums.VehicleType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VehicleRequest {

    @NotBlank(message = "Model name is required")
    private String model;

    @NotBlank(message = "Brand is required")
    private String brand;

    @NotNull(message = "Vehicle type is required")
    private VehicleType type;

    @NotBlank(message = "Registration number is required")
    private String registrationNumber;

    @Size(max = 200, message = "Description cannot exceed 200 characters")
    private String description;

    private VehicleStatus status = VehicleStatus.AVAILABLE;

    @NotNull(message = "Daily rental rate is required")
    @Positive(message = "Daily rental rate must be positive")
    private BigDecimal dailyRentalRate;

    private String profileUrl;

    @NotNull(message = "Location ID is required")
    private UUID locationId;
}
