package com.training.vehiclerentalsystem.exceptions;

public class UserAlreadyExistsException extends RuntimeException{

    public UserAlreadyExistsException(String message){
        super(message);
    }
}
