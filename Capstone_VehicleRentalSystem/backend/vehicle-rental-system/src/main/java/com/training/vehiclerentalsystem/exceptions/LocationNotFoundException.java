package com.training.vehiclerentalsystem.exceptions;

public class LocationNotFoundException extends ResourceNotFoundException{
    public LocationNotFoundException(String message){
        super(message);
    }
}
