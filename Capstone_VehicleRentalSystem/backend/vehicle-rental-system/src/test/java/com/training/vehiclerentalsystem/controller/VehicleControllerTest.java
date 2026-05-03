package com.training.vehiclerentalsystem.controller;

import com.training.vehiclerentalsystem.dto.vehicle.VehicleResponse;
import com.training.vehiclerentalsystem.enums.VehicleStatus;
import com.training.vehiclerentalsystem.enums.VehicleType;
import com.training.vehiclerentalsystem.service.VehicleService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/* testing vehicles controller endpoints*/
@ExtendWith(MockitoExtension.class)
class VehicleControllerTest {

    // mock dependencies
    @Mock
    private VehicleService vehicleService;

    // inject mock dependencies to the service layer
    @InjectMocks
    private VehicleController vehicleController;
    private VehicleResponse vehicleResponse;
    private UUID vehicleId;
    private UUID locationId;

    // to setup common test data for each test case
    @BeforeEach
    void setUp() {
        // generate random IDs for testing
        vehicleId = UUID.randomUUID();
        locationId = UUID.randomUUID();
        vehicleResponse = new VehicleResponse();
        vehicleResponse.setId(vehicleId);
        vehicleResponse.setBrand("Toyota");
        vehicleResponse.setModel("Camry");
    }

    // retrieve all vehicles data successfully
    @Test
    void getAllVehicles_Success() {
        List<VehicleResponse> vehicles = Arrays.asList(vehicleResponse);
        when(vehicleService.findAll()).thenReturn(vehicles);

        ResponseEntity<List<VehicleResponse>> response = vehicleController.getAllVehicles();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
        verify(vehicleService).findAll();
    }

    // fetch vehicle by it's id successfully
    @Test
    void getVehicleById_Success() {
        when(vehicleService.findById(vehicleId)).thenReturn(vehicleResponse);

        ResponseEntity<VehicleResponse> response = vehicleController.getVehicleById(vehicleId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(vehicleId, response.getBody().getId());
        verify(vehicleService).findById(vehicleId);
    }

    // filter vehicles test case
    @Test
    void filterVehicles_Success() {
        List<VehicleResponse> vehicles = Arrays.asList(vehicleResponse);
        when(vehicleService.filterVehicles(VehicleType.CAR, VehicleStatus.AVAILABLE, locationId))
                .thenReturn(vehicles);

        ResponseEntity<List<VehicleResponse>> response = vehicleController.filterVehicles(
                VehicleType.CAR, VehicleStatus.AVAILABLE, locationId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
    }


    // should return available vehicles for given type and location
    @Test
    void getAvailableVehicles_Success() {
        List<VehicleResponse> vehicles = Arrays.asList(vehicleResponse);
        when(vehicleService.filterVehicles(VehicleType.CAR, VehicleStatus.AVAILABLE, locationId))
                .thenReturn(vehicles);

        ResponseEntity<List<VehicleResponse>> response = vehicleController.getAvailableVehicles(
                VehicleType.CAR, locationId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
    }

    //  should return vehicles filtered by type only
    @Test
    void getVehiclesByType_Success() {
        List<VehicleResponse> vehicles = Arrays.asList(vehicleResponse);
        when(vehicleService.filterVehicles(VehicleType.CAR, null, null)).thenReturn(vehicles);

        ResponseEntity<List<VehicleResponse>> response = vehicleController.getVehiclesByType(VehicleType.CAR);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
    }

    // should return available vehicles for given date range
    @Test
    void getAvailableVehiclesByDate_Success() {
        LocalDateTime startDate = LocalDateTime.now().plusDays(1);
        LocalDateTime endDate = LocalDateTime.now().plusDays(3);
        List<VehicleResponse> vehicles = Arrays.asList(vehicleResponse);

        when(vehicleService.findAvailableVehicles(startDate, endDate, VehicleType.CAR, locationId))
                .thenReturn(vehicles);

        ResponseEntity<List<VehicleResponse>> response = vehicleController.getAvailableVehiclesByDate(
                startDate, endDate, VehicleType.CAR, locationId);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
    }
}
