package com.training.vehiclerentalsystem.repository;

import com.training.vehiclerentalsystem.model.Booking;
import com.training.vehiclerentalsystem.enums.BookingStatus;
import com.training.vehiclerentalsystem.model.Vehicle;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BookingRepository  extends JpaRepository<Booking, UUID> {

    List<Booking> findByUser_Id(UUID userId);
    Optional<Booking> findByIdAndUser_Id(UUID bookingId, UUID userId);
    List<Booking> findByStatus(BookingStatus status);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT v FROM Vehicle v WHERE v.id = :vehicleId")
    Optional<Vehicle> findVehicleForUpdate(UUID vehicleId);

    //overlapping booking check for a vehicle
    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.vehicle.id = :vehicleId AND " +
            "b.status = 'CONFIRMED' AND " + "b.startDate < :endDate AND b.endDate > :startDate")
    boolean existsOverlappingBooking(UUID vehicleId, LocalDateTime startDate, LocalDateTime endDate);
}
