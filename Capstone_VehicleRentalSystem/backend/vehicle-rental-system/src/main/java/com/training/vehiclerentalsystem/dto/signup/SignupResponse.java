package com.training.vehiclerentalsystem.dto.signup;

import com.training.vehiclerentalsystem.enums.RoleType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Set;
import java.util.UUID;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SignupResponse {
    private UUID userId;
    private String email;
    private String name;
    private Set<RoleType> roles;
}