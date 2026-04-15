package com.example.usermanagement.v2.dto;

import lombok.Data; //
import lombok.AllArgsConstructor;
import lombok.NoArgsConstructor;

@Data //generates getter, setter, equals, hashcode and to-string method.
@AllArgsConstructor // it will generate a all argument constructor
@NoArgsConstructor  // it will generate no argument constructor
public class UserResponseDTO {
    private Long id;
    private String name;
    private int age;
    private String role;
}
