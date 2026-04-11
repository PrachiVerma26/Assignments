package com.example.user_management_system.exception;

//custom exception for handling user already existed
public class UserAlreadyExistsException extends RuntimeException {
    public UserAlreadyExistsException(String message) {
        super(message);
    }
}