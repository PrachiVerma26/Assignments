package com.training.vehiclerentalsystem.service.implementation;

import com.training.vehiclerentalsystem.constants.VehicleConstants;
import com.training.vehiclerentalsystem.dto.vehicle.VehicleRequest;
import com.training.vehiclerentalsystem.dto.vehicle.VehicleResponse;
import com.training.vehiclerentalsystem.enums.VehicleStatus;
import com.training.vehiclerentalsystem.enums.VehicleType;
import com.training.vehiclerentalsystem.exceptions.LocationNotFoundException;
import com.training.vehiclerentalsystem.exceptions.ResourceNotFoundException;
import com.training.vehiclerentalsystem.exceptions.VehicleDeletionNotAllowedException;
import com.training.vehiclerentalsystem.exceptions.VehicleNotFoundException;
import com.training.vehiclerentalsystem.mapper.VehicleMapper;
import com.training.vehiclerentalsystem.model.Location;
import com.training.vehiclerentalsystem.model.Vehicle;
import com.training.vehiclerentalsystem.repository.LocationRepository;
import com.training.vehiclerentalsystem.repository.VehicleRepository;
import com.training.vehiclerentalsystem.service.VehicleService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;
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
                .orElseThrow(() -> new LocationNotFoundException(VehicleConstants.LOCATION_NOT_FOUND + vehicleRequestDTO.getLocationId()));
        Vehicle vehicle = vehicleMapper.toEntity(vehicleRequestDTO);
        vehicle.setLocation(location);
        Vehicle savedVehicle = vehicleRepository.save(vehicle);
        return vehicleMapper.toResponse(savedVehicle);
    }

    @Override
    public VehicleResponse updateVehicle(UUID id, VehicleRequest vehicleRequestDTO) {
        Vehicle existingVehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new VehicleNotFoundException(VehicleConstants.VEHICLE_NOT_FOUND+ id));
        if (!existingVehicle.getLocation().getId().equals(vehicleRequestDTO.getLocationId())) {
            Location newLocation = locationRepository.findById(vehicleRequestDTO.getLocationId())
                    .orElseThrow(() -> new LocationNotFoundException(VehicleConstants.LOCATION_NOT_FOUND + vehicleRequestDTO.getLocationId()));
            existingVehicle.setLocation(newLocation);
        }
        vehicleMapper.updateEntityFromRequest(vehicleRequestDTO, existingVehicle);
        Vehicle updatedVehicle = vehicleRepository.save(existingVehicle);
        return vehicleMapper.toResponse(updatedVehicle);
    }

    @Override
    public void deleteVehicle(UUID id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException(VehicleConstants.VEHICLE_NOT_FOUND + id));
        if (vehicle.getStatus() == VehicleStatus.BOOKED) {
            throw new VehicleDeletionNotAllowedException(VehicleConstants.VEHICLE_DELETE_NOT_ALLOWED);
        }
        vehicleRepository.delete(vehicle);
    }

    @Override
    @Transactional(readOnly = true)
    public VehicleResponse findById(UUID id) {
        Vehicle vehicle = vehicleRepository.findById(id)
                .orElseThrow(() -> new VehicleNotFoundException(VehicleConstants.VEHICLE_NOT_FOUND));
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

    @Override
    @Transactional(readOnly = true)
    public List<VehicleResponse> findAvailableVehicles(LocalDateTime startDate, LocalDateTime endDate, VehicleType type, UUID locationId) {
        if (startDate == null || endDate == null || !startDate.isBefore(endDate)) {
            throw new IllegalArgumentException("Invalid date range");
        }
        List<Vehicle> vehicles = vehicleRepository.findAvailableVehicles(startDate, endDate, type, locationId);
        return vehicleMapper.toResponseList(vehicles);
    }
}
