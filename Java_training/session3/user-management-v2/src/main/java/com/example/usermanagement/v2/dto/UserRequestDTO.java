package com.example.usermanagement.v2.dto;
public class UserRequestDTO {

    private String name;
    private Integer age;
    private String role;

    //all argument constructor
    public UserRequestDTO(String name, Integer age, String role){
        this.name=name;
        this.age=age;
        this.role=role;
    }

    //getters
    public String getName(){
        return name;
    }
    public Integer getAge() {
        return age;
    }
    public String getRole() {
        return role;
    }

    //setters
    public void setName(String name) {
        this.name = name;
    }
    public void setAge(Integer age) {
        this.age=age;
    }
    public void setRole(String role) {
        this.role = role;
    }
}
