package com.training.vehiclerentalsystem.mapper;

import com.training.vehiclerentalsystem.dto.vehicle.VehicleRequest;
import com.training.vehiclerentalsystem.dto.vehicle.VehicleResponse;
import com.training.vehiclerentalsystem.enums.VehicleStatus;
import com.training.vehiclerentalsystem.enums.VehicleType;
import com.training.vehiclerentalsystem.model.Location;
import com.training.vehiclerentalsystem.model.Vehicle;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

/* Test class for VehicleMapper( Tests conversion between VehicleRequest DTO, Vehicle Entity, and VehicleResponse DTO) */
@ExtendWith(MockitoExtension.class)
class VehicleMapperTest {

    // inject dependencies
    @InjectMocks
    private VehicleMapper vehicleMapper;

    private VehicleRequest vehicleRequest;
    private Vehicle vehicle;
    private Location location;
    private UUID vehicleId;
    private UUID locationId;

    @BeforeEach
    void setUp() {
        vehicleId = UUID.randomUUID();
        locationId = UUID.randomUUID();

        // Setup location
        location = new Location();
        location.setId(locationId);
        location.setAddress("123 Main St");
        location.setCity("Mumbai");
        location.setState("Maharashtra");
        location.setPincode("400001");

        // Setup vehicle request
        vehicleRequest = new VehicleRequest();
        vehicleRequest.setBrand("Honda");
        vehicleRequest.setModel("Civic");
        vehicleRequest.setType(VehicleType.CAR);
        vehicleRequest.setStatus(VehicleStatus.AVAILABLE);
        vehicleRequest.setDailyRentalRate(BigDecimal.valueOf(1500));
        vehicleRequest.setRegistrationNumber("ABC123");
        vehicleRequest.setDescription("Sedan car");
        vehicleRequest.setProfileUrl("http://example.com/image.jpg");
        vehicleRequest.setLocationId(locationId);

        // Setup vehicle entity
        vehicle = new Vehicle();
        vehicle.setId(vehicleId);
        vehicle.setBrand("Honda");
        vehicle.setModel("Civic");
        vehicle.setType(VehicleType.CAR);
        vehicle.setStatus(VehicleStatus.AVAILABLE);
        vehicle.setDailyRentalRate(BigDecimal.valueOf(1500));
        vehicle.setRegistrationNumber("ABC123");
        vehicle.setDesc("Sedan car");
        vehicle.setProfileUrl("http://example.com/image.jpg");
        vehicle.setLocation(location);
    }

    /* Convert VehicleRequest to Vehicle Entity */
    @Test
    void toEntity_Success() {
        Vehicle result = vehicleMapper.toEntity(vehicleRequest);

        assertNotNull(result);
        assertEquals(vehicleRequest.getBrand(), result.getBrand());
        assertEquals(vehicleRequest.getModel(), result.getModel());
        assertEquals(vehicleRequest.getType(), result.getType());
        assertEquals(vehicleRequest.getStatus(), result.getStatus());
        assertEquals(vehicleRequest.getDailyRentalRate(), result.getDailyRentalRate());
        assertEquals(vehicleRequest.getRegistrationNumber(), result.getRegistrationNumber());
    }

    /* Convert VehicleRequest with all fields to Vehicle Entity */
    @Test
    void toEntity_AllFieldsMapped() {
        Vehicle result = vehicleMapper.toEntity(vehicleRequest);

        assertNotNull(result);
        assertNotNull(result.getBrand());
        assertNotNull(result.getModel());
        assertNotNull(result.getType());
        assertNotNull(result.getStatus());
        assertNotNull(result.getDailyRentalRate());
        assertNotNull(result.getRegistrationNumber());
        assertEquals("Sedan car", result.getDesc());
        assertEquals("http://example.com/image.jpg", result.getProfileUrl());
    }

    /* Convert Vehicle Entity to VehicleResponse DTO */
    @Test
    void toResponse_Success() {
        VehicleResponse result = vehicleMapper.toResponse(vehicle);

        assertNotNull(result);
        assertEquals(vehicle.getId(), result.getId());
        assertEquals(vehicle.getBrand(), result.getBrand());
        assertEquals(vehicle.getModel(), result.getModel());
        assertEquals(vehicle.getType(), result.getType());
        assertEquals(vehicle.getStatus(), result.getStatus());
        assertEquals(vehicle.getDailyRentalRate(), result.getDailyRentalRate());
        assertEquals(vehicle.getRegistrationNumber(), result.getRegistrationNumber());
    }

    /* Convert Vehicle with Location info to VehicleResponse */
    @Test
    void toResponse_WithLocationInfo() {
        VehicleResponse result = vehicleMapper.toResponse(vehicle);

        assertNotNull(result);
        assertNotNull(result.getLocation());
        assertEquals(location.getId(), result.getLocation().getId());
        assertEquals(location.getAddress(), result.getLocation().getAddress());
        assertEquals(location.getCity(), result.getLocation().getCity());
        assertEquals(location.getState(), result.getLocation().getState());
        assertEquals(location.getPincode(), result.getLocation().getPincode());
    }

    /* Convert Vehicle with null Location to VehicleResponse */
    @Test
    void toResponse_WithNullLocation() {
        vehicle.setLocation(null);

        VehicleResponse result = vehicleMapper.toResponse(vehicle);

        assertNotNull(result);
        assertNull(result.getLocation());
    }

    /* Convert list of Vehicles to list of VehicleResponses */
    @Test
    void toResponseList_Success() {
        Vehicle vehicle2 = new Vehicle();
        vehicle2.setId(UUID.randomUUID());
        vehicle2.setBrand("Toyota");
        vehicle2.setModel("Camry");
        vehicle2.setLocation(location);

        List<Vehicle> vehicles = Arrays.asList(vehicle, vehicle2);
        List<VehicleResponse> result = vehicleMapper.toResponseList(vehicles);

        assertNotNull(result);
        assertEquals(2, result.size());
        assertEquals(vehicle.getId(), result.get(0).getId());
        assertEquals(vehicle2.getId(), result.get(1).getId());
    }

    /* Convert empty list of Vehicles */
    @Test
    void toResponseList_EmptyList() {
        List<Vehicle> vehicles = Arrays.asList();

        List<VehicleResponse> result = vehicleMapper.toResponseList(vehicles);

        assertNotNull(result);
        assertTrue(result.isEmpty());
    }

    /* Update existing Vehicle from VehicleRequest */
    @Test
    void updateEntityFromRequest_Success() {
        // Arrange
        Vehicle existingVehicle = new Vehicle();
        existingVehicle.setId(vehicleId);
        existingVehicle.setBrand("Old Brand");
        existingVehicle.setModel("Old Model");

        VehicleRequest updateRequest = new VehicleRequest();
        updateRequest.setBrand("New Brand");
        updateRequest.setModel("New Model");
        updateRequest.setType(VehicleType.BIKE);
        updateRequest.setStatus(VehicleStatus.MAINTENANCE);
        updateRequest.setDailyRentalRate(BigDecimal.valueOf(2000));
        updateRequest.setRegistrationNumber("XYZ789");
        updateRequest.setDescription("Updated description");
        updateRequest.setProfileUrl("http://example.com/new-image.jpg");

        vehicleMapper.updateEntityFromRequest(updateRequest, existingVehicle);

        assertEquals("New Brand", existingVehicle.getBrand());
        assertEquals("New Model", existingVehicle.getModel());
        assertEquals(VehicleType.BIKE, existingVehicle.getType());
        assertEquals(VehicleStatus.MAINTENANCE, existingVehicle.getStatus());
        assertEquals(BigDecimal.valueOf(2000), existingVehicle.getDailyRentalRate());
        assertEquals("XYZ789", existingVehicle.getRegistrationNumber());
    }


    /* Verify daily rental rate is correctly mapped */
    @Test
    void toResponse_VerifyDailyRentalRate() {
        BigDecimal rate = BigDecimal.valueOf(2500);
        vehicle.setDailyRentalRate(rate);

        VehicleResponse result = vehicleMapper.toResponse(vehicle);

        assertEquals(rate, result.getDailyRentalRate());
    }
}
