package com.training.vehiclerentalsystem.controller;

import com.training.vehiclerentalsystem.dto.booking.BookingRequest;
import com.training.vehiclerentalsystem.dto.booking.BookingResponse;
import com.training.vehiclerentalsystem.enums.BookingStatus;
import com.training.vehiclerentalsystem.enums.PaymentMethod;
import com.training.vehiclerentalsystem.exceptions.BookingConflictException;
import com.training.vehiclerentalsystem.exceptions.BookingNotFoundException;
import com.training.vehiclerentalsystem.exceptions.InvalidBookingException;
import com.training.vehiclerentalsystem.service.BookingService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;

import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/* tests Booking Controller endpoints:
Customer booking operations (create, fetch, cancel)
Admin booking operations (fetch all, filter, get by ID)
*/
@ExtendWith(MockitoExtension.class)
class BookingControllerTest {

    // mock dependencies
    @Mock
    private BookingService bookingService;
    @Mock
    private Authentication authentication;

    // inject dependencies into servide layer
    @InjectMocks
    private BookingController bookingController;
    private BookingRequest bookingRequest;
    private BookingResponse bookingResponse;
    private UUID bookingId;
    private String userEmail;

    // setup for common test data
    @BeforeEach
    void setUp() {

        // generates random id for testing mock data
        bookingId = UUID.randomUUID();
        userEmail = "ram@gmail.com";

        bookingRequest = new BookingRequest();
        bookingRequest.setVehicleId(UUID.randomUUID());
        bookingRequest.setStartDate(LocalDateTime.now().plusDays(1));
        bookingRequest.setEndDate(LocalDateTime.now().plusDays(3));
        bookingRequest.setPaymentMethod(PaymentMethod.CARD);

        bookingResponse = new BookingResponse();
        bookingResponse.setId(bookingId);
        bookingResponse.setStatus(BookingStatus.CONFIRMED);
        bookingResponse.setPaymentMethod(PaymentMethod.CARD);
    }

    // booking should be created successfully
    @Test
    void createBooking_Success() {
        when(authentication.getName()).thenReturn(userEmail);
        when(bookingService.createBooking(bookingRequest, userEmail))
                .thenReturn(bookingResponse);

        ResponseEntity<BookingResponse> response =
                bookingController.createBooking(bookingRequest, authentication);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(bookingId, response.getBody().getId());

        verify(bookingService).createBooking(bookingRequest, userEmail);
    }

    // exception should be thrown for invalid booking input
    @Test
    void createBooking_InvalidBookingException() {

        when(authentication.getName()).thenReturn(userEmail);
        when(bookingService.createBooking(any(), any()))
                .thenThrow(new InvalidBookingException("Invalid booking"));

        assertThrows(InvalidBookingException.class,
                () -> bookingController.createBooking(bookingRequest, authentication));
    }

    // exception should be thrown if booking conflict occurs
    @Test
    void createBooking_BookingConflictException() {

        when(authentication.getName()).thenReturn(userEmail);
        when(bookingService.createBooking(any(), any()))
                .thenThrow(new BookingConflictException("Conflict"));

        assertThrows(BookingConflictException.class,
                () -> bookingController.createBooking(bookingRequest, authentication));
    }

    // exception should be thrown if user is not found
    @Test
    void createBooking_UserNotFound() {

        when(authentication.getName()).thenReturn(userEmail);
        when(bookingService.createBooking(any(), any()))
                .thenThrow(new UsernameNotFoundException("User not found"));

        assertThrows(UsernameNotFoundException.class,
                () -> bookingController.createBooking(bookingRequest, authentication));
    }

    //  should return list of bookings for user
    @Test
    void getBookings_Success() {

        when(authentication.getName()).thenReturn(userEmail);
        when(bookingService.getBookingsByUser(userEmail))
                .thenReturn(List.of(bookingResponse));

        ResponseEntity<List<BookingResponse>> response =
                bookingController.getBookings(authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());

        verify(bookingService).getBookingsByUser(userEmail);
    }

    // should return empty list if no bookings exist
    @Test
    void getBookings_EmptyList() {

        when(authentication.getName()).thenReturn(userEmail);
        when(bookingService.getBookingsByUser(userEmail))
                .thenReturn(List.of());

        ResponseEntity<List<BookingResponse>> response =
                bookingController.getBookings(authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody().isEmpty());
    }

    // should return booking by ID for user
    @Test
    void getUserBookingById_Success() {

        when(authentication.getName()).thenReturn(userEmail);
        when(bookingService.getBookingById(bookingId, userEmail))
                .thenReturn(bookingResponse);

        ResponseEntity<BookingResponse> response =
                bookingController.getUserBookingById(bookingId, authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(bookingId, response.getBody().getId());

        verify(bookingService).getBookingById(bookingId, userEmail);
    }

    // exception should be thrown if booking not found
    @Test
    void getUserBookingById_NotFound() {

        when(authentication.getName()).thenReturn(userEmail);
        when(bookingService.getBookingById(any(), any()))
                .thenThrow(new BookingNotFoundException("Not found"));

        assertThrows(BookingNotFoundException.class,
                () -> bookingController.getUserBookingById(bookingId, authentication));
    }

    // booking should be cancelled successfully
    @Test
    void cancelBooking_Success() {

        when(authentication.getName()).thenReturn(userEmail);
        when(bookingService.cancelBooking(bookingId, userEmail))
                .thenReturn(bookingResponse);

        ResponseEntity<BookingResponse> response =
                bookingController.cancelBooking(bookingId, authentication);

        assertEquals(HttpStatus.OK, response.getStatusCode());

        verify(bookingService).cancelBooking(bookingId, userEmail);
    }

    // exception when booking is already cancelled or invalid
    @Test
    void cancelBooking_Conflict() {

        when(authentication.getName()).thenReturn(userEmail);
        when(bookingService.cancelBooking(any(), any()))
                .thenThrow(new BookingConflictException("Already cancelled"));

        assertThrows(BookingConflictException.class,
                () -> bookingController.cancelBooking(bookingId, authentication));
    }

    // admin booking test cases
    // should return all bookings without filter
    @Test
    void getAllBookings_NoFilter() {

        when(bookingService.getAllBookings())
                .thenReturn(List.of(bookingResponse));

        ResponseEntity<List<BookingResponse>> response =
                bookingController.getAllBookings(null);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());

        verify(bookingService).getAllBookings();
    }

    //should return bookings filtered by status
    @Test
    void getAllBookings_WithFilter() {

        when(bookingService.getBookingsByStatus(BookingStatus.CONFIRMED))
                .thenReturn(List.of(bookingResponse));

        ResponseEntity<List<BookingResponse>> response =
                bookingController.getAllBookings(BookingStatus.CONFIRMED);

        assertEquals(HttpStatus.OK, response.getStatusCode());

        verify(bookingService).getBookingsByStatus(BookingStatus.CONFIRMED);
    }

    // admin should get booking by ID
    @Test
    void getBookingByIdAdmin_Success() {

        when(bookingService.getBookingByIdAdmin(bookingId))
                .thenReturn(bookingResponse);

        ResponseEntity<BookingResponse> response =
                bookingController.getBookingByIdAdmin(bookingId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(bookingId, response.getBody().getId());

        verify(bookingService).getBookingByIdAdmin(bookingId);
    }

    // exception if booking not found for admin
    @Test
    void getBookingByIdAdmin_NotFound() {

        when(bookingService.getBookingByIdAdmin(any()))
                .thenThrow(new BookingNotFoundException("Not found"));

        assertThrows(BookingNotFoundException.class,
                () -> bookingController.getBookingByIdAdmin(bookingId));
    }

    // test when user tries to access another user's booking
    @Test
    void getUserBookingById_UnauthorizedAccess() {
        when(authentication.getName()).thenReturn(userEmail);
        when(bookingService.getBookingById(bookingId, userEmail))
                .thenThrow(new BookingNotFoundException("Booking not found for user"));

        assertThrows(BookingNotFoundException.class,
                () -> bookingController.getUserBookingById(bookingId, authentication));
    }


    //  booking should work for all payment methods
    @Test
    void createBooking_WithAllPaymentMethods() {
        when(authentication.getName()).thenReturn(userEmail);
        for (PaymentMethod method : PaymentMethod.values()) {
            bookingRequest.setPaymentMethod(method);
            bookingResponse.setPaymentMethod(method);
            when(bookingService.createBooking(any(), any()))
                    .thenReturn(bookingResponse);
            ResponseEntity<BookingResponse> response =
                    bookingController.createBooking(bookingRequest, authentication);

            assertEquals(method, response.getBody().getPaymentMethod());
        }
    }
}