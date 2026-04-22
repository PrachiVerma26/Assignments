package com.training.vehiclerentalsystem.repository;

import com.training.vehiclerentalsystem.model.Location;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LocationRepository extends JpaRepository<Location,Long> {
}
