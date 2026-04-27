package com.training.vehiclerentalsystem.controller;
import com.training.vehiclerentalsystem.constants.BookingConstants;
import com.training.vehiclerentalsystem.dto.booking.BookingRequest;
import com.training.vehiclerentalsystem.dto.booking.BookingResponse;
import com.training.vehiclerentalsystem.service.BookingService;
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
 * handles CRUD operations for booking(customer only)
 */
@RestController
@RequestMapping(BookingConstants.CUSTOMER_BOOKINGS_BASE)
public class BookingController {
    private final BookingService bookingService;
    private static final Logger log = LoggerFactory.getLogger(BookingController.class);

    public BookingController(BookingService bookingService) {
        this.bookingService = bookingService;
    }
    private String getUserEmail(Authentication authentication) {
        return authentication.getName();
    }

    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(@Valid @RequestBody BookingRequest bookingrequestDTO,
            Authentication authentication) {
        String userEmail = getUserEmail(authentication);
        log.info("Create booking API called by {}", userEmail);
        BookingResponse response = bookingService.createBooking(bookingrequestDTO, userEmail);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<BookingResponse>> getBookings(Authentication authentication) {
        String userEmail = getUserEmail(authentication);
        log.info("Get booking history API called by {}", userEmail);
        List<BookingResponse> bookings =
                bookingService.getBookingsByUser(userEmail);
        return ResponseEntity.ok(bookings);
    }

    @PutMapping(BookingConstants.CANCEL)
    public ResponseEntity<BookingResponse> cancelBooking(@PathVariable(BookingConstants.ID) UUID id, Authentication authentication) {
        String userEmail = getUserEmail(authentication);
        log.info("Cancel booking API called by {} for booking {}", userEmail, id);
        BookingResponse response = bookingService.cancelBooking(id, userEmail);
        return ResponseEntity.ok(response);
    }
}