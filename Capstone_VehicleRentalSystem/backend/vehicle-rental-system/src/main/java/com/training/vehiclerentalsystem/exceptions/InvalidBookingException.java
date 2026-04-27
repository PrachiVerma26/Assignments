package com.training.vehiclerentalsystem.exceptions;

public class InvalidBookingException extends RuntimeException {
    public InvalidBookingException(String message) {
        super(message);
    }
}
