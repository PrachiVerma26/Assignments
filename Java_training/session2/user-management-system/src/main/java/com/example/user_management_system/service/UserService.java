package com.example.user_management_system.service;

import com.example.user_management_system.component.UserValidation;
import com.example.user_management_system.dto.UserRequestDTO;
import com.example.user_management_system.dto.UserResponseDTO;
import com.example.user_management_system.entity.User;
import com.example.user_management_system.exception.UserNotFoundException;
import com.example.user_management_system.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserValidation userValidation;

    //constructor injection
    public UserService(UserRepository userRepository, UserValidation userValidation){
        this.userRepository=userRepository;
        this.userValidation=userValidation;
    }

    //get all user method
    public List<UserResponseDTO> getAllUsers(){
        return userRepository.findAll()
                .stream()
                .map(this::convertToResponseDTO)
                .toList();
    }
    // maps user entity to user response dto
    private UserResponseDTO convertToResponseDTO(User user){
        return new UserResponseDTO(
            user.getId(),
            user.getName(),
            user.getEmail()
        );
    }

    //create new user
    public UserResponseDTO createUser(UserRequestDTO requestDTO) {
        // added user validation component
        userValidation.validate(requestDTO);

        // checking if the email exists already or not
        if (userRepository.existsByEmail(requestDTO.getEmail())) {
            throw new IllegalArgumentException("Email already registered");
        }
        User user=convertToEntity(requestDTO);
        User savedUser=userRepository.save(user);
        return convertToResponseDTO(savedUser);
    }

    //maps fields from user request dto to user entity
    private User convertToEntity(UserRequestDTO dto){
        User user=new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPhoneNo(dto.getPhoneNo());
        user.setAddress(dto.getAddress());
        return user;
    }

    //get user by its id
    public UserResponseDTO getUserById(Long id) {
        User user= userRepository.findById(id)
                .orElseThrow(()-> new UserNotFoundException("User not found"));
        return convertToResponseDTO(user);
    }
}
