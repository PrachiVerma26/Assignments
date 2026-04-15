package com.example.usermanagement.v2.exception;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice // global exception handler for all exceptions
public class GlobalExceptionHandler {

    //handles validation related exceptions and returns http 400 response
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<String> handleIllegalArgumentException(IllegalArgumentException e){

        //return error response with message and status code
        return ResponseEntity.badRequest().body(e.getMessage());
    }

}
