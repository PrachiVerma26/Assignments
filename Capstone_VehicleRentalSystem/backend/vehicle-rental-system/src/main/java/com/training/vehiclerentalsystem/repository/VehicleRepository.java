package com.training.vehiclerentalsystem.repository;

import com.training.vehiclerentalsystem.enums.VehicleStatus;
import com.training.vehiclerentalsystem.enums.VehicleType;
import com.training.vehiclerentalsystem.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface VehicleRepository extends JpaRepository<Vehicle, UUID> {

    List<Vehicle> findByType(VehicleType type);
    List<Vehicle> findByStatus(VehicleStatus status);
    List<Vehicle> findByLocationId(UUID locationId);

    // Combined filter methods
    List<Vehicle> findByTypeAndStatus(VehicleType type, VehicleStatus status);
    List<Vehicle> findByTypeAndLocationId(VehicleType type, UUID locationId);
    List<Vehicle> findByStatusAndLocationId(VehicleStatus status, UUID locationId);
    List<Vehicle> findByTypeAndStatusAndLocationId(VehicleType type, VehicleStatus status, UUID locationId);
}
