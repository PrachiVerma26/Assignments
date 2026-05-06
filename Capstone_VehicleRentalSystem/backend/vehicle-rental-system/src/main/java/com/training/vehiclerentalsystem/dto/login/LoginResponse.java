package com.training.vehiclerentalsystem.dto.login;

import lombok.*;



@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {

    private String token;
    private String message;
    private String email;
    private String role;
}
