package com.training.vehiclerentalsystem.mapper;

import com.training.vehiclerentalsystem.dto.vehicle.VehicleRequest;
import com.training.vehiclerentalsystem.dto.vehicle.VehicleResponse;
import com.training.vehiclerentalsystem.model.Vehicle;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.stream.Collectors;

/*
Convert VehicleRequest DTO to Vehicle Entity
*/

@Component
public class VehicleMapper {

    public Vehicle toEntity(VehicleRequest request) {
        Vehicle vehicle = new Vehicle();

        vehicle.setModel(request.getModel());
        vehicle.setBrand(request.getBrand());
        vehicle.setType(request.getType());
        vehicle.setRegistrationNumber(request.getRegistrationNumber());
        vehicle.setDesc(request.getDescription());
        vehicle.setStatus(request.getStatus());
        vehicle.setDailyRentalRate(request.getDailyRentalRate());
        vehicle.setProfileUrl(request.getProfileUrl());

        return vehicle;
    }

    public VehicleResponse toResponse(Vehicle vehicle) {
        VehicleResponse response = new VehicleResponse();

        response.setId(vehicle.getId());
        response.setModel(vehicle.getModel());
        response.setBrand(vehicle.getBrand());
        response.setType(vehicle.getType());
        response.setRegistrationNumber(vehicle.getRegistrationNumber());
        response.setDescription(vehicle.getDesc());
        response.setStatus(vehicle.getStatus());
        response.setDailyRentalRate(vehicle.getDailyRentalRate());
        response.setProfileUrl(vehicle.getProfileUrl());

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

    
    public List<VehicleResponse> toResponseList(List<Vehicle> vehicles) {
        return vehicles.stream()
                .map(this::toResponse)
                .collect(Collectors.toList());
    }

    public void updateEntityFromRequest(VehicleRequest request, Vehicle existingVehicle) {
        existingVehicle.setModel(request.getModel());
        existingVehicle.setBrand(request.getBrand());
        existingVehicle.setType(request.getType());
        existingVehicle.setRegistrationNumber(request.getRegistrationNumber());
        existingVehicle.setDesc(request.getDescription());
        existingVehicle.setStatus(request.getStatus());
        existingVehicle.setDailyRentalRate(request.getDailyRentalRate());
        existingVehicle.setProfileUrl(request.getProfileUrl());
    }
}
