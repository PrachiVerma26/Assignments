package com.example.todo_application.exception;

//custom exception for handling invalid status transition validation
public class InvalidStatusTransitionException extends RuntimeException{
    public InvalidStatusTransitionException(String message){
        super(message);
    }
}
