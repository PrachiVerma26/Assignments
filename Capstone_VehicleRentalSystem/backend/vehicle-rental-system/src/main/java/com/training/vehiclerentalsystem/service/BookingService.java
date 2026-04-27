package com.training.vehiclerentalsystem.service;

import com.training.vehiclerentalsystem.dto.booking.BookingRequest;
import com.training.vehiclerentalsystem.dto.booking.BookingResponse;

import java.util.List;
import java.util.UUID;

public interface BookingService {

    BookingResponse createBooking(BookingRequest bookingRequestDTO, String userEmail);
    List<BookingResponse> getBookingsByUser(String userEmail);
    BookingResponse cancelBooking(UUID bookingId, String userEmail);
}
