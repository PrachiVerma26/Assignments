package com.example.usermanagement.v2.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data //generates getter, setter, equals, hashcode and to-string method.
@AllArgsConstructor // it will generate a all argument constructor
@NoArgsConstructor  // it will generate no argument constructor
public class UserRequestDTO {

    private String name;
    private Integer age;
    private String role;
}
