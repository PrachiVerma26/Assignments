package com.example.todo_application.service;

import com.example.todo_application.dto.TodoRequestDTO;
import com.example.todo_application.dto.TodoResponseDTO;
import com.example.todo_application.model.Todo;
import com.example.todo_application.repository.TodoRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service  // marks this class as a service layer component containing business logic
public class TodoService {

    private final TodoRepository todoRepository;

    //constructor injection
    public TodoService(TodoRepository todoRepository){
        this.todoRepository=todoRepository;
    }

    //create a new todo
    public TodoResponseDTO createTodo(TodoRequestDTO requestDTO) {

        // Persist Todo entity and return the saved instance with generated ID
        Todo savedTodo=todoRepository.save(toEntity(requestDTO));

        // Convert saved entity to response DTO
        return toResponse(savedTodo);
    }

    //mapping request-dto to todo entity and also sets the created timestamp
    private Todo toEntity(TodoRequestDTO requestDTO){
        Todo todo=new Todo();
        todo.setTitle(requestDTO.getTitle());
        todo.setDescription(requestDTO.getDescription());
        todo.setStatus(requestDTO.getStatus());
        todo.setCreatedAt(LocalDateTime.now());
        return todo;
    }

    //convert todo entity to response dto
    private TodoResponseDTO toResponse(Todo todo){
        return new TodoResponseDTO(
                todo.getId(),
                todo.getTitle(),
                todo.getDescription(),
                todo.getStatus(),
                todo.getCreatedAt()
        );
    }
}
