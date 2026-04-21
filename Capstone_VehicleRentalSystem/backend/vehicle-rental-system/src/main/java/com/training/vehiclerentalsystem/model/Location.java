package com.training.vehiclerentalsystem.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.Pattern;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
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

    //one vehicle can be avaiable in many locations
    @OneToMany(mappedBy = "location")
    private List<Vehicle> vehicles = new ArrayList<>();

    //no args constructor
    public Location(){}

    //all args constructor
    public Location(UUID id, String address, String state, String city, String pincode){
        this.id=id;
        this.address=address;
        this.state=state;
        this.city=city;
        this.pincode=pincode;
    }

    //getters

    public UUID getId() {return id;}
    public String getAddress() {return address;}
    public String getState() {return state;}
    public String getCity() {return city;}
    public String getPincode() {return pincode;}

    //setters
    public void setId(UUID id) {this.id = id;}
    public void setAddress(String address) {this.address = address;}
    public void setState(String state) {this.state = state;}
    public void setCity(String city) {this.city = city;}
    public void setPincode(String pincode) {this.pincode = pincode;}

    @Override
    public String toString() {
        return "Location{" + "id=" + id + ", address='" + address + '\'' + ", state='" + state + '\'' + ", city='" + city + '\'' +
                ", pincode='" + pincode + '\'' + '}';
    }
}
