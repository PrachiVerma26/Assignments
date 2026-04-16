package com.example.user_management_system.exception;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice // handles all the custom and existing exception centrally
public class GlobalExceptionalHandler {

    //handle validation exceptions
    @ExceptionHandler(MethodArgumentNotValidException.class) // Handles specific exceptions and returns a custom HTTP response
    public ResponseEntity<Map<String, Object>> handleValidationException(
            MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(error ->
                        errors.put(error.getField(), error.getDefaultMessage())
                );
        Map<String, Object> response= new HashMap<>();
        response.put("status",HttpStatus.BAD_REQUEST.value()); // it will return 400 status code
        response.put("timestamp", LocalDateTime.now());
        response.put("errors", errors);
        return ResponseEntity.badRequest().body(response);
    }

    //handle user not found exception
    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleUserNotFound(UserNotFoundException e){
        Map<String, Object> response = new HashMap<>();
        response.put("message", e.getMessage());
        response.put("status", HttpStatus.NOT_FOUND.value()); //it will return 404 status code
        response.put("timestamp", LocalDateTime.now());

        return new ResponseEntity<>(response, HttpStatus.NOT_FOUND);
    }

    //user already exists
    @ExceptionHandler(UserAlreadyExistsException.class)
    public ResponseEntity<Map<String, Object>> handleUserExists(UserAlreadyExistsException e) {

        Map<String, Object> response = new HashMap<>();
        response.put("message", e.getMessage());
        response.put("status", HttpStatus.CONFLICT.value()); // it will return 409 status code(means request is valid but the user is already existed).
        response.put("timestamp", LocalDateTime.now());

        return new ResponseEntity<>(response, HttpStatus.CONFLICT);
    }

    // handle invalid message exception
    @ExceptionHandler(InvalidMessageTypeException.class)
    public ResponseEntity<Map<String, Object>> handleInvalidMessageType(InvalidMessageTypeException e){
        Map <String, Object> response=new HashMap<>();
        response.put("message",e.getMessage());
        response.put("status", HttpStatus.BAD_REQUEST.value()); // it will return 400 status code
        response.put("timestamp", LocalDateTime.now());

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }

    // handle invalid user input (manual validation)
    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalArgument(IllegalArgumentException e) {
        Map<String, Object> response = new HashMap<>();
        response.put("message", e.getMessage());
        response.put("status", HttpStatus.BAD_REQUEST.value()); // it will return 404 status code
        response.put("timestamp", LocalDateTime.now());

        return new ResponseEntity<>(response, HttpStatus.BAD_REQUEST);
    }
}