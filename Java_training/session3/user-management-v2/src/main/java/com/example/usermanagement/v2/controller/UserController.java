package com.example.usermanagement.v2.controller;

import com.example.usermanagement.v2.dto.UserRequestDTO;
import com.example.usermanagement.v2.dto.UserResponseDTO;
import com.example.usermanagement.v2.service.UserService;
import org.springframework.http.HttpStatus;
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

    //create user
    @PostMapping
    public ResponseEntity<UserResponseDTO> createUser(
            @RequestBody UserRequestDTO request) {
        UserResponseDTO response = userService.createUser(request);

        // return response with HTTP 201 (Created) status after successfully creating a new user
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    //search endpoint
    @GetMapping("/search")
    public ResponseEntity<List<UserResponseDTO>> search(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String role,
            @RequestParam(required = false) Integer age) {

        //fetch filtered users from service and return response with HTTP 200 (OK)
        return ResponseEntity.ok(userService.searchUsers(name,role,age));
    }

    //submit endpoint
    @PostMapping("/submit")
    public ResponseEntity<UserResponseDTO> submit(@RequestBody UserRequestDTO requestDTO){
        UserResponseDTO createdUser=userService.createUser(requestDTO);

        // returns 201 created with the newly created user details
        return ResponseEntity.status(201).body(createdUser);
    }

    // deletes user only when confirmation is true
    @DeleteMapping("/delete/{id}")
    public ResponseEntity<String> deleteUser(
            @PathVariable Long id,
            @RequestParam(required = false) Boolean confirm) {

        userService.deleteUser(id, confirm);

        // returns 200 OK with confirmation message after successful deletion
        return ResponseEntity.ok("User deleted successfully");
    }

}
