package com.training.vehiclerentalsystem.controller;

import com.training.vehiclerentalsystem.constants.ApiConstants;
import com.training.vehiclerentalsystem.constants.VehicleConstants;
import com.training.vehiclerentalsystem.dto.vehicle.VehicleResponse;
import com.training.vehiclerentalsystem.enums.VehicleStatus;
import com.training.vehiclerentalsystem.enums.VehicleType;
import com.training.vehiclerentalsystem.service.VehicleService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.UUID;

/**
 * REST controller for public vehicle-related APIs
 * Handles vehicle listing, filtering, and details for customers
 */
@RestController
@RequestMapping(VehicleConstants.PUBLIC_BASE)
public class VehicleController {

    private final VehicleService vehicleService;
    private static final Logger log = LoggerFactory.getLogger(VehicleController.class);

    public VehicleController(VehicleService vehicleService){
        this.vehicleService=vehicleService;
    }

    @GetMapping
    public ResponseEntity<List<VehicleResponse>> getAllVehicles() {
        log.info("Get all vehicles API called");
        List<VehicleResponse> vehicles = vehicleService.findAll();
        log.info("Retrieved {} vehicles", vehicles.size());
        return ResponseEntity.ok(vehicles);
    }

    @GetMapping(VehicleConstants.BY_ID)
    public ResponseEntity<VehicleResponse> getVehicleById(@PathVariable (VehicleConstants.ID) UUID id) {
        log.info("Get vehicle by ID API called with id: {}", id);
        VehicleResponse vehicle = vehicleService.findById(id);
        log.info("Vehicle found: {} {}", vehicle.getBrand(), vehicle.getModel());
        return ResponseEntity.ok(vehicle);
    }

    @GetMapping(VehicleConstants.FILTER)
    public ResponseEntity<List<VehicleResponse>> filterVehicles(
            @RequestParam(value = VehicleConstants.PARAM_TYPE, required = false) VehicleType type,
            @RequestParam(value = VehicleConstants.PARAM_STATUS, required = false) VehicleStatus status,
            @RequestParam(value = VehicleConstants.PARAM_LOCATION_ID, required = false) UUID locationId) {
        log.info("Filter vehicles API called with type: {}, status: {}, locationId: {}",
                type, status, locationId);
        List<VehicleResponse> vehicles = vehicleService.filterVehicles(type, status, locationId);
        log.info("Found {} vehicles matching filters", vehicles.size());
        return ResponseEntity.ok(vehicles);
    }

    @GetMapping(VehicleConstants.AVAILABLE)
    public ResponseEntity<List<VehicleResponse>> getAvailableVehicles(
            @RequestParam(value= VehicleConstants.PARAM_TYPE) VehicleType type,
            @RequestParam(value = VehicleConstants.PARAM_LOCATION_ID) UUID locationId) {
        log.info("Get available vehicles API called with type: {}, locationId: {}", type, locationId);
        List<VehicleResponse> vehicles = vehicleService.filterVehicles(type, VehicleStatus.AVAILABLE, locationId);
        log.info("Found {} available vehicles", vehicles.size());
        return ResponseEntity.ok(vehicles);
    }

    @GetMapping(VehicleConstants.BY_TYPE)
    public ResponseEntity<List<VehicleResponse>> getVehiclesByType(@PathVariable(VehicleConstants.TYPE) VehicleType type) {
        log.info("Get vehicles by type API called with type: {}", type);
        List<VehicleResponse> vehicles = vehicleService.filterVehicles(type, null, null);
        log.info("Found {} vehicles of type {}", vehicles.size(), type);
        return ResponseEntity.ok(vehicles);
    }

    @GetMapping(VehicleConstants.BY_LOCATION)
    public ResponseEntity<List<VehicleResponse>> getVehiclesByLocation(@PathVariable(VehicleConstants.LOCATION_ID) UUID locationId) {
        log.info("Get vehicles by location API called with locationId: {}", locationId);
        List<VehicleResponse> vehicles = vehicleService.filterVehicles(null, null, locationId);
        log.info("Found {} vehicles at location {}", vehicles.size(), locationId);
        return ResponseEntity.ok(vehicles);
    }
}
