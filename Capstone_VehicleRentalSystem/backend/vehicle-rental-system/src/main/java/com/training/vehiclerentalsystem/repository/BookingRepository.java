package com.training.vehiclerentalsystem.repository;

import com.training.vehiclerentalsystem.model.Booking;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BookingRepository  extends JpaRepository<Booking, Long> {
}
