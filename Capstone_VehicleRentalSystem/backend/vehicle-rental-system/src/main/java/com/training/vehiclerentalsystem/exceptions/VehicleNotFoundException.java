package com.training.vehiclerentalsystem.exceptions;

public class VehicleNotFoundException extends ResourceNotFoundException{

    public VehicleNotFoundException(String message){
        super(message);
    }
}
