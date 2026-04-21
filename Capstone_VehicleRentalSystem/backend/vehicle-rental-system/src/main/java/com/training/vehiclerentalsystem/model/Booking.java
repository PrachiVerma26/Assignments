package com.training.vehiclerentalsystem.model;

import com.training.vehiclerentalsystem.enums.BookingStatus;
import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.UUID;

//Booking entity represents a vehicle booking made by a user.
//This entity manages the complete lifecycle of a booking, including booking creation, vehicle allocation, rental duration, pricing, and status tracking.
@Entity
@Table(name="bookings")
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

    //no args constructor
    public Booking(){}

    //all args constructor
    public Booking(User user, Vehicle vehicle, LocalDate startDate, LocalDate endDate, BigDecimal price){

        //validation: end date must not be before start date
        if (endDate.isBefore(startDate)) {
            throw new IllegalArgumentException("End date cannot be before start date"); }

        this.user =user;
        this.vehicle=vehicle;
        this.startDate=startDate;
        this.endDate=endDate;
        this.price=price;
    }

    //getters
    public UUID getId() {return id;}
    public Long getVersion() {return version;}
    public User getUser() {return user;}
    public Vehicle getVehicle() {return vehicle;}
    public LocalDate getStartDate() {return startDate;}
    public LocalDate getEndDate() {return endDate;}
    public BookingStatus getStatus() {return status;}
    public LocalDate getCreatedAt() {return createdAt;}
    public LocalDate getUpdatedAt() {return updatedAt;}
    public BigDecimal getPrice() {return price;}

    //setters
    public void setId(UUID id) {this.id = id;}
    public void setVersion(Long version) {this.version = version;}
    public void setUser(User user) {this.user = user;}
    public void setVehicle(Vehicle vehicle) {this.vehicle = vehicle;}
    public void setStartDate(LocalDate startDate) {this.startDate = startDate;}
    public void setEndDate(LocalDate endDate) {this.endDate = endDate;}
    public void setStatus(BookingStatus status) {this.status = status;}
    public void setCreatedAt(LocalDate createdAt) {this.createdAt = createdAt;}
    public void setUpdatedAt(LocalDate updatedAt) {this.updatedAt = updatedAt;}
    public void setPrice(BigDecimal price) {this.price = price;}

    //Returns a safe string representation of booking details
    @Override
    public String toString() {
        return "Booking{" + "id=" + id + ", user=" + user.getFullName() + ", vehicle=" + vehicle.getBrand() + " " + vehicle.getModel() + ", startDate=" + startDate +
                ", endDate=" + endDate + ", price=" + price + ", status=" + status + ", createdAt=" + createdAt + ", updatedAt=" + updatedAt + '}';
    }
}
