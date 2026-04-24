package com.training.vehiclerentalsystem.dto.vehicle;

import com.training.vehiclerentalsystem.enums.VehicleStatus;
import com.training.vehiclerentalsystem.enums.VehicleType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class VehicleResponse {

    private UUID id;
    private String model;
    private String brand;
    private VehicleType type;
    private VehicleStatus status;
    private BigDecimal dailyRentalRate;
    private String profileUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    // Location details (nested)
    private LocationInfo location;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class LocationInfo {
        private UUID id;
        private String address;
        private String city;
        private String state;
        private String pincode;
    }
}
