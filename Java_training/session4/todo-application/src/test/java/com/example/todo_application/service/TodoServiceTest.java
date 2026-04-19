package com.example.todo_application.service;

import com.example.todo_application.dto.TodoRequestDTO;
import com.example.todo_application.dto.TodoResponseDTO;
import com.example.todo_application.enums.Status;
import com.example.todo_application.model.Todo;
import com.example.todo_application.repository.TodoRepository;
import com.example.todo_application.service.NotificationServiceClient;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
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
    //Approach:
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
}
