package com.training.vehiclerentalsystem.repository;

import com.training.vehiclerentalsystem.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BookingRepository  extends JpaRepository<Booking, UUID> {

    List<Booking> findByUser_Id(UUID userId);

    Optional<Booking> findByIdAndUser_Id(UUID bookingId, UUID userId);

    //overlapping booking check for a vehicle
    @Query("SELECT COUNT(b) > 0 FROM Booking b WHERE b.vehicle.id = :vehicleId AND " +
            "b.status IN('CONFIRMED', 'PENDING') AND " + "b.startDate <= :endDate AND b.endDate >= :startDate")
    boolean existsOverlappingBooking(UUID vehicleId, LocalDateTime startDate, LocalDateTime endDate);
}
