package com.training.vehiclerentalsystem.service.implementation;

import com.training.vehiclerentalsystem.dto.booking.BookingRequest;
import com.training.vehiclerentalsystem.dto.booking.BookingResponse;
import com.training.vehiclerentalsystem.enums.BookingStatus;
import com.training.vehiclerentalsystem.mapper.BookingMapper;
import com.training.vehiclerentalsystem.model.Booking;
import com.training.vehiclerentalsystem.model.User;
import com.training.vehiclerentalsystem.model.Vehicle;
import com.training.vehiclerentalsystem.repository.BookingRepository;
import com.training.vehiclerentalsystem.repository.UserRepository;
import com.training.vehiclerentalsystem.repository.VehicleRepository;
import com.training.vehiclerentalsystem.service.BookingService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;
    private final BookingMapper bookingMapper;
    private static final Logger log = LoggerFactory.getLogger(AuthServiceImpl.class);

    public BookingServiceImpl(BookingRepository bookingRepository, VehicleRepository vehicleRepository, UserRepository userRepository, BookingMapper bookingMapper) {
        this.bookingRepository = bookingRepository;
        this.vehicleRepository = vehicleRepository;
        this.userRepository = userRepository;
        this.bookingMapper = bookingMapper;
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("User not found"));
    }
        
    @Override
    public BookingResponse createBooking(BookingRequest request, String userEmail) {
        User user = getUserByEmail(userEmail);
        if (request.getStartDate().isAfter(request.getEndDate())) {
            throw new RuntimeException("Invalid date range");
        }
        if (request.getStartDate().isBefore(LocalDateTime.now())) {
            throw new RuntimeException("Cannot book past dates");
        }

        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElseThrow(() -> new RuntimeException("Vehicle not found"));

        boolean conflictExists = bookingRepository.existsOverlappingBooking(
                vehicle.getId(),
                request.getStartDate(),
                request.getEndDate()
        );

        if (conflictExists) {
            throw new RuntimeException("Vehicle already booked for selected dates");
        }
        //calcuate price
        long days = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate()) + 1;

        BigDecimal totalPrice = vehicle.getDailyRentalRate().multiply(BigDecimal.valueOf(days));
        Booking booking = bookingMapper.toEntity(request);

        booking.setUser(user);
        booking.setVehicle(vehicle);
        booking.setTotalPrice(totalPrice);
        booking.setStatus(BookingStatus.CONFIRMED);

        log.info("Customer booked vehicle successfully!");
        Booking saved = bookingRepository.save(booking);
        return bookingMapper.toResponse(saved);
        }
        
        @Override
        @Transactional(readOnly = true)
        public List<BookingResponse> getBookingsByUser(String userEmail) {
            User user = getUserByEmail(userEmail);
                return bookingRepository.findByUser_Id(user.getId())
                    .stream()
                    .map(bookingMapper::toResponse)
                    .toList();
        }
        
        @Override
        public BookingResponse cancelBooking(UUID bookingId, String userEmail) {
            User user = getUserByEmail(userEmail);
            Booking booking = bookingRepository.findByIdAndUser_Id(bookingId, user.getId())
                    .orElseThrow(() -> new RuntimeException("Booking not found"));
            if (booking.getStatus() == BookingStatus.CANCELLED) {
                throw new RuntimeException("Booking already cancelled");
            }
            booking.setStatus(BookingStatus.CANCELLED);
            Booking updated = bookingRepository.save(booking);
            return bookingMapper.toResponse(updated);
        }
}
