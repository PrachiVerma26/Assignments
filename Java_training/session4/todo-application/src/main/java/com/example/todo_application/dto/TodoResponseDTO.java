package com.example.todo_application.dto;

import com.example.todo_application.enums.Status;

import java.time.LocalDateTime;

// represents the data returned to the client after Todo operations
public class TodoResponseDTO {

    private Long id;
    private String title;
    private String description;
    private Status status;
    private LocalDateTime createdAt;

    //no-argumnet constructor
    public TodoResponseDTO() {}

    //all-argument constructor
    public TodoResponseDTO(Long id,String title, String description, Status status, LocalDateTime createdAt){
        this.id=id;
        this.title=title;
        this.description=description;
        this.status=status;
        this.createdAt=createdAt;
    }

    //getters

    public Long getId() {return id;}
    public String getTitle() {return title;}
    public String getDescription() {return description;}
    public Status getStatus() {return status;}
    public LocalDateTime getCreatedAt() {return createdAt;}

    //setters
    public void setId(Long id){this.id=id;}
    public void setTitle(String title) {this.title = title;}
    public void setDescription(String description) {this.description = description;}
    public void setStatus(Status status) {this.status = status;}
    public void setCreatedAt(LocalDateTime createdAt) {this.createdAt = createdAt;}

}
