package com.training.vehiclerentalsystem.exceptions;

public class BookingConflictException extends RuntimeException {
    public BookingConflictException(String message) {
        super(message);
    }
}
