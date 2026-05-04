package com.training.vehiclerentalsystem.service;

import com.training.vehiclerentalsystem.dto.vehicle.VehicleRequest;
import com.training.vehiclerentalsystem.dto.vehicle.VehicleResponse;
import com.training.vehiclerentalsystem.enums.VehicleStatus;
import com.training.vehiclerentalsystem.enums.VehicleType;

import java.util.List;
import java.util.UUID;

public interface VehicleService {
    VehicleResponse createVehicle(VehicleRequest vehicleRequestDTO);
    VehicleResponse updateVehicle(UUID id, VehicleRequest vehicleRequestDTO);
    void deleteVehicle(UUID id);

    // public operations
    VehicleResponse findById(UUID id);
    List<VehicleResponse> findAll();
    List<VehicleResponse> filterVehicles(VehicleType type, VehicleStatus status, UUID locationId);
    List<VehicleResponse> findAvailableVehicles(java.time.LocalDateTime startDate, java.time.LocalDateTime endDate, VehicleType type, UUID locationId);

}
