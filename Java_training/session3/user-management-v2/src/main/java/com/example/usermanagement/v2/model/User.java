package com.example.usermanagement.v2.model;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data // generates getter, setter, equals, hashcode and to-string method.
@AllArgsConstructor // it will generate a all argument constructor
@NoArgsConstructor  // it will generate no argument constructor
public class User {

    private Long id;
    private String name;
    private Integer age;
    private String role;

    public User(String name,String role, Integer age){
        this.name=name;
        this.role=role;
        this.age=age;
    }
}
