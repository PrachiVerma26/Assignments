package com.example.user_management_system.controller;

import com.example.user_management_system.dto.UserRequestDTO;
import com.example.user_management_system.dto.UserResponseDTO;
import com.example.user_management_system.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    private final UserService userService;

    //constructor injection
    public UserController(UserService userService){
        this.userService=userService;
    }

    // get all users
    @GetMapping
    public ResponseEntity<List<UserResponseDTO>> getAllUsers(){
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // add new user
    @PostMapping
    public ResponseEntity<UserResponseDTO> createUser(@RequestBody UserRequestDTO requestDTO){
        UserResponseDTO createdUser=userService.createUser(requestDTO);
        return ResponseEntity.status(201).body(createdUser);  // returns 201-status code (created) when a new user is successfully created
    }

    // get specific user by its ID
    @GetMapping("/{id}")
    public UserResponseDTO getUserById(@PathVariable Long id){
        return userService.getUserById(id);
    }

}
