package com.example.user_management_system.service;

import com.example.user_management_system.component.UserValidation;
import com.example.user_management_system.dto.UserRequestDTO;
import com.example.user_management_system.dto.UserResponseDTO;
import com.example.user_management_system.entity.User;
import com.example.user_management_system.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final UserValidation userValidation;

    public UserService(UserRepository userRepository, UserValidation userValidation){
        this.userRepository=userRepository;
        this.userValidation=userValidation;
    }

    public List<UserResponseDTO> getAllUsers(){
        return userRepository.findAll()
                .stream()
                .map(this::convertToResponseDTO)
                .toList();
    }
    private UserResponseDTO convertToResponseDTO(User user){
        return new UserResponseDTO(
            user.getId(),
            user.getName(),
            user.getEmail()
        );
        }

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
    private User convertToEntity(UserRequestDTO dto){
        User user=new User();
        user.setName(dto.getName());
        user.setEmail(dto.getEmail());
        user.setPhoneNo(dto.getPhoneNo());
        user.setAddress(dto.getAddress());
        return user;
    }

    public UserResponseDTO getUserById(Long id) {
        User user= userRepository.findById(id)
                .orElseThrow(()-> new RuntimeException("User not found"));
        return convertToResponseDTO(user);
    }
}
