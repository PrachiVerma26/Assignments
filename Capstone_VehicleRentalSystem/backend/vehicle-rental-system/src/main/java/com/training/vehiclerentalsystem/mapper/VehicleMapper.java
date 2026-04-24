package com.training.vehiclerentalsystem.mapper;

import com.training.vehiclerentalsystem.dto.vehicle.VehicleRequest;
import com.training.vehiclerentalsystem.dto.vehicle.VehicleResponse;
import com.training.vehiclerentalsystem.model.Vehicle;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class VehicleMapper {

    /**
     * Convert VehicleRequest DTO to Vehicle Entity
     * Note: Location must be set separately in service layer
     */
    public Vehicle toEntity(VehicleRequest request) {
        Vehicle vehicle = new Vehicle();

        vehicle.setModel(request.getModel());
        vehicle.setBrand(request.getBrand());
        vehicle.setType(request.getType());
        vehicle.setStatus(request.getStatus());
        vehicle.setDailyRentalRate(request.getDailyRentalRate());
        vehicle.setProfileUrl(request.getProfileUrl());
        // Note: Location and timestamps are handled in service layer

        return vehicle;
    }

    /**
     * Convert Vehicle Entity to VehicleResponse DTO
     */
    public VehicleResponse toResponse(Vehicle vehicle) {
        VehicleResponse response = new VehicleResponse();

        response.setId(vehicle.getId());
        response.setModel(vehicle.getModel());
        response.setBrand(vehicle.getBrand());
        response.setType(vehicle.getType());
        response.setStatus(vehicle.getStatus());
        response.setDailyRentalRate(vehicle.getDailyRentalRate());
        response.setProfileUrl(vehicle.getProfileUrl());
        response.setCreatedAt(vehicle.getCreatedAt());
        response.setUpdatedAt(vehicle.getUpdatedAt());

        // Map location details
        if (vehicle.getLocation() != null) {
            VehicleResponse.LocationInfo locationInfo = new VehicleResponse.LocationInfo();
            locationInfo.setId(vehicle.getLocation().getId());
            locationInfo.setAddress(vehicle.getLocation().getAddress());
            locationInfo.setCity(vehicle.getLocation().getCity());
            locationInfo.setState(vehicle.getLocation().getState());
            locationInfo.setPincode(vehicle.getLocation().getPincode());
            response.setLocation(locationInfo);
        }

        return response;
    }

    /**
     * Convert List of Vehicle Entities to List of VehicleResponse DTOs
     */
    public List<VehicleResponse> toResponseList(List<Vehicle> vehicles) {
        return vehicles.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    /**
     * Update existing Vehicle Entity with VehicleRequest data
     * Used for update operations to preserve existing data
     */
    public void updateEntityFromRequest(VehicleRequest request, Vehicle existingVehicle) {
        existingVehicle.setModel(request.getModel());
        existingVehicle.setBrand(request.getBrand());
        existingVehicle.setType(request.getType());
        existingVehicle.setStatus(request.getStatus());
        existingVehicle.setDailyRentalRate(request.getDailyRentalRate());
        existingVehicle.setProfileUrl(request.getProfileUrl());
        // Note: Location is handled separately in service layer
        // Timestamps are automatically updated by @UpdateTimestamp
    }

    /**
     * Create a simple Vehicle Response without location details
     * Useful for listing operations where location details aren't needed
     */
    public VehicleResponse toSimpleResponse(Vehicle vehicle) {
        VehicleResponse response = new VehicleResponse();

        response.setId(vehicle.getId());
        response.setModel(vehicle.getModel());
        response.setBrand(vehicle.getBrand());
        response.setType(vehicle.getType());
        response.setStatus(vehicle.getStatus());
        response.setDailyRentalRate(vehicle.getDailyRentalRate());
        response.setProfileUrl(vehicle.getProfileUrl());
        response.setCreatedAt(vehicle.getCreatedAt());
        response.setUpdatedAt(vehicle.getUpdatedAt());

        // Only basic location info
        if (vehicle.getLocation() != null) {
            VehicleResponse.LocationInfo locationInfo = new VehicleResponse.LocationInfo();
            locationInfo.setId(vehicle.getLocation().getId());
            locationInfo.setCity(vehicle.getLocation().getCity());
            response.setLocation(locationInfo);
        }

        return response;
    }
}
