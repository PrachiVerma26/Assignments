package com.example.user_management_system.dto;

public class UserRequestDTO {
    private String name;
    private String email;
    private String phoneNo;
    private String address;

    public UserRequestDTO(String name, String email,String phoneNo, String address){
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
    public String getPhoneNo() {
        return phoneNo;
    }
    public String getAddress() {
        return address;
    }

    //setters
    public void setName(String name) {
        this.name = name;
    }
    public void setEmail(String email) {
        this.email = email;
    }
    public void setPhoneNo(String phoneNo) {
        this.phoneNo = phoneNo;
    }
    public void setAddress(String address) {
        this.address = address;
    }
}
