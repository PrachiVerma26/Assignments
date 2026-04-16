package com.example.todo_application.model;

import com.example.todo_application.enums.Status;
import jakarta.persistence.*;
import jakarta.validation.constraints.*;


import java.time.LocalDateTime;

@Entity // indicates that this class is a persistent entity and will be mapped to a table in the database
@Table(name="Todo")
public class Todo {

    @Id //acts as the primary key in db
    @GeneratedValue(strategy = GenerationType.IDENTITY) //auto generates the id unique
    private Long id;

    @NotNull //ensures that the field value cannot be null
    @Size(min=3) //restrict the length of the field within specified limits
    private String title;

    @Size(max=200)
    private String description;

    @NotNull
    @Enumerated(EnumType.STRING) //store the enum in the database as its name (String), not as a number.
    private Status status;

    private LocalDateTime createdAt;

    //no-argument constructor
    public Todo(){}

    //all-argument constructor
    public Todo(String title, String description, Status status, LocalDateTime createdAt){
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
    public void setId(Long id) {this.id = id;}
    public void setTitle(String title) {this.title = title;}
    public void setDescription(String description) {this.description = description;}
    public void setStatus(Status status) {this.status = status;}
    public void setCreatedAt(LocalDateTime createdAt) {this.createdAt = createdAt;}

    //provides a readable string representation of the Todo object
    @Override
    public String toString() {
        return "Todo{" + "id=" + id + ", title='" + title + '\'' + ", status=" + status + '}';
    }
}
