package com.training.vehiclerentalsystem.mapper;

import com.training.vehiclerentalsystem.dto.booking.BookingRequest;
import com.training.vehiclerentalsystem.dto.booking.BookingResponse;
import com.training.vehiclerentalsystem.model.Booking;
import com.training.vehiclerentalsystem.model.Location;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class BookingMapper {

    public Booking toEntity(BookingRequest bookingRequestDTO) {

        Booking booking = new Booking();
        booking.setStartDate(bookingRequestDTO.getStartDate());
        booking.setEndDate(bookingRequestDTO.getEndDate());
        booking.setPaymentMethod(bookingRequestDTO.getPaymentMethod());
        return booking;
    }

    public BookingResponse toResponse(Booking booking) {
        BookingResponse response = new BookingResponse();
        response.setId(booking.getId());
        if (booking.getVehicle() != null) {
            response.setVehicleId(booking.getVehicle().getId());
            response.setVehicleBrand(booking.getVehicle().getBrand());
            response.setVehicleModel(booking.getVehicle().getModel());
            Location location = booking.getVehicle().getLocation();
            if (location != null) {
                response.setLocation(new BookingResponse.LocationInfo(
                        location.getAddress(),
                        location.getCity(),
                        location.getState(),
                        location.getPincode()
                ));
            }
        }

        response.setStartDate(booking.getStartDate());
        response.setEndDate(booking.getEndDate());
        response.setTotalPrice(booking.getTotalPrice());
        response.setPaymentMethod(booking.getPaymentMethod());
        response.setStatus(booking.getStatus());
        response.setCreatedAt(booking.getCreatedAt());
        return response;
    }

    public List<BookingResponse> toResponseList(List<Booking> bookings) {
        return bookings.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }
}
