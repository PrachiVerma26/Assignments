package com.example.usermanagement.v2.dto;

public class UserResponseDTO {
    private Long id;
    private String name;
    private Integer age;
    private String role;

    public UserResponseDTO(Long id, String name, Integer age, String role){
        this.id=id;
        this.name=name;
        this.age=age;
        this.role=role;
    }

    //getters

    public Long getId() {
        return id;
    }
    public String getName() {
        return name;
    }
    public Integer getAge() {
        return age;
    }
    public String getRole() {
        return role;
    }

    //setters

    public void setId(Long id) {
        this.id = id;
    }
    public void setName(String name) {
        this.name = name;
    }
    public void setAge(Integer age) {
        this.age = age;
    }
    public void setRole(String role) {
        this.role = role;
    }
}
