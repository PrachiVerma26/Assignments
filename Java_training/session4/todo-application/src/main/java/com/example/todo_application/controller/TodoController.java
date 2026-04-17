package com.example.todo_application.controller;

import com.example.todo_application.dto.TodoRequestDTO;
import com.example.todo_application.dto.TodoResponseDTO;
import com.example.todo_application.service.TodoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController // marks this class as a REST controller to handle HTTP requests and return JSON responses
@RequestMapping("/todos") // base URL mapping for all Todo-related endpoints
public class TodoController {

    private final TodoService todoService;

    //constructor injection
    public TodoController(TodoService todoService){
        this.todoService=todoService;
    }

    // handles HTTP POST requests to create a new Todo
    @PostMapping
    public ResponseEntity<TodoResponseDTO> createTodo(@Valid @RequestBody TodoRequestDTO requestDTO){ // validates and maps incoming JSON request to DTO

        TodoResponseDTO response=todoService.createTodo(requestDTO);

        //return 201 CREATED after successful Todo creation
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

}
