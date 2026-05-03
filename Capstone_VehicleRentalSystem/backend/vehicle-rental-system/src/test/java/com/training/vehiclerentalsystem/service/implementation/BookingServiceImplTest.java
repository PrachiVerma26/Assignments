package com.training.vehiclerentalsystem.service.implementation;

import com.training.vehiclerentalsystem.dto.booking.BookingRequest;
import com.training.vehiclerentalsystem.dto.booking.BookingResponse;
import com.training.vehiclerentalsystem.enums.BookingStatus;
import com.training.vehiclerentalsystem.enums.VehicleStatus;
import com.training.vehiclerentalsystem.exceptions.BookingConflictException;
import com.training.vehiclerentalsystem.exceptions.InvalidBookingException;
import com.training.vehiclerentalsystem.mapper.BookingMapper;
import com.training.vehiclerentalsystem.model.Booking;
import com.training.vehiclerentalsystem.model.User;
import com.training.vehiclerentalsystem.model.Vehicle;
import com.training.vehiclerentalsystem.repository.BookingRepository;
import com.training.vehiclerentalsystem.repository.UserRepository;
import com.training.vehiclerentalsystem.repository.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/*This test covers booking service impl functionality
Create booking (success and validation failures), Booking conflict scenarios
Fetch bookings by user, Cancel booking (success and already cancelled) and Fetch all bookings
*/
@ExtendWith(MockitoExtension.class)
class BookingServiceImplTest {

    //mock external dependencies
    @Mock
    private BookingRepository bookingRepository;
    @Mock
    private VehicleRepository vehicleRepository;
    @Mock
    private UserRepository userRepository;
    @Mock
    private BookingMapper bookingMapper;

    //inject mock dependencies to the service layer
    @InjectMocks
    private BookingServiceImpl bookingService;

    private BookingRequest bookingRequest;
    private Booking booking;
    private BookingResponse bookingResponse;
    private User user;
    private Vehicle vehicle;
    private UUID bookingId;
    private UUID vehicleId;
    private String userEmail;

    // runs before each test case
    @BeforeEach
    void setUp() {
        bookingId = UUID.randomUUID();
        vehicleId = UUID.randomUUID();
        userEmail ="ram@gmail.com";

        user = new User();
        user.setId(UUID.randomUUID());
        user.setEmail(userEmail);
        user.setDrivingLicenseNumber("DL123456");

        vehicle = new Vehicle();
        vehicle.setId(vehicleId);
        vehicle.setDailyRentalRate(BigDecimal.valueOf(2000));
        vehicle.setStatus(VehicleStatus.AVAILABLE);

        bookingRequest = new BookingRequest();
        bookingRequest.setVehicleId(vehicleId);
        bookingRequest.setStartDate(LocalDateTime.now().plusDays(1));
        bookingRequest.setEndDate(LocalDateTime.now().plusDays(3));

        booking = new Booking();
        booking.setId(bookingId);
        booking.setUser(user);
        booking.setVehicle(vehicle);
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setStartDate(bookingRequest.getStartDate());
        booking.setEndDate(bookingRequest.getEndDate());

        bookingResponse = new BookingResponse();
        bookingResponse.setId(bookingId);
        bookingResponse.setStatus(BookingStatus.CONFIRMED);
    }

    // create booking successfully
    @Test
    void createBooking_Success() {
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(user));
        when(bookingRepository.findVehicleForUpdate(vehicleId)).thenReturn(Optional.of(vehicle));
        when(bookingRepository.existsOverlappingBooking(any(), any(), any())).thenReturn(false);
        when(bookingMapper.toEntity(bookingRequest)).thenReturn(booking);
        when(bookingRepository.save(booking)).thenReturn(booking);
        when(bookingMapper.toResponse(booking)).thenReturn(bookingResponse);

        BookingResponse result = bookingService.createBooking(bookingRequest, userEmail);

        assertNotNull(result);
        assertEquals(BookingStatus.CONFIRMED, result.getStatus());
        verify(vehicleRepository).save(vehicle);
    }

    // exception should be thrown if user is not found
    @Test
    void createBooking_UserNotFound() {
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class,
                () -> bookingService.createBooking(bookingRequest, userEmail));
    }

    //  exception thrown when start date is after end date
    @Test
    void createBooking_InvalidDateRange() {
        bookingRequest.setStartDate(LocalDateTime.now().plusDays(3));
        bookingRequest.setEndDate(LocalDateTime.now().plusDays(1));

        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(user));

        assertThrows(InvalidBookingException.class,
                () -> bookingService.createBooking(bookingRequest, userEmail));
    }

    // exception thrown when booking date is in the past
    @Test
    void createBooking_PastDate() {
        bookingRequest.setStartDate(LocalDateTime.now().minusDays(1));

        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(user));

        assertThrows(InvalidBookingException.class,
                () -> bookingService.createBooking(bookingRequest, userEmail));
    }

    // exception trhown when overlapping booking exists
    @Test
    void createBooking_VehicleConflict() {
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(user));
        when(bookingRepository.findVehicleForUpdate(vehicleId)).thenReturn(Optional.of(vehicle));
        when(bookingRepository.existsOverlappingBooking(any(), any(), any())).thenReturn(true);

        assertThrows(BookingConflictException.class,
                () -> bookingService.createBooking(bookingRequest, userEmail));
    }

    //  it returns all bookings for a user
    @Test
    void getBookingsByUser_Success() {
        List<Booking> bookings = Arrays.asList(booking);

        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(user));
        when(bookingRepository.findByUser_Id(user.getId())).thenReturn(bookings);
        when(bookingMapper.toResponse(booking)).thenReturn(bookingResponse);

        List<BookingResponse> result = bookingService.getBookingsByUser(userEmail);

        assertEquals(1, result.size());
        assertEquals(bookingId, result.get(0).getId());
    }

    // cancel booking successfully test case
    @Test
    void cancelBooking_Success() {
        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(user));
        when(bookingRepository.findByIdAndUser_Id(bookingId, user.getId())).thenReturn(Optional.of(booking));
        when(bookingRepository.save(booking)).thenReturn(booking);
        when(bookingMapper.toResponse(booking)).thenReturn(bookingResponse);

        BookingResponse result = bookingService.cancelBooking(bookingId, userEmail);

        assertEquals(BookingStatus.CANCELLED, booking.getStatus());
        assertEquals(VehicleStatus.AVAILABLE, vehicle.getStatus());
        verify(vehicleRepository).save(vehicle);
    }

    // exception thrown when booking is already cancelled
    @Test
    void cancelBooking_AlreadyCancelled() {
        booking.setStatus(BookingStatus.CANCELLED);

        when(userRepository.findByEmail(userEmail)).thenReturn(Optional.of(user));
        when(bookingRepository.findByIdAndUser_Id(bookingId, user.getId())).thenReturn(Optional.of(booking));

        assertThrows(BookingConflictException.class,
                () -> bookingService.cancelBooking(bookingId, userEmail));
    }

    // returns all bookings successfully
    @Test
    void getAllBookings_Success() {
        List<Booking> bookings = Arrays.asList(booking);

        when(bookingRepository.findAll()).thenReturn(bookings);
        when(bookingMapper.toResponse(booking)).thenReturn(bookingResponse);

        List<BookingResponse> result = bookingService.getAllBookings();

        assertEquals(1, result.size());
    }
}
