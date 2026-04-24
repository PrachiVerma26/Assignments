package com.training.vehiclerentalsystem.controller;

import com.training.vehiclerentalsystem.constants.ApiConstants;
import com.training.vehiclerentalsystem.dto.vehicle.VehicleRequest;
import com.training.vehiclerentalsystem.dto.vehicle.VehicleResponse;
import com.training.vehiclerentalsystem.service.VehicleService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

/**
 * REST controller for admin vehicle management
 * Handles CRUD operations for vehicles (admin only)
 */
@RestController
@RequestMapping(ApiConstants.ADMIN)
public class AdminController {
    private final VehicleService vehicleService;
    private static final Logger log = LoggerFactory.getLogger(AdminController.class);

    AdminController(VehicleService vehicleService) {
        this.vehicleService = vehicleService;
    }

    @PostMapping("/vehicles")
    public ResponseEntity<VehicleResponse> createVehicle(@Valid @RequestBody VehicleRequest vehicleRequestDTO) {
        log.info("Create vehicle API called with: {} {}", vehicleRequestDTO.getBrand(), vehicleRequestDTO.getModel());
        VehicleResponse response = vehicleService.createVehicle(vehicleRequestDTO);
        log.info("Vehicle created successfully with ID: {}", response.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/vehicles/{id}")
    public ResponseEntity<VehicleResponse> updateVehicle(
            @PathVariable UUID id,
            @Valid @RequestBody VehicleRequest vehicleRequestDTO) {
        log.info("Update vehicle API called for ID: {} with: {} {}", id, vehicleRequestDTO.getBrand(), vehicleRequestDTO.getModel());
        VehicleResponse response = vehicleService.updateVehicle(id, vehicleRequestDTO);
        log.info("Vehicle updated successfully: {}", id);
        return ResponseEntity.ok(response);
    }
    @DeleteMapping("/vehicles/{id}")
    public ResponseEntity<Void> deleteVehicle(@PathVariable UUID id) {
        log.info("Delete vehicle API called for ID: {}", id);
        vehicleService.deleteVehicle(id);
        log.info("Vehicle deleted successfully: {}", id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/vehicles")
    public ResponseEntity<List<VehicleResponse>> getAllVehiclesAdmin() {
        log.info("Get all vehicles (admin) API called");
        List<VehicleResponse> vehicles = vehicleService.findAll();
        log.info("Retrieved {} vehicles for admin", vehicles.size());
        return ResponseEntity.ok(vehicles);
    }

    @GetMapping("/vehicles/{id}")
    public ResponseEntity<VehicleResponse> getVehicleByIdAdmin(@PathVariable UUID id) {
        log.info("Get vehicle by ID (admin) API called for ID: {}", id);
        VehicleResponse vehicle = vehicleService.findById(id);
            log.info("Vehicle found: {} {}", vehicle.getBrand(), vehicle.getModel());
        return ResponseEntity.ok(vehicle);
    }
}
