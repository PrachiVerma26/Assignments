package com.example.usermanagement.v2.service;

import com.example.usermanagement.v2.dto.UserRequestDTO;
import com.example.usermanagement.v2.dto.UserResponseDTO;
import com.example.usermanagement.v2.exception.UserNotFoundException;
import com.example.usermanagement.v2.model.User;
import com.example.usermanagement.v2.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {
    private final UserRepository userRepository;

    //constructor injection
    UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    //create new user
    public UserResponseDTO createUser(UserRequestDTO requestDTO) {

        // validate request data
        validateUserRequest(requestDTO);

        // convert request DTO to User entity
        User user = new User(
                requestDTO.getName(),
                requestDTO.getRole(),
                requestDTO.getAge()
        );
        User savedUser = userRepository.save(user);

        // convert saved entity to response dto
        return toResponse(savedUser);
    }

    //search user with params
    public List<UserResponseDTO> searchUsers(String name, String role, Integer age) {
        List<User> users = userRepository.findAll(); // fetches all users from repository
        List<User> result = users.stream()
                // filter by name (case-insensitive), ignore if name is null
                .filter(u -> name == null ||
                        (u.getName() != null && u.getName().equalsIgnoreCase(name)))
                // Filter by role(case-insensitive), ignore if role is null
                .filter(u -> role == null ||
                        (u.getRole() != null && u.getRole().equalsIgnoreCase(role)))
                // Filter by age (exact-match), ignore if age is null
                .filter(u -> age == null ||
                        (u.getAge() != null && u.getAge().equals(age)))
                .toList();

        // convert filtered User entities into response dto's and return the result
        return result.stream()
                .map(this::toResponse)
                .toList();
    }

    // handles delete operation with confirmation check
    public void deleteUser(Long id, Boolean confirm) {

        // Check confirmation
        if (confirm == null || !confirm) {
            throw new IllegalArgumentException("Confirmation required");
        }
        //
        if(!userRepository.deleteById(id)){
            throw new UserNotFoundException("User not ")
        }

        // Try deleting
        boolean deleted = userRepository.deleteById(id);

        // Handle not found
        if (!deleted) {
            throw new IllegalArgumentException("User with id "+ id+ " not found");
        }
    }

    // validates user input fields for null or empty values
    private void validateUserRequest(UserRequestDTO requestDTO) {

        // check if name is missing or blank
        if (requestDTO.getName() == null || requestDTO.getName().isBlank()) {
            throw new IllegalArgumentException("Name is required");
        }

        // check if role is missing or blank
        if (requestDTO.getRole() == null || requestDTO.getRole().isBlank()) {
            throw new IllegalArgumentException("Role is required");
        }

        // check if age is missing
        if (requestDTO.getAge() == null) {
            throw new IllegalArgumentException("Age is required");
        }
    }

    // mapping user entity to user response dto
    private UserResponseDTO toResponse(User user) {
        return new UserResponseDTO(
                user.getId(),
                user.getName(),
                user.getAge(),
                user.getRole()
        );
    }
}



