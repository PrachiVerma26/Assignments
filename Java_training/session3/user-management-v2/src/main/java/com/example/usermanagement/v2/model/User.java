package com.example.usermanagement.v2.model;

public class User {

    private Long id;
    private String name;
    private Integer age;
    private String role;

    //no-argument constructor
    User(){}

    //parametrized constructor
    public User(String name,String role, Integer age){
        this.name=name;
        this.role=role;
        this.age=age;
    }

    //getters
    public Long getId() {
        return id;
    }
    public String getName(){
        return name;
    }
    public Integer getAge() {
        return age;
    }
    public String getRole(){
        return role;
    }

    //setters
    public void setId(Long id){ this.id=id;}
    public void setName(String name){this.name=name;}
    public void setAge(Integer age){ this.age=age;}
    public void setRole(String role) {this.role=role;}
}
