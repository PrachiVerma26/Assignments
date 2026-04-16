package com.example.usermanagement.v2.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice // global exception handler for all exceptions
public class GlobalExceptionHandler {

    //handles validation related exceptions and returns http 400 response
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgumentException(IllegalArgumentException e){

        //return error response with message and status code
        return ResponseEntity.badRequest().body(e.getMessage());
    }

    //handles user not found exception
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<Map<String,Object>> handleUserNotFound(UserNotFoundException e){
        Map<String,Object> response=new HashMap<>();
        response.put("message", e.getMessage());
        response.put("status", HttpStatus.NOT_FOUND.value()); //it will return status code 404- not found

        //returns error response with message and status code
        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

}
