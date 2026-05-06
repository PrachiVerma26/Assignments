package com.training.vehiclerentalsystem.controller;

import com.training.vehiclerentalsystem.dto.vehicle.VehicleRequest;
import com.training.vehiclerentalsystem.dto.vehicle.VehicleResponse;
import com.training.vehiclerentalsystem.exceptions.LocationNotFoundException;
import com.training.vehiclerentalsystem.exceptions.VehicleDeletionNotAllowedException;
import com.training.vehiclerentalsystem.exceptions.VehicleNotFoundException;
import com.training.vehiclerentalsystem.service.VehicleService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

/* test cases for admin controller endpoints */
@ExtendWith(MockitoExtension.class)
class AdminControllerTest {

    // mock external dependencies
    @Mock
    private VehicleService vehicleService;

    // inject mock dependencies to the service layer
    @InjectMocks
    private AdminController adminController;

    private VehicleRequest vehicleRequest;
    private VehicleResponse vehicleResponse;
    private UUID vehicleId;
    private UUID locationId;

    // setup common data for testing
    @BeforeEach
    void setUp() {
        // generate a random uuid for testing data
        vehicleId = UUID.randomUUID();
        locationId = UUID.randomUUID();

        vehicleRequest = new VehicleRequest();
        vehicleRequest.setBrand("Honda");
        vehicleRequest.setModel("Civic");
        vehicleRequest.setLocationId(locationId);
        vehicleRequest.setDailyRentalRate(BigDecimal.valueOf(1800));
        vehicleRequest.setRegistrationNumber("ABC123");

        vehicleResponse = new VehicleResponse();
        vehicleResponse.setId(vehicleId);
        vehicleResponse.setBrand("Honda");
        vehicleResponse.setModel("Civic");
        vehicleResponse.setRegistrationNumber("ABC123");
    }

    // create vehicle successfully
    @Test
    void createVehicle_Success() {
        when(vehicleService.createVehicle(vehicleRequest)).thenReturn(vehicleResponse);

        ResponseEntity<VehicleResponse> response = adminController.createVehicle(vehicleRequest);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals("Honda", response.getBody().getBrand());
        assertEquals("Civic", response.getBody().getModel());
        assertEquals("ABC123", response.getBody().getRegistrationNumber());
        verify(vehicleService).createVehicle(vehicleRequest);
    }


    // test case for checking a new vehicle can not be created with existing registration number
    @Test
    void createVehicle_DuplicateRegistrationNumber() {
        when(vehicleService.createVehicle(vehicleRequest))
                .thenThrow(new DataIntegrityViolationException("Duplicate registration number: ABC123"));

        DataIntegrityViolationException exception = assertThrows(DataIntegrityViolationException.class,
                () -> adminController.createVehicle(vehicleRequest));

        assertEquals("Duplicate registration number: ABC123", exception.getMessage());
        verify(vehicleService).createVehicle(vehicleRequest);
    }

    // update vehicle successfully
    @Test
    void updateVehicle_Success() {
        when(vehicleService.updateVehicle(vehicleId, vehicleRequest)).thenReturn(vehicleResponse);

        ResponseEntity<VehicleResponse> response = adminController.updateVehicle(vehicleId, vehicleRequest);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(vehicleId, response.getBody().getId());
        assertEquals("Honda", response.getBody().getBrand());
        verify(vehicleService).updateVehicle(vehicleId, vehicleRequest);
    }

    // test case for updating a vehicle which is not even exists
    @Test
    void updateVehicle_VehicleNotFoundException() {
        when(vehicleService.updateVehicle(vehicleId, vehicleRequest))
                .thenThrow(new VehicleNotFoundException("Vehicle not found with ID: " + vehicleId));

        VehicleNotFoundException exception = assertThrows(VehicleNotFoundException.class,
                () -> adminController.updateVehicle(vehicleId, vehicleRequest));

        assertEquals("Vehicle not found with ID: " + vehicleId, exception.getMessage());
        verify(vehicleService).updateVehicle(vehicleId, vehicleRequest);
    }

    // delete vehicle successfully
    @Test
    void deleteVehicle_Success() {
        doNothing().when(vehicleService).deleteVehicle(vehicleId);

        ResponseEntity<Void> response = adminController.deleteVehicle(vehicleId);

        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        assertNull(response.getBody());
        verify(vehicleService).deleteVehicle(vehicleId);
    }

    // test case for deleting a vehicle which have active booking
    @Test
    void deleteVehicle_VehicleDeletionNotAllowed() {
        doThrow(new VehicleDeletionNotAllowedException("Cannot delete vehicle with active bookings"))
                .when(vehicleService).deleteVehicle(vehicleId);

        VehicleDeletionNotAllowedException exception = assertThrows(VehicleDeletionNotAllowedException.class,
                () -> adminController.deleteVehicle(vehicleId));

        assertEquals("Cannot delete vehicle with active bookings", exception.getMessage());
        verify(vehicleService).deleteVehicle(vehicleId);
    }

    // get all vehicles test case
    @Test
    void getAllVehiclesAdmin_Success() {
        List<VehicleResponse> vehicles = Arrays.asList(vehicleResponse);
        when(vehicleService.findAll()).thenReturn(vehicles);

        ResponseEntity<List<VehicleResponse>> response = adminController.getAllVehiclesAdmin();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(1, response.getBody().size());
        assertEquals("Honda", response.getBody().get(0).getBrand());
        verify(vehicleService).findAll();
    }

    // get all vehicles even if the vehicle list is empty
    @Test
    void getAllVehiclesAdmin_EmptyList() {
        when(vehicleService.findAll()).thenReturn(Collections.emptyList());

        ResponseEntity<List<VehicleResponse>> response = adminController.getAllVehiclesAdmin();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());
        assertTrue(response.getBody().isEmpty());
        verify(vehicleService).findAll();
    }

    // Add vehicle with invalid input
    @Test
    void createVehicle_InvalidInput() {
        when(vehicleService.createVehicle(vehicleRequest))
                .thenThrow(new IllegalArgumentException("Invalid vehicle data"));

        IllegalArgumentException exception = assertThrows(IllegalArgumentException.class,
                () -> adminController.createVehicle(vehicleRequest));

        assertEquals("Invalid vehicle data", exception.getMessage());
        verify(vehicleService).createVehicle(vehicleRequest);
    }
}
