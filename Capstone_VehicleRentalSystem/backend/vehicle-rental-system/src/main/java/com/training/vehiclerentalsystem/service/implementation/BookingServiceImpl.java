package com.training.vehiclerentalsystem.service.implementation;

import com.training.vehiclerentalsystem.constants.BookingConstants;
import com.training.vehiclerentalsystem.constants.VehicleConstants;
import com.training.vehiclerentalsystem.dto.booking.BookingRequest;
import com.training.vehiclerentalsystem.dto.booking.BookingResponse;
import com.training.vehiclerentalsystem.enums.BookingStatus;
import com.training.vehiclerentalsystem.enums.VehicleStatus;
import com.training.vehiclerentalsystem.exceptions.BookingConflictException;
import com.training.vehiclerentalsystem.exceptions.BookingNotFoundException;
import com.training.vehiclerentalsystem.exceptions.InvalidBookingException;
import com.training.vehiclerentalsystem.exceptions.VehicleNotFoundException;
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
    private static final Logger log = LoggerFactory.getLogger(BookingServiceImpl.class);

    public BookingServiceImpl(BookingRepository bookingRepository, VehicleRepository vehicleRepository, UserRepository userRepository, BookingMapper bookingMapper) {
        this.bookingRepository = bookingRepository;
        this.vehicleRepository = vehicleRepository;
        this.userRepository = userRepository;
        this.bookingMapper = bookingMapper;
    }

    private User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.error("User not found with {}", email);
                    return new UsernameNotFoundException("User not found");
                });
    }

    @Override
    public BookingResponse createBooking(BookingRequest bookingRequestDTO, String userEmail) {
        User user = getUserByEmail(userEmail);
        if (bookingRequestDTO.getStartDate().isAfter(bookingRequestDTO.getEndDate())) {
            log.error("Cannot create booking, selected invalid date range");
            throw new InvalidBookingException(BookingConstants.INVALID_DATE_RANGE);
        }

        LocalDateTime now = LocalDateTime.now();
        if (bookingRequestDTO.getEndDate().isBefore(now)){
            log.warn("Cannot book past dates!");
            throw new InvalidBookingException(BookingConstants.PAST_BOOKING_NOT_ALLOWED);
        }
        LocalDateTime minTime=now.plusHours(2);
        if (bookingRequestDTO.getStartDate().isBefore(minTime)) {
            log.warn("Booking must be at least 2 hours in advance");
            throw new InvalidBookingException("Booking must be at least 2 hours in advance");
        }
        if (user.getDrivingLicenseNumber() == null || user.getDrivingLicenseNumber().isBlank()) {
            log.error("Customer didn't added driving license, so please add then you can book again.");
            throw new InvalidBookingException("Please add your driving license number before booking");
        }
        Vehicle vehicle = bookingRepository.findVehicleForUpdate(bookingRequestDTO.getVehicleId())
                .orElseThrow(() -> new VehicleNotFoundException(VehicleConstants.VEHICLE_NOT_FOUND));
        boolean conflictExists = bookingRepository.existsOverlappingBooking(
                vehicle.getId(),
                bookingRequestDTO.getStartDate(),
                bookingRequestDTO.getEndDate()
        );
        if (conflictExists) {
            log.warn("Vehicle already booked for the selected dates");
            throw new BookingConflictException("Vehicle already booked for selected dates");
        }
        //validating start and end date
        long days = ChronoUnit.DAYS.between(bookingRequestDTO.getStartDate(), bookingRequestDTO.getEndDate()) + 1;
        if (days > 30) {
            throw new InvalidBookingException("Max booking duration is 30 days");
        }

        BigDecimal totalPrice = vehicle.getDailyRentalRate().multiply(BigDecimal.valueOf(days));
        Booking booking = bookingMapper.toEntity(bookingRequestDTO);
        booking.setUser(user);
        booking.setVehicle(vehicle);
        booking.setTotalPrice(totalPrice);
        booking.setStatus(BookingStatus.CONFIRMED);
        log.info("Customer booked vehicle successfully!");
        Booking saved = bookingRepository.save(booking);

        /* updating vehicle status*/
        vehicle.setStatus(VehicleStatus.BOOKED);
        vehicleRepository.save(vehicle);
        return bookingMapper.toResponse(saved);
    }

    @Override
    @Transactional
    public List<BookingResponse> getBookingsByUser(String userEmail) {
        User user = getUserByEmail(userEmail);
        List<Booking> bookings = bookingRepository.findByUser_Id(user.getId());
            return bookings.stream()
                    .map(booking -> {
                        evaluateBookingStatus(booking); // Auto-update if needed
                        return bookingMapper.toResponse(booking);
                    })
                    .toList();
    }
    @Override
    public BookingResponse getBookingById(UUID id, String email) {
        User user = getUserByEmail(email);
        Booking booking = bookingRepository
                .findByIdAndUser_Id(id, user.getId())
                .orElseThrow(() -> {
                    log.error("Booking not found with user having {}. ", user.getId());
                    return new BookingNotFoundException(BookingConstants.BOOKING_NOT_FOUND);
                });
        evaluateBookingStatus(booking);
        return bookingMapper.toResponse(booking);
    }

    @Override
    public BookingResponse cancelBooking(UUID bookingId, String userEmail) {
        User user = getUserByEmail(userEmail);
        Booking booking = bookingRepository.findByIdAndUser_Id(bookingId, user.getId())
                .orElseThrow(() -> {
                    log.error("Booking not found with user having {}. ", user.getId());
                    return new BookingNotFoundException(BookingConstants.BOOKING_NOT_FOUND);
                });

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new BookingConflictException(BookingConstants.BOOKING_ALREADY_CANCELLED);
        }
        LocalDateTime now = LocalDateTime.now();
        if (booking.getStartDate().isBefore(now)) {
            throw new BookingConflictException("Cannot cancel a booking that has already started");
        }
        booking.setStatus(BookingStatus.CANCELLED);
        Booking updated = bookingRepository.save(booking);
        /* updating status in vehicle */
        Vehicle vehicle = booking.getVehicle();
        vehicle.setStatus(VehicleStatus.AVAILABLE);
        vehicleRepository.save(vehicle);
        return bookingMapper.toResponse(updated);
    }

    private BookingResponse completeBooking(UUID bookingId, String userEmail) {
        User user = getUserByEmail(userEmail);
        Booking booking = bookingRepository.findByIdAndUser_Id(bookingId, user.getId())
                .orElseThrow(() -> new BookingNotFoundException(BookingConstants.BOOKING_NOT_FOUND));

        if (booking.getStatus() != BookingStatus.CONFIRMED) {
            throw new BookingConflictException("Only confirmed bookings can be completed");
        }

        if (booking.getEndDate().isAfter(LocalDateTime.now())) {
            throw new BookingConflictException("Cannot complete booking before end date");
        }

        booking.setStatus(BookingStatus.COMPLETED);
        Vehicle vehicle = booking.getVehicle();
        vehicle.setStatus(VehicleStatus.AVAILABLE);
        vehicleRepository.save(vehicle);

        return bookingMapper.toResponse(bookingRepository.save(booking));
    }

    private BookingStatus evaluateBookingStatus(Booking booking) {
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            return BookingStatus.CANCELLED;
        }
        LocalDateTime now = LocalDateTime.now();

        // If current time is past end date, booking is completed
        if (now.isAfter(booking.getEndDate())) {
            // Auto-update status and vehicle if not already done
            if (booking.getStatus() == BookingStatus.CONFIRMED) {
                booking.setStatus(BookingStatus.COMPLETED);
                booking.getVehicle().setStatus(VehicleStatus.AVAILABLE);
                bookingRepository.save(booking);
                vehicleRepository.save(booking.getVehicle());
            }
            return BookingStatus.COMPLETED;
        }

        // If current time is before start date
        if (now.isBefore(booking.getStartDate())) {
            return BookingStatus.CONFIRMED; // Upcoming booking
        }
        // If current time is between start and end date
        return BookingStatus.CONFIRMED; // Active booking
    }

    @Override
    @Transactional
    public List<BookingResponse> getAllBookings() {
        log.info("Fetching all bookings for admin");
        List<Booking> bookings = bookingRepository.findAll();
        return bookings.stream()
                .map(booking -> {
                    evaluateBookingStatus(booking);
                    return bookingMapper.toResponse(booking);
                })
                .toList();
    }

    @Override
    @Transactional
    public List<BookingResponse> getBookingsByStatus(BookingStatus status) {
        log.info("Fetching all bookings with status: {}", status);
        List<Booking> bookings = bookingRepository.findByStatus(status);
        return bookings.stream()
                .map(bookingMapper::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public BookingResponse getBookingByIdAdmin(UUID id) {
        log.info("Fetching booking by ID (admin): {}", id);
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("Booking not found with ID: {}", id);
                    return new BookingNotFoundException("Booking not found with ID: " + id);
                });
        evaluateBookingStatus(booking);
        return bookingMapper.toResponse(booking);
    }
}
