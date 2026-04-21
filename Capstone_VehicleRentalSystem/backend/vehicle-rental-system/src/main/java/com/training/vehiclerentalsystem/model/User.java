package com.training.vehiclerentalsystem.model;

import com.training.vehiclerentalsystem.enums.RoleType;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;

import java.time.LocalDateTime;
import java.util.*;


//user entity represents admins and customer in the vehicle rental system
@Entity
@Table(name = "users") //maps this entity to the "users" table in the database

public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name="user_id")
    private UUID userId; //primary key for the user

    @NotBlank(message = "Name cannot be blank")
    @Size(min = 2, max = 50, message = "Name must be between 2 and 50 characters")
    private String fullName;

    //unique phone number for contact
    @Column(unique = true, nullable = false)
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be 10 digits") // Validates format
    private String phoneNumber;

    //address of the user
    @NotBlank(message = "Address is required")
    @Column(nullable = false)
    private String address;

    //unique email for authentication
    @Email
    @Column(unique = true, nullable = false)
    private String email;

    @Column(nullable = false)
    @Size(min=6)
    private String password;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    //roles assigned to the user(admin, customer)
    @ElementCollection(fetch = FetchType.EAGER) // creates separate table for collection (users_role) and used FetchType.EAGER: Loads roles immediately with user (needed for security checks)
    @Enumerated(EnumType.STRING) // stores enum as string instead of ordinal (0, 1)
    private Set<RoleType> role=new HashSet<>(); //prevents duplicate roles

    // One user can have many bookings
    @OneToMany(mappedBy = "user", cascade = CascadeType.ALL)
    private List<Booking> bookings = new ArrayList<>();

    //no args-constructor
    public User(){}

    //All-args constructor
    public User(String fullName, String phoneNumber, String address, String email, String password, Set<RoleType> role){
        this.fullName=fullName;
        this.phoneNumber=phoneNumber;
        this.address=address;
        this.email=email;
        this.password=password;
        this.role=role;
    }

    //getters
    public String getFullName() {
        return fullName;
    }
    public String getPhoneNumber() {
        return phoneNumber;
    }
    public String getAddress() {
        return address;
    }
    public String getEmail() {
        return email;
    }
    public String getPassword() {
        return password;
    }
    public Set<RoleType> getRole() {
        return role;
    }

    //setters
    public void setFullName(String fullName) {
        this.fullName = fullName;
    }
    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
    public void setAddress(String address) {
        this.address = address;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public void setPassword(String password) {
        this.password = password;
    }
    public void setRole(Set<RoleType> role) {
        this.role = role;
    }


    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

    //Returns a safe string representation of User
    @Override
    public String toString() {
        return "User{" + "userId=" + userId + ", fullName='" + fullName + '\'' + ", phoneNumber='" + phoneNumber + '\'' +
                ", email='" + email + '}';
    }
}
