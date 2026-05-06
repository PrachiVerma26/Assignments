package com.training.vehiclerentalsystem.controller;
import com.training.vehiclerentalsystem.constants.BookingConstants;
import com.training.vehiclerentalsystem.dto.booking.BookingRequest;
import com.training.vehiclerentalsystem.dto.booking.BookingResponse;
import com.training.vehiclerentalsystem.enums.BookingStatus;
import com.training.vehiclerentalsystem.service.BookingService;
import jakarta.transaction.Transactional;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

/**
 REST controller for booking operations (customer and admin)
 Handles CRUD operations for bookings
 */
@RestController
public class BookingController {
    private final BookingService bookingService;
    private static final Logger log = LoggerFactory.getLogger(BookingController.class);

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }
    
    private String getUserEmail(Authentication authentication) {
        return authentication.getName();
    }

    /*customer endpoints */
    @Transactional
    @PostMapping(BookingConstants.CUSTOMER_BOOKINGS_API)
    public ResponseEntity<BookingResponse> createBooking(@Valid @RequestBody BookingRequest bookingRequestDTO,
            Authentication authentication) {
        String userEmail = getUserEmail(authentication);
        log.info("Create booking API called by {}", userEmail);
        BookingResponse response = bookingService.createBooking(bookingRequestDTO, userEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping(BookingConstants.CUSTOMER_BOOKINGS_API)
    public ResponseEntity<List<BookingResponse>> getBookings(Authentication authentication) {
        String userEmail = getUserEmail(authentication);
        log.info("Get booking history API called by {}", userEmail);
        List<BookingResponse> bookings =
                bookingService.getBookingsByUser(userEmail);
        return ResponseEntity.ok(bookings);
    }

    @GetMapping(BookingConstants.CUSTOMER_BOOKINGS_API + BookingConstants.BY_ID)
    public ResponseEntity<BookingResponse> getUserBookingById(
        @PathVariable UUID id,
        Authentication authentication) {

        String email = authentication.getName();
        log.info("Get booking by ID (customer) API called for ID: {}", id);
        BookingResponse response = bookingService.getBookingById(id, email);
        return ResponseEntity.ok(response);
    }

    @PatchMapping(BookingConstants.CUSTOMER_BOOKINGS_API + BookingConstants.CANCEL)
    public ResponseEntity<BookingResponse> cancelBooking( @PathVariable(BookingConstants.ID) UUID id, Authentication authentication) {
        String userEmail = getUserEmail(authentication);
        log.info("Cancel booking API called by {} for booking {}", userEmail, id);
        BookingResponse response = bookingService.cancelBooking(id, userEmail);
        return ResponseEntity.ok(response);
    }

    /*admin endpoints */
    @GetMapping(BookingConstants.ADMIN_BOOKINGS_API)
    public ResponseEntity<List<BookingResponse>> getAllBookings(
            @RequestParam(value = "status", required = false) BookingStatus status) {
        log.info("Get all bookings API called by admin with status filter: {}", status);
        List<BookingResponse> bookings;
        if (status != null) {
            log.info("Filtering bookings by status: {}", status);
            bookings = bookingService.getBookingsByStatus(status);
        } else {
            log.info("Fetching all bookings without filter");
            bookings = bookingService.getAllBookings();
        }
        log.info("Retrieved {} bookings for admin", bookings.size());
        return ResponseEntity.ok(bookings);
    }

    @GetMapping(BookingConstants.ADMIN_BOOKINGS_API + BookingConstants.BY_ID)
    public ResponseEntity<BookingResponse> getBookingByIdAdmin(@PathVariable UUID id) {
        log.info("Get booking by ID (admin) API called with ID: {}", id);
        BookingResponse booking = bookingService.getBookingByIdAdmin(id);
        log.info("Booking found: {}", id);
        return ResponseEntity.ok(booking);
    }
}