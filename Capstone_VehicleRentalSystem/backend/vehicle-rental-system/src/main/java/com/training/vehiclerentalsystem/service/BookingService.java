package com.training.vehiclerentalsystem.service;

import com.training.vehiclerentalsystem.dto.booking.BookingRequest;
import com.training.vehiclerentalsystem.dto.booking.BookingResponse;
import com.training.vehiclerentalsystem.enums.BookingStatus;

import java.util.List;
import java.util.UUID;

public interface BookingService {

    // Customer operations
    BookingResponse createBooking(BookingRequest bookingRequestDTO, String userEmail);
    List<BookingResponse> getBookingsByUser(String userEmail);
    BookingResponse getBookingById(UUID bookingId, String userEmail);
    BookingResponse cancelBooking(UUID bookingId, String userEmail);

    // Admin operations
    List<BookingResponse> getAllBookings();
    List<BookingResponse> getBookingsByStatus(BookingStatus status);
    BookingResponse getBookingByIdAdmin(UUID id);
}
