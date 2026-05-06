package com.training.vehiclerentalsystem.mapper;

import com.training.vehiclerentalsystem.dto.booking.BookingRequest;
import com.training.vehiclerentalsystem.dto.booking.BookingResponse;
import com.training.vehiclerentalsystem.enums.BookingStatus;
import com.training.vehiclerentalsystem.enums.PaymentMethod;
import com.training.vehiclerentalsystem.model.Booking;
import com.training.vehiclerentalsystem.model.Location;
import com.training.vehiclerentalsystem.model.Vehicle;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/* Test class for BookingMapper: Tests conversion between BookingRequest DTO, Booking Entity, and BookingResponse DTO */
@ExtendWith(MockitoExtension.class)
class BookingMapperTest {

    @InjectMocks
    private BookingMapper bookingMapper;

    private BookingRequest bookingRequest;
    private Booking booking;
    private Vehicle vehicle;
    private Location location;
    private UUID bookingId;
    private UUID vehicleId;
    private UUID locationId;

    @BeforeEach
    void setUp() {
        // generates random uuid
        bookingId = UUID.randomUUID();
        vehicleId = UUID.randomUUID();
        locationId = UUID.randomUUID();

        // Setup location
        location = new Location();
        location.setId(locationId);
        location.setAddress("123 Main St");
        location.setCity("Mumbai");
        location.setState("Maharashtra");
        location.setPincode("400001");

        // Setup vehicle
        vehicle = new Vehicle();
        vehicle.setId(vehicleId);
        vehicle.setBrand("Toyota");
        vehicle.setModel("Camry");
        vehicle.setDailyRentalRate(BigDecimal.valueOf(2000));
        vehicle.setLocation(location);

        // Setup booking request
        bookingRequest = new BookingRequest();
        bookingRequest.setVehicleId(vehicleId);
        bookingRequest.setStartDate(LocalDateTime.now().plusDays(1));
        bookingRequest.setEndDate(LocalDateTime.now().plusDays(3));
        bookingRequest.setPaymentMethod(PaymentMethod.CARD);

        // Setup booking entity
        booking = new Booking();
        booking.setId(bookingId);
        booking.setVehicle(vehicle);
        booking.setStartDate(bookingRequest.getStartDate());
        booking.setEndDate(bookingRequest.getEndDate());
        booking.setTotalPrice(BigDecimal.valueOf(6000));
        booking.setPaymentMethod(PaymentMethod.CARD);
        booking.setStatus(BookingStatus.CONFIRMED);
        booking.setCreatedAt(LocalDateTime.now());
    }
     // Convert BookingRequest with all fields to Booking Entity
    @Test
    void toEntity_AllFieldsMapped() {
        Booking result = bookingMapper.toEntity(bookingRequest);

        assertNotNull(result);
        assertNotNull(result.getStartDate());
        assertNotNull(result.getEndDate());
        assertNotNull(result.getPaymentMethod());
        assertEquals(PaymentMethod.CARD, result.getPaymentMethod());
    }

    // Convert Booking Entity to BookingResponse DTO(verify all fields including vehicle and location info)
    @Test
    void toResponse_Success() {

        BookingResponse result = bookingMapper.toResponse(booking);

        assertNotNull(result);
        assertEquals(booking.getId(), result.getId());
        assertEquals(booking.getStatus(), result.getStatus());
        assertEquals(booking.getTotalPrice(), result.getTotalPrice());
        assertEquals(booking.getPaymentMethod(), result.getPaymentMethod());
        assertEquals(booking.getStartDate(), result.getStartDate());
        assertEquals(booking.getEndDate(), result.getEndDate());
    }

    // Convert Booking with null Vehicle to BookingResponse
    @Test
    void toResponse_WithNullVehicle() {
        booking.setVehicle(null);

        BookingResponse result = bookingMapper.toResponse(booking);

        assertNotNull(result);
        assertNull(result.getVehicleId());
        assertNull(result.getVehicleBrand());
        assertNull(result.getVehicleModel());
    }

    // Convert Booking with Vehicle but null Location to BookingResponse
    @Test
    void toResponse_WithNullLocation() {
        vehicle.setLocation(null);

        BookingResponse result = bookingMapper.toResponse(booking);

        assertNotNull(result);
        assertNotNull(result.getVehicleId());
        assertNull(result.getLocation());
    }

    // Convert list of Bookings to list of BookingResponses
    @Test
    void toResponseList_Success() {
        Booking booking2 = new Booking();
        booking2.setId(UUID.randomUUID());
        booking2.setVehicle(vehicle);
        booking2.setStatus(BookingStatus.CONFIRMED);
        booking2.setCreatedAt(LocalDateTime.now());

        List<Booking> bookings = Arrays.asList(booking, booking2);

        List<BookingResponse> result = bookingMapper.toResponseList(bookings);

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(booking.getId(), result.get(0).getId());
        assertEquals(booking2.getId(), result.get(1).getId());
    }

    // Convert empty list of Bookings
    @Test
    void toResponseList_EmptyList() {
        List<Booking> bookings = Arrays.asList();

        List<BookingResponse> result = bookingMapper.toResponseList(bookings);
        assertNotNull(result);
        assertTrue(result.isEmpty());
    }
}
