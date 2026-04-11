package com.example.user_management_system.dto;

public class UserResponseDTO {
    private String name;
    private String phoneNo;
    private String email;

    public UserResponseDTO(String name, String email){
        this.name=name;
        this.email=email;
    }
    //getters
    public String getName() {
        return name;
    }
    public String getEmail() {
        return email;
    }
    public void setName(String name) {
        this.name = name;
    }
    public void setEmail(String email) {
        this.email = email;
    }
}
