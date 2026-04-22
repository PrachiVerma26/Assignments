package com.training.vehiclerentalsystem.dto.login;

import com.training.vehiclerentalsystem.enums.RoleType;
import lombok.*;

import java.util.Set;


@Data
@NoArgsConstructor
@AllArgsConstructor
public class LoginResponse {

    private String message;
    private String email;
    private Set<RoleType> role;
}
