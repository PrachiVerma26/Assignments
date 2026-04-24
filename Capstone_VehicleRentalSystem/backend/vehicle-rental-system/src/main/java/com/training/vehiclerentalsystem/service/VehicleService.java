package com.training.vehiclerentalsystem.service;

import com.training.vehiclerentalsystem.dto.vehicle.VehicleRequest;
import com.training.vehiclerentalsystem.dto.vehicle.VehicleResponse;
import com.training.vehiclerentalsystem.enums.VehicleStatus;
import com.training.vehiclerentalsystem.enums.VehicleType;
import com.training.vehiclerentalsystem.model.Vehicle;

import java.util.List;
import java.util.UUID;

public interface VehicleService {
    VehicleResponse createVehicle(VehicleRequest request);
    VehicleResponse updateVehicle(UUID id, VehicleRequest request);
    void deleteVehicle(UUID id);

    // Public operations
    VehicleResponse findById(UUID id);
    List<VehicleResponse> findAll();
    List<VehicleResponse> filterVehicles(VehicleType type, VehicleStatus status, UUID locationId);
}
