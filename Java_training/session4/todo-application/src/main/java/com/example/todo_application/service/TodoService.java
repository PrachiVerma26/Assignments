package com.example.todo_application.service;

import com.example.todo_application.dto.TodoRequestDTO;
import com.example.todo_application.dto.TodoResponseDTO;
import com.example.todo_application.model.Todo;
import com.example.todo_application.repository.TodoRepository;
import jakarta.validation.Valid;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.NoSuchElementException;

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

    // fetches all Todo items from the database and converts them to response DTOs
    public List<TodoResponseDTO> getAllTodos(){
        return todoRepository.findAll()  // fetch all Todo entities from database
                .stream()                 // convert list to stream for functional processing
                .map(this::toResponse)    // transform each Todo entity to TodoResponseDTO
                .toList();                // collect results back into a list
    }

    //fetches a Todo item by its unique ID from the database
    public TodoResponseDTO getTodoById(Long id) {
        Todo todo= todoRepository.findById(id)
                .orElseThrow(() -> new NoSuchElementException("Todo not found with id: " + id)); //throw exception if not found
        return toResponse(todo); //convert entity to dto
    }

    //* Updates an existing Todo item with new data
    public TodoResponseDTO updateTodoById(Long id, @Valid TodoRequestDTO requestDTO) {

        // fetch existing Todo from database or throw exception if not found
        Todo existingTodo = todoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Todo not found with id: " + id)); // NoSuchElementException if no Todo exists with the given ID

        // replace all fields with new values
        existingTodo.setTitle(requestDTO.getTitle());
        existingTodo.setDescription(requestDTO.getDescription());
        existingTodo.setStatus(requestDTO.getStatus());

        // persist updated Todo to database
        Todo updated = todoRepository.save(existingTodo);

        // convert updated entity to response DTO
        return toResponse(updated);

    }

    //deletes a Todo item from the database by its Id
    public void deleteTodoById(Long id){

        // Check if Todo exists or not
        if (!todoRepository.existsById(id)) {
            throw new RuntimeException("Todo not found with id: " + id); //throws RuntimeException if no Todo exists with the given Id
        }
        // Delete Todo from database
        todoRepository.deleteById(id);
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
