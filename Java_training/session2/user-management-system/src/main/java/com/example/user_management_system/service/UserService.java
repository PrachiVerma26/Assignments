package com.example.user_management_system.service;

import com.example.user_management_system.dto.UserRequestDTO;
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
}
