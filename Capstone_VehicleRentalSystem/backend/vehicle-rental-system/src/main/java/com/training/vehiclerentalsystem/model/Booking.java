package com.training.vehiclerentalsystem.model;

import com.training.vehiclerentalsystem.enums.BookingStatus;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

/*Booking entity represents a vehicle booking made by a user.
This entity manages the complete lifecycle of a booking, including booking creation,
vehicle allocation, rental duration, pricing, and status tracking.
 */
@Entity
@Table(name="bookings",
        indexes = { // Index to optimize queries fetching bookings by user
        @Index(name = "idx_booking_user", columnList = "user_id"), // Index to optimize queries fetching bookings by vehicle
        @Index(name = "idx_booking_vehicle", columnList = "vehicle_id")
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Getter
@Setter
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id; //unique identifier for each booking

    // Used for optimistic locking to handle concurrent updates safely
    @Version
    @Column(name = "version", nullable = false)
    private Long version;

    // many bookings can belong to one user
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name="user_id", nullable = false)
    private User user;

    // many bookings can be associated with one vehicle
    @ManyToOne (fetch = FetchType.LAZY)
    @JoinColumn(name="vehicle_id", nullable = false)
    private Vehicle vehicle;

    //booking start date
    @Column(nullable = false)
    private LocalDate startDate;

    //booking end date
    @Column(nullable = false)
    private LocalDate endDate;

    // total price for the booking ( uses big decimal for precision)
    @Column(nullable = false)
    private BigDecimal price;

    //current status of booking 
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private BookingStatus status = BookingStatus.PENDING;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDate createdAt;
    
    @Column(name = "updated_at", nullable = false)
    private LocalDate updatedAt;

}
