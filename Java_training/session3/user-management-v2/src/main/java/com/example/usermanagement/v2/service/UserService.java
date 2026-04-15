package com.example.usermanagement.v2.service;

import com.example.usermanagement.v2.dto.UserRequestDTO;
import com.example.usermanagement.v2.dto.UserResponseDTO;
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
    public UserResponseDTO createUser(UserRequestDTO request) {
        User user=new User(
        request.getName(),
        request.getRole(),
        request.getAge()
        );
        User savedUser=userRepository.save(user);
        return toResponse(savedUser); // convert saved user entity into response DTO and return it
    }
    //search user with params
    public List<UserResponseDTO> searchUsers(String name, String role, Integer age){
        List<User> users=userRepository.findAll(); // fetches all users from repository
        List<User> result=users.stream()
                // filter by name (case-insensitive), ignore if name is null
                .filter(u-> name ==null ||
                        (u.getName()!=null && u.getName().equalsIgnoreCase(name)))
                // Filter by role(case-insensitive), ignore if role is null
                .filter(u-> role==null ||
                        (u.getRole()!= null && u.getRole().equalsIgnoreCase(role)))
                // Filter by age (exact-match), ignore if age is null
                .filter(u->age ==null ||
                        (u.getAge()!= null && u.getAge().equals(age)))
                .toList();

        // convert filtered User entities into response dto's and return the result
        return result.stream()
                .map(this :: toResponse)
                .toList();
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
