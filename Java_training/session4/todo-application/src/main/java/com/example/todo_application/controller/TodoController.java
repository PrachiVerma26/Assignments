package com.example.todo_application.controller;

import com.example.todo_application.dto.TodoRequestDTO;
import com.example.todo_application.dto.TodoResponseDTO;
import com.example.todo_application.service.TodoService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController // marks this class as a REST controller to handle HTTP requests and return JSON responses
@RequestMapping("/todos") // base URL mapping for all Todo-related endpoints
public class TodoController {

    private final TodoService todoService;

    // Logger instance specific to this class
    private static final Logger log = LoggerFactory.getLogger(TodoController.class);

    //constructor injection
    public TodoController(TodoService todoService){
        this.todoService=todoService;
    }

    // handles HTTP POST requests to create a new Todo
    @PostMapping
    public ResponseEntity<TodoResponseDTO> createTodo(@Valid @RequestBody TodoRequestDTO requestDTO){ // validates and maps incoming JSON request to DTO

        log.info("Creating new todo with title: {}", requestDTO.getTitle());
        TodoResponseDTO response=todoService.createTodo(requestDTO);

        log.info("Todo created successfully!");
        //return 201 CREATED after successful Todo creation
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // handles HTTP GET requests to fetch all Todo's
    @GetMapping()
    public ResponseEntity<List<TodoResponseDTO>> getAllTodos(){

        log.info("Successfully fetched all Todo's!");
        //return ResponseEntity containing a list of TodoResponseDTO with HTTP 200 OK status
        return ResponseEntity.ok(todoService.getAllTodos());
    }

    // get specific todo by its Id with HTTP 200 OK status
    @GetMapping("/{id}")
    public ResponseEntity<TodoResponseDTO> getTodoById(@PathVariable Long id){
        log.info("Fetching todo with id: {}",id);
        //return ResponseEntity containing TodoResponseDTO with HTTP 200 OK status
        return ResponseEntity.ok(todoService.getTodoById(id));
    }

    // updates an existing Todo task by its Id
    @PutMapping("/{id}")
    public ResponseEntity<TodoResponseDTO> updateTodoById(
            @PathVariable Long id,
            @Valid @RequestBody TodoRequestDTO requestDTO){ //requestDTO - the DTO containing updated Todo data

        log.info("Updating todo with id: {}",id);
        TodoResponseDTO response= todoService.updateTodoById(id,requestDTO);

        log.info("Updated todo successfully!");
        // Return updated Todo with HTTP 200 OK status
        return ResponseEntity.ok(response);
    }

    //deletes the Todo task by its Id
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTodoById(@PathVariable Long id){

        log.info("Deleting todo with id: {}",id);
        todoService.deleteTodoById(id);

        log.info("Todo deleted successully!");
        // returns 204 no-content status after successful deletion
        return ResponseEntity.noContent().build();
    }
}
