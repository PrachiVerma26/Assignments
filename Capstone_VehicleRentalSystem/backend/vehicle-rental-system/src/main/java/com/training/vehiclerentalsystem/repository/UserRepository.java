package com.training.vehiclerentalsystem.repository;

import com.training.vehiclerentalsystem.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    // Check if a user exists with given email
    boolean existsByEmail(String email);

    Optional<User> findByEmail(String email);
}
