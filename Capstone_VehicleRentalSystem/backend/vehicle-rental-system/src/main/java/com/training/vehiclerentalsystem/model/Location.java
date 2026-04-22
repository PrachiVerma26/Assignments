package com.training.vehiclerentalsystem.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Pattern;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name="locations",
        uniqueConstraints = { // Prevent duplicate location entries with same address, city and pincode
                @UniqueConstraint(columnNames = {"address", "city", "pincode"})
        }
)
@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class Location {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id; //primary key for location

    @Column(nullable = false, length = 200)
    private String address;

    @Column(nullable = false, length = 50)
    private String state;

    @Column(nullable = false, length= 50)
    private String city;

    //pincode validation (must be exactly 6 digits) and here it is stored as string to preserve leading zeros
    @Pattern(regexp = "\\d{6}")
    @Column(nullable = false, length = 6)
    private String pincode;

    //one vehicle can be available in many locations
    @OneToMany(mappedBy = "location")
    private List<Vehicle> vehicles = new ArrayList<>();

}
