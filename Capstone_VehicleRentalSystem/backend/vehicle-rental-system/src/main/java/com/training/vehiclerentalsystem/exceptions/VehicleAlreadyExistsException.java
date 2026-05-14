package com.training.vehiclerentalsystem.exceptions;

public class VehicleAlreadyExistsException extends RuntimeException{
    public VehicleAlreadyExistsException(String message){
        super(message);
    }
}
