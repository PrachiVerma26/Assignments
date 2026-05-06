package com.training.vehiclerentalsystem.repository;

import com.training.vehiclerentalsystem.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface UserRepository extends JpaRepository<User, UUID> {

    // Check if a user exists with given email
    boolean existsByEmail(String email);
    Optional<User> findByEmail(String email);

    // Check for duplicate or existing driving license
    boolean existsByDrivingLicenseNumber(String drivingLicenseNumber);
    
    // Check if driving license exists for another user (for update validation)
    boolean existsByDrivingLicenseNumberAndIdNot(String drivingLicenseNumber, UUID userId);

}
