package com.example.user_management_system.exception;

//custom exception for handling invalid message exception
public class InvalidMessageTypeException extends RuntimeException{
    public InvalidMessageTypeException(String message){
        super(message);
    }
}
