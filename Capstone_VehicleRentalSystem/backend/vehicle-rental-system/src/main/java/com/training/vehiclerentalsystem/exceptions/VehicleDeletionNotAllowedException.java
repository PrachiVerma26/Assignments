package com.training.vehiclerentalsystem.exceptions;

public class VehicleDeletionNotAllowedException extends RuntimeException{
    public VehicleDeletionNotAllowedException(String message){
        super(message);
    }
}
