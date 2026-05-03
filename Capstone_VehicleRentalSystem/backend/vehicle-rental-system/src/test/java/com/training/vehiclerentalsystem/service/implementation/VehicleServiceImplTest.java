package com.training.vehiclerentalsystem.service.implementation;

import com.training.vehiclerentalsystem.dto.vehicle.VehicleRequest;
import com.training.vehiclerentalsystem.dto.vehicle.VehicleResponse;
import com.training.vehiclerentalsystem.enums.VehicleStatus;
import com.training.vehiclerentalsystem.enums.VehicleType;
import com.training.vehiclerentalsystem.exceptions.LocationNotFoundException;
import com.training.vehiclerentalsystem.exceptions.VehicleDeletionNotAllowedException;
import com.training.vehiclerentalsystem.exceptions.VehicleNotFoundException;
import com.training.vehiclerentalsystem.mapper.VehicleMapper;
import com.training.vehiclerentalsystem.model.Location;
import com.training.vehiclerentalsystem.model.Vehicle;
import com.training.vehiclerentalsystem.repository.LocationRepository;
import com.training.vehiclerentalsystem.repository.VehicleRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/* this test class verifies VehicleServiceImpl functionality:
Create vehicle, Update vehicle, Delete vehicle (success and booked restriction), Fetch vehicle by ID
Fetch all vehicles, Filter vehicles and Find available vehicles (valid and invalid date cases)
*/
@ExtendWith(MockitoExtension.class)
class VehicleServiceImplTest {

    //mock external dependencies
    @Mock
    private VehicleRepository vehicleRepository;
    @Mock
    private LocationRepository locationRepository;
    @Mock
    private VehicleMapper vehicleMapper;

    //inject dependencies to the service layer
    @InjectMocks
    private VehicleServiceImpl vehicleService;

    private VehicleRequest vehicleRequest;
    private Vehicle vehicle;
    private VehicleResponse vehicleResponse;
    private Location location;
    private UUID vehicleId;
    private UUID locationId;

    //runs before each test
    @BeforeEach
    void setUp() {
        vehicleId = UUID.randomUUID(); // to generate a unique random ID for testing
        locationId = UUID.randomUUID();

        //mock location object
        location = new Location();
        location.setId(locationId);
        location.setCity("Mumbai");

        vehicleRequest = new VehicleRequest();
        vehicleRequest.setBrand("Toyota");
        vehicleRequest.setModel("Camry");
        vehicleRequest.setLocationId(locationId);
        vehicleRequest.setDailyRentalRate(BigDecimal.valueOf(2000));

        vehicle = new Vehicle();
        vehicle.setId(vehicleId);
        vehicle.setBrand("Toyota");
        vehicle.setModel("Camry");
        vehicle.setLocation(location);
        vehicle.setStatus(VehicleStatus.AVAILABLE);
        vehicle.setType(VehicleType.CAR);

        vehicleResponse = new VehicleResponse();
        vehicleResponse.setId(vehicleId);
        vehicleResponse.setBrand("Toyota");
        vehicleResponse.setModel("Camry");
    }

    // create vehicle test case
    @Test
    void createVehicle_Success() {
        when(locationRepository.findById(locationId)).thenReturn(Optional.of(location));
        when(vehicleMapper.toEntity(vehicleRequest)).thenReturn(vehicle);
        when(vehicleRepository.save(vehicle)).thenReturn(vehicle);
        when(vehicleMapper.toResponse(vehicle)).thenReturn(vehicleResponse);

        VehicleResponse result = vehicleService.createVehicle(vehicleRequest);

        assertNotNull(result);
        assertEquals(vehicleResponse.getBrand(), result.getBrand());

        //verifying that vehicle is saved or not
        verify(vehicleRepository).save(vehicle);
    }

    // if location is not found then exception should be thrown
    @Test
    void createVehicle_LocationNotFound() {
        when(locationRepository.findById(locationId)).thenReturn(Optional.empty());

        assertThrows(LocationNotFoundException.class,
                () -> vehicleService.createVehicle(vehicleRequest));
    }

    // exception would be thrown if vehicle does not exist
    @Test
    void updateVehicle_VehicleNotFound() {
        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.empty());

        assertThrows(VehicleNotFoundException.class,
                () -> vehicleService.updateVehicle(vehicleId, vehicleRequest));
    }

    //vehicle deleted successfully test case
    @Test
    void deleteVehicle_Success() {
        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.of(vehicle));

        vehicleService.deleteVehicle(vehicleId);

        verify(vehicleRepository).delete(vehicle);
    }

    // deleting should not be allowed if the vehicle is already booked
    @Test
    void deleteVehicle_BookedVehicle() {
        vehicle.setStatus(VehicleStatus.BOOKED);
        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.of(vehicle));

        assertThrows(VehicleDeletionNotAllowedException.class,
                () -> vehicleService.deleteVehicle(vehicleId));
    }

    // vehicle should be fetched successfully with the vehicle id
    @Test
    void findById_Success() {
        when(vehicleRepository.findById(vehicleId)).thenReturn(Optional.of(vehicle));
        when(vehicleMapper.toResponse(vehicle)).thenReturn(vehicleResponse);

        VehicleResponse result = vehicleService.findById(vehicleId);

        assertNotNull(result);
        assertEquals(vehicleResponse.getId(), result.getId());
    }

    // all the vehicle should be fetched successfully
    @Test
    void findAll_Success() {
        List<Vehicle> vehicles = Arrays.asList(vehicle);
        List<VehicleResponse> responses = Arrays.asList(vehicleResponse);

        when(vehicleRepository.findAll()).thenReturn(vehicles);
        when(vehicleMapper.toResponseList(vehicles)).thenReturn(responses);

        List<VehicleResponse> result = vehicleService.findAll();

        assertEquals(1, result.size());
        assertEquals(vehicleResponse.getId(), result.get(0).getId());
    }

    // vehicles should be filter by type, status and location
    @Test
    void filterVehicles_AllFilters() {
        List<Vehicle> vehicles = Arrays.asList(vehicle);
        List<VehicleResponse> responses = Arrays.asList(vehicleResponse);

        when(vehicleRepository.findByTypeAndStatusAndLocationId(
                VehicleType.CAR, VehicleStatus.AVAILABLE, locationId)).thenReturn(vehicles);
        when(vehicleMapper.toResponseList(vehicles)).thenReturn(responses);

        List<VehicleResponse> result = vehicleService.filterVehicles(
                VehicleType.CAR, VehicleStatus.AVAILABLE, locationId);

        assertEquals(1, result.size());
    }

    // available vehicles should be returned for the valid date range
    @Test
    void findAvailableVehicles_Success() {
        LocalDateTime startDate = LocalDateTime.now().plusDays(1);
        LocalDateTime endDate = LocalDateTime.now().plusDays(3);
        List<Vehicle> vehicles = Arrays.asList(vehicle);
        List<VehicleResponse> responses = Arrays.asList(vehicleResponse);

        when(vehicleRepository.findAvailableVehicles(startDate, endDate, VehicleType.CAR, locationId))
                .thenReturn(vehicles);
        when(vehicleMapper.toResponseList(vehicles)).thenReturn(responses);

        List<VehicleResponse> result = vehicleService.findAvailableVehicles(
                startDate, endDate, VehicleType.CAR, locationId);

        assertEquals(1, result.size());
    }

    // exception should be thrown if the start data is after the end date
    @Test
    void findAvailableVehicles_InvalidDateRange() {
        LocalDateTime startDate = LocalDateTime.now().plusDays(3);
        LocalDateTime endDate = LocalDateTime.now().plusDays(1);

        assertThrows(IllegalArgumentException.class,
                () -> vehicleService.findAvailableVehicles(startDate, endDate, VehicleType.CAR, locationId));
    }
}
