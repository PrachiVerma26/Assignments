package com.example.user_management_system.component;

import com.example.user_management_system.dto.UserRequestDTO;
import org.springframework.stereotype.Component;


@Component    //used to mark a class as a Spring-managed bean so that it can be automatically detected and injected where needed.
public class UserValidation {
    public void validate(UserRequestDTO requestDTO) {

        // validates the user's name is null or empty
        if (requestDTO.getName() == null || requestDTO.getName().isBlank()) {
            throw new IllegalArgumentException("Name must not be empty");
        }

        // validates the email format
        if (requestDTO.getEmail() == null || !isValidEmail(requestDTO.getEmail())) {
            throw new IllegalArgumentException("Email format is invalid");
        }

        // validates that the phone number contains atleat 10 digits
        if (requestDTO.getPhoneNo() == null || !isValidPhone(requestDTO.getPhoneNo())) {
            throw new IllegalArgumentException("Phone must be exactly 10 digits");
        }
    }

    //Validates email format using regex
    private boolean isValidEmail(String email) {
        return email.matches("^[\\w.-]+@[\\w.-]+\\.[a-zA-Z]{2,}$");
    }

    //validates phone number using regex
    private boolean isValidPhone(String phone) {
        return phone.matches("^[0-9]{10}$");
    }
}
