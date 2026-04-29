package com.training.vehiclerentalsystem.model;

import com.training.vehiclerentalsystem.enums.VehicleStatus;
import com.training.vehiclerentalsystem.enums.VehicleType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

//It represents a vehicle available for rental
@Entity
@Table(name="vehicles",
        indexes = { // Index to optimize filtering vehicles by location
        @Index(name = "idx_vehicle_location", columnList = "location_id")
        })
@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Vehicle {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id; //primary key for vehicle

    @Version // Used for optimistic locking to handle concurrent updates safely
    @Column(nullable = false)
    private Integer version;

    @NotBlank(message = "Model name is required")
    @Column(name="model",nullable = false)
    private String model;

    @Column(nullable = false)
    private String brand;

    @Enumerated(EnumType.STRING) // stores enum as string instead of ordinal (0, 1)
    @Column(nullable = false)
    private VehicleType type;

    @Column(name = "registration_number", unique = true, length = 50)
    private String registrationNumber;

    @Column(name="description", length=200)
    private String desc;

    @Enumerated(EnumType.STRING) // stores enum as string instead of ordinal (0, 1)
    @Column(nullable = false)
    private VehicleStatus status = VehicleStatus.AVAILABLE;

    @Column(nullable = false)
    private BigDecimal dailyRentalRate;

    // URL for vehicle image/profile
    @Column(name="profile_url")
    private String profileUrl;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // many vehicles belong to one location
    @ManyToOne(fetch = FetchType.LAZY) // LAZY: related data is loaded only when accessed (on-demand), not with initial query
    @JoinColumn(name="location_id", nullable = false)
    private Location location;

    // one vehicle can have many bookings (bidirectional)
    @OneToMany(mappedBy = "vehicle")
    private List<Booking> bookings = new ArrayList<>();

}
