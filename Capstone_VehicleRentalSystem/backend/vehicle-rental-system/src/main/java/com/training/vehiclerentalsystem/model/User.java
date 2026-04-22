package com.training.vehiclerentalsystem.model;

import com.training.vehiclerentalsystem.enums.RoleType;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;
import java.util.*;


//user entity represents admins and customer in the vehicle rental system
@Entity
@Table(name = "users") //maps this entity to the "users" table in the database
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Setter
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name="user_id")
    private UUID id; //primary key for the user

    @NotBlank(message = "Name cannot be blank")
    @Size(min = 2, max = 50, message = "Name must be between 2 and 50 characters")
    private String name;

    //unique phone number for contact
    @Column(unique = true, nullable = true)
    @Pattern(regexp = "^[0-9]{10}$", message = "Phone number must be 10 digits") // Validates format
    private String phoneNumber;

    //address of the user
    @Column(nullable = true)
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

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }

}
