package com.training.vehiclerentalsystem.repository;

import com.training.vehiclerentalsystem.enums.VehicleStatus;
import com.training.vehiclerentalsystem.enums.VehicleType;
import com.training.vehiclerentalsystem.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public interface VehicleRepository extends JpaRepository<Vehicle, UUID> {

    List<Vehicle> findByType(VehicleType type);

    List<Vehicle> findByStatus(VehicleStatus status);

    List<Vehicle> findByLocationId(UUID locationId);

    boolean existsByRegistrationNumber(String registrationNumber);

    boolean existsByRegistrationNumberAndIdNot(String registrationNumber, UUID id);

    // Combined filter methods
    List<Vehicle> findByTypeAndStatus(VehicleType type, VehicleStatus status);

    List<Vehicle> findByTypeAndLocationId(VehicleType type, UUID locationId);

    List<Vehicle> findByStatusAndLocationId(VehicleStatus status, UUID locationId);

    List<Vehicle> findByTypeAndStatusAndLocationId(VehicleType type, VehicleStatus status, UUID locationId);

    @Query("""
    SELECT v FROM Vehicle v
    WHERE v.status = VehicleStatus.AVAILABLE
    AND (:type IS NULL OR v.type = :type)
    AND (:locationId IS NULL OR v.location.id = :locationId)
    AND v.id NOT IN (
        SELECT b.vehicle.id FROM Booking b
        WHERE b.status = BookingStatus.CONFIRMED
        AND (
            b.startDate < :endDate
            AND b.endDate > :startDate
        )
    )
""")
    List<Vehicle> findAvailableVehicles(
            @Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate, @Param("type") VehicleType type, @Param("locationId") UUID locationId);
}