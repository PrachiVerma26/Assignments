package com.example.todo_application.controller;

import com.example.todo_application.dto.TodoRequestDTO;
import com.example.todo_application.dto.TodoResponseDTO;
import com.example.todo_application.service.TodoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

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

    // handles HTTP GET requests to fetch all Todo's
    @GetMapping()
    public ResponseEntity<List<TodoResponseDTO>> getAllTodos(){

        //return ResponseEntity containing a list of TodoResponseDTO with HTTP 200 OK status
        return ResponseEntity.ok(todoService.getAllTodos());
    }

    // get specific todo by its Id with HTTP 200 OK status
    @GetMapping("/{id}")
    public ResponseEntity<TodoResponseDTO> getUserById(@PathVariable Long id){

        //return ResponseEntity containing TodoResponseDTO with HTTP 200 OK status
        return ResponseEntity.ok(todoService.getTodoById(id));
    }

    // updates an existing Todo task by its Id
    @PutMapping("/{id}")
    public ResponseEntity<TodoResponseDTO> updateTodoById(
            @PathVariable Long id,
            @Valid @RequestBody TodoRequestDTO requestDTO){ //requestDTO - the DTO containing updated Todo data

        TodoResponseDTO response= todoService.updateTodoById(id,requestDTO);

        // Return updated Todo with HTTP 200 OK status
        return ResponseEntity.ok(response);
    }


}
