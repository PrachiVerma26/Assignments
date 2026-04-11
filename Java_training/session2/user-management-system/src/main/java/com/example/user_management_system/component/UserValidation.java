package com.example.user_management_system.component;

import com.example.user_management_system.dto.UserRequestDTO;
import org.springframework.stereotype.Component;


@Component    //used to mark a class as a Spring-managed bean so that it can be automatically detected and injected where needed.
public class UserValidation {
    public void validate(UserRequestDTO requestDTO) {

        if (requestDTO.getName() == null || requestDTO.getName().isBlank()) {
            throw new IllegalArgumentException("Name must not be empty");
        }

        if (requestDTO.getEmail() == null || !isValidEmail(requestDTO.getEmail())) {
            throw new IllegalArgumentException("Email format is invalid");
        }

        if (requestDTO.getPhoneNo() == null || !isValidPhone(requestDTO.getPhoneNo())) {
            throw new IllegalArgumentException("Phone must be exactly 10 digits");
        }
    }

    private boolean isValidEmail(String email) {
        return email.matches("^[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}$");
    }

    private boolean isValidPhone(String phone) {
        return phone.matches("^[0-9]{10}$");
    }
}
