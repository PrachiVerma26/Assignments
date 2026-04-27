package com.training.vehiclerentalsystem.repository;

import com.training.vehiclerentalsystem.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface BookingRepository  extends JpaRepository<Booking, UUID> {

    List<Booking> findByUser_Id(UUID userId);

    Optional<Booking> findByIdAndUser_Id(UUID bookingId, UUID userId);
}
