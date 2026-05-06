package com.training.vehiclerentalsystem.exceptions;

import com.training.vehiclerentalsystem.dto.error.ErrorResponse;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.*;
import org.springframework.web.bind.MethodArgumentNotValidException;

import static org.junit.jupiter.api.Assertions.*;

/* test class for global exceptional handler */
class GlobalExceptionalHandlerTest {

    // injecting dependencies
    @InjectMocks
    private GlobalExceptionalHandler handler;

    @BeforeEach
    void setUp() {
        handler = new GlobalExceptionalHandler();
    }

    // Handles UserAlreadyExistsException and returns CONFLICT status with correct message
    @Test
    void shouldHandleUserAlreadyExistsException() {
        UserAlreadyExistsException ex = new UserAlreadyExistsException("User already exists");

        ResponseEntity<ErrorResponse> response = handler.handleUserExists(ex);

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertEquals("User already exists", response.getBody().getMessage());
    }

    // handles validation errors and returns BAD_REQUEST with first field error message
    @Test
    void shouldHandleValidationException() {
        BindingResult bindingResult = new BeanPropertyBindingResult(new Object(), "object");
        bindingResult.addError(new FieldError("object", "name", "Name is required"));

        MethodArgumentNotValidException ex =
                new MethodArgumentNotValidException(null, bindingResult);

        ResponseEntity<ErrorResponse> response = handler.handleValidation(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Name is required", response.getBody().getMessage());
    }

    // handles VehicleNotFoundException and returns NOT_FOUND status
    @Test
    void shouldHandleVehicleNotFoundException() {
        VehicleNotFoundException ex = new VehicleNotFoundException("Vehicle not found");

        ResponseEntity<ErrorResponse> response = handler.handleVehicleNotFound(ex);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Vehicle not found", response.getBody().getMessage());
    }

    // handles BookingNotFoundException and returns NOT_FOUND status
    @Test
    void shouldHandleBookingNotFoundException() {
        BookingNotFoundException ex = new BookingNotFoundException("Booking not found");

        ResponseEntity<ErrorResponse> response = handler.handleBookingNotFound(ex);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Booking not found", response.getBody().getMessage());
    }

    // handles InvalidBookingException and returns BAD_REQUEST status
    @Test
    void shouldHandleInvalidBookingException() {
        InvalidBookingException ex = new InvalidBookingException("Invalid booking");

        ResponseEntity<ErrorResponse> response = handler.handleInvalidBooking(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Invalid booking", response.getBody().getMessage());
    }

    // handles BookingConflictException and returns CONFLICT status
    @Test
    void shouldHandleBookingConflictException() {
        BookingConflictException ex = new BookingConflictException("Booking conflict");

        ResponseEntity<ErrorResponse> response = handler.handleBookingConflict(ex);

        assertEquals(HttpStatus.CONFLICT, response.getStatusCode());
        assertEquals("Booking conflict", response.getBody().getMessage());
    }

    // // Handles LocationNotFoundException and returns NOT FOUND status
    @Test
    void shouldHandleLocationNotFoundException() {
        LocationNotFoundException ex = new LocationNotFoundException("Location not found");

        ResponseEntity<ErrorResponse> response = handler.handleLocationNotFound(ex);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Location not found", response.getBody().getMessage());
    }

    // handles ResourceNotFoundException and returns NOT_FOUND status
    @Test
    void shouldHandleResourceNotFoundException() {
        ResourceNotFoundException ex = new ResourceNotFoundException("Resource not found");

        ResponseEntity<ErrorResponse> response = handler.handleResourceNotFound(ex);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
        assertEquals("Resource not found", response.getBody().getMessage());
    }

    // handles VehicleDeletionNotAllowedException and returns BAD_REQUEST status
    @Test
    void shouldHandleVehicleDeletionNotAllowedException() {
        VehicleDeletionNotAllowedException ex =
                new VehicleDeletionNotAllowedException("Deletion not allowed");

        ResponseEntity<ErrorResponse> response =
                handler.handleVehicleDeletionNotAllowed(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Deletion not allowed", response.getBody().getMessage());
    }

    // handles generic exceptions and returns INTERNAL_SERVER_ERROR with message
    @Test
    void shouldHandleGlobalException() {
        Exception ex = new Exception("Internal error");

        ResponseEntity<ErrorResponse> response = handler.handleGlobalException(ex);

        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals("Internal error", response.getBody().getMessage());
    }

    // returns first validation error message when multiple field errors are present
    @Test
    void shouldHandleValidationException_withMultipleErrors_returnsFirstMessage() {
        BindingResult bindingResult = new BeanPropertyBindingResult(new Object(), "object");

        bindingResult.addError(new FieldError("object", "name", "Name is required"));
        bindingResult.addError(new FieldError("object", "email", "Email is invalid"));

        MethodArgumentNotValidException ex =
                new MethodArgumentNotValidException(null, bindingResult);

        ResponseEntity<ErrorResponse> response = handler.handleValidation(ex);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        assertEquals("Name is required", response.getBody().getMessage());
    }

    // Throws exception when validation error list is empty (edge case handling)
    @Test
    void shouldHandleValidationException_withNoErrors_shouldThrowException() {
        BindingResult bindingResult = new BeanPropertyBindingResult(new Object(), "object");

        MethodArgumentNotValidException ex =
                new MethodArgumentNotValidException(null, bindingResult);

        assertThrows(IndexOutOfBoundsException.class, () -> {
            handler.handleValidation(ex);
        });
    }

    // handles exception with null message and returns INTERNAL_SERVER_ERROR with null body message
    @Test
    void shouldHandleException_withNullMessage() {
        Exception ex = new Exception((String) null);
        ResponseEntity<ErrorResponse> response = handler.handleGlobalException(ex);
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertNull(response.getBody().getMessage());
    }

    // handles exception with empty message and returns INTERNAL_SERVER_ERROR with empty message
    @Test
    void shouldHandleException_withEmptyMessage() {
        Exception ex = new Exception("");
        ResponseEntity<ErrorResponse> response = handler.handleGlobalException(ex);
        assertEquals(HttpStatus.INTERNAL_SERVER_ERROR, response.getStatusCode());
        assertEquals("", response.getBody().getMessage());
    }
}