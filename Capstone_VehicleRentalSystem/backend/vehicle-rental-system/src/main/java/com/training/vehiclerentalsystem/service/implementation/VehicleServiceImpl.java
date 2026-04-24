package com.training.vehiclerentalsystem.service.implementation;

import com.training.vehiclerentalsystem.dto.vehicle.VehicleRequest;
import com.training.vehiclerentalsystem.dto.vehicle.VehicleResponse;
import com.training.vehiclerentalsystem.enums.VehicleStatus;
import com.training.vehiclerentalsystem.enums.VehicleType;
import com.training.vehiclerentalsystem.exceptions.ResourceNotFoundException;
import com.training.vehiclerentalsystem.mapper.VehicleMapper;
import com.training.vehiclerentalsystem.model.Location;
import com.training.vehiclerentalsystem.model.Vehicle;
import com.training.vehiclerentalsystem.repository.LocationRepository;
import com.training.vehiclerentalsystem.repository.VehicleRepository;
import com.training.vehiclerentalsystem.service.VehicleService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class VehicleServiceImpl implements VehicleService {

    private final VehicleRepository vehicleRepository;
    private final LocationRepository locationRepository;
    private final VehicleMapper vehicleMapper;

    public VehicleServiceImpl(VehicleRepository vehicleRepository, LocationRepository locationRepository, VehicleMapper vehicleMapper){
        this.vehicleRepository=vehicleRepository;
        this.locationRepository=locationRepository;
        this.vehicleMapper=vehicleMapper;
    }

    @Override
    public VehicleResponse createVehicle(VehicleRequest vehicleRequestDTO) {
        
        Location location = locationRepository.findById(vehicleRequestDTO.getLocationId())
                .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + vehicleRequestDTO.getLocationId()));

        Vehicle vehicle = vehicleMapper.toEntity(vehicleRequestDTO);
        vehicle.setLocation(location);
        Vehicle savedVehicle = vehicleRepository.save(vehicle);
        return vehicleMapper.toResponse(savedVehicle);
    }

    @Override
    public VehicleResponse updateVehicle(UUID id, VehicleRequest vehicleRequestDTO) {
    
        Vehicle existingVehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));

        if (!existingVehicle.getLocation().getId().equals(vehicleRequestDTO.getLocationId())) {
            Location newLocation = locationRepository.findById(vehicleRequestDTO.getLocationId())
                    .orElseThrow(() -> new ResourceNotFoundException("Location not found with id: " + vehicleRequestDTO.getLocationId()));
            existingVehicle.setLocation(newLocation);
        }

        vehicleMapper.updateEntityFromRequest(vehicleRequestDTO, existingVehicle);
        Vehicle updatedVehicle = vehicleRepository.save(existingVehicle);
        return vehicleMapper.toResponse(updatedVehicle);
    }

    @Override
    public void deleteVehicle(UUID id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));
        if (vehicle.getStatus() == VehicleStatus.BOOKED) {
            throw new IllegalStateException("Cannot delete vehicle with active bookings");
        }

        vehicleRepository.delete(vehicle);
    }

    @Override
    @Transactional(readOnly = true)
    public VehicleResponse findById(UUID id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vehicle not found with id: " + id));

        return vehicleMapper.toResponse(vehicle);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VehicleResponse> findAll() {
        List<Vehicle> vehicles = vehicleRepository.findAll();
        return vehicleMapper.toResponseList(vehicles);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VehicleResponse> filterVehicles(VehicleType type, VehicleStatus status, UUID locationId) {
        List<Vehicle> vehicles;
        if (type != null && status != null && locationId != null) {
            vehicles = vehicleRepository.findByTypeAndStatusAndLocationId(type, status, locationId);
        } else if (type != null && status != null) {
            vehicles = vehicleRepository.findByTypeAndStatus(type, status);
        } else if (type != null && locationId != null) {
            vehicles = vehicleRepository.findByTypeAndLocationId(type, locationId);
        } else if (status != null && locationId != null) {
            vehicles = vehicleRepository.findByStatusAndLocationId(status, locationId);
        } else if (type != null) {
            vehicles = vehicleRepository.findByType(type);
        } else if (status != null) {
            vehicles = vehicleRepository.findByStatus(status);
        } else if (locationId != null) {
            vehicles = vehicleRepository.findByLocationId(locationId);
        } else {
            vehicles = vehicleRepository.findAll();
        }
        return vehicleMapper.toResponseList(vehicles);
    }
}
