package com.example.todo_application.service;

import com.example.todo_application.dto.TodoRequestDTO;
import com.example.todo_application.dto.TodoResponseDTO;
import com.example.todo_application.enums.Status;
import com.example.todo_application.exception.InvalidStatusTransitionException;
import com.example.todo_application.exception.TodoNotFoundException;
import com.example.todo_application.model.Todo;
import com.example.todo_application.repository.TodoRepository;
import com.example.todo_application.service.NotificationServiceClient;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class) //enable mockito annotations
class TodoServiceTest {

    @Mock   // Mock( fake dependency: no db call)
    private TodoRepository todoRepository;

    @Mock
    private NotificationServiceClient notificationClient;

    @InjectMocks  // real service with mocked dependencies injected
    private TodoService todoService;


    //create todo method test case
    //approach:
    //mock repository save behavior
    //call service method
    //verify response + notification trigger

    @Test
    void shouldCreateTodoAndSendNotification() {

        // arrange: prepare input DTO and mock response
        TodoRequestDTO request = new TodoRequestDTO("Todo title", "Todo desc", Status.PENDING);

        Todo savedTodo = new Todo();
        savedTodo.setId(1L);
        savedTodo.setTitle("Todo title");
        savedTodo.setDescription("Todo desc");
        savedTodo.setStatus(Status.PENDING);

        when(todoRepository.save(any(Todo.class))).thenReturn(savedTodo);

        // act: call actual service method
        TodoResponseDTO response = todoService.createTodo(request);

        // assert: verify result correctness
        assertNotNull(response);
        assertEquals("Todo title", response.getTitle());

        // verify: notification was triggered once
        verify(notificationClient, times(1)).sendNotification("Todo title");
    }

    //get all Todos
    // approach:
    // mock repository to return list
    // verify list size and mapping
    @Test
    void shouldReturnAllTodos() {

        // arrange
        Todo todo = new Todo();
        todo.setId(1L);
        todo.setTitle("Task");

        when(todoRepository.findAll()).thenReturn(List.of(todo));

        // act
        List<TodoResponseDTO> result = todoService.getAllTodos();

        // assert: ensuring the list have at-least one item
        assertEquals(1, result.size());
        assertEquals("Task", result.get(0).getTitle());
    }

    //get Todo by id (success)
    //approach:
    // mock repository to return a Todo
    // verify correct mapping in response
    @Test
    void shouldReturnTodoById() {

        // arrange
        Todo todo = new Todo();
        todo.setId(1L);
        todo.setTitle("Task");
        when(todoRepository.findById(1L)).thenReturn(Optional.of(todo));
        // act
        TodoResponseDTO result = todoService.getTodoById(1L);
        // assert
        assertEquals("Task", result.getTitle());
    }

    //get Todo by id (failure)
    //approach:
    //mock repository to return empty
    //expect exception
    @Test
    void shouldThrowExceptionWhenTodoNotFound() {

        // arrange
        when(todoRepository.findById(1L)).thenReturn(Optional.empty());
        // act + assert
        assertThrows(TodoNotFoundException.class, () -> {
            todoService.getTodoById(1L);
        });
    }
}
