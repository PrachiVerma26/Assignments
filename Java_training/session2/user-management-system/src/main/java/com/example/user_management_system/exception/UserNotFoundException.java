package com.example.user_management_system.exception;

//custom exception for handling user does not exists
public class UserNotFoundException extends RuntimeException{
    public UserNotFoundException(String message) {
        super(message);
    }
}
