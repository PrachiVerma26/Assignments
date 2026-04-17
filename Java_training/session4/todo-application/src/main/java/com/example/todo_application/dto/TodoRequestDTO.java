package com.example.todo_application.dto;

import com.example.todo_application.enums.Status;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;


// represents incoming request data for creating or updating a Todo
public class TodoRequestDTO {

    @NotBlank (message="Title is required") // ensures the field is not null, empty, or only whitespace
    @Size(min=3) //restrict the length of the field within specified limits
    private String title;

    @Size(min=3,max=200) // ensures the field length is between 3 and 200 characters
    private String description;

    @NotNull(message = "Status is required")
    private Status status;

    //no-argument constructor
    public TodoRequestDTO(){}

    //all-argument constructor
    public TodoRequestDTO(String title, String description, Status status){
        this.title=title;
        this.description=description;
        this.status=status;
    }

    //getters
    public String getTitle() {return title;}
    public String getDescription() {return description;}
    public Status getStatus() {return status;}

    //setters
    public void setTitle(String title) {this.title = title;}
    public void setDescription(String description) {this.description = description;}
    public void setStatus(Status status) {this.status = status;}
}
