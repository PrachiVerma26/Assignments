package com.training.vehiclerentalsystem.repository;

import com.training.vehiclerentalsystem.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
}
