package com.example.user_management_system.service;

import com.example.user_management_system.dto.UserResponseDTO;
import com.example.user_management_system.entity.User;
import com.example.user_management_system.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;

    public UserService(UserRepository userRepository){
        this.userRepository=userRepository;
    }

    public List<UserResponseDTO> getAllUsers(){
        return userRepository.findAll()
                .stream()
                .map(this::convertToDTO)
                .toList();
    }
    private UserResponseDTO convertToDTO(User user){
        return new UserResponseDTO(
            user.getName(),
            user.getEmail()
        );
        }
}
