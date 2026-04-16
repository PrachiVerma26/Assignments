package com.example.usermanagement.v2.exception;

//custom exception for user does not exist
public class UserNotFoundException  extends RuntimeException{
    public UserNotFoundException(String message){
        super(message);
    }
}
