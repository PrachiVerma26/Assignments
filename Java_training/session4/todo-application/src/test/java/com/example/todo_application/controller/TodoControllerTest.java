package com.example.todo_application.controller;

import com.example.todo_application.dto.TodoRequestDTO;
import com.example.todo_application.dto.TodoResponseDTO;
import com.example.todo_application.enums.Status;
import com.example.todo_application.service.TodoService;
import com.fasterxml.jackson.databind.ObjectMapper;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest //Use @WebMvcTest to load only controller layer (fast and isolated)
class TodoControllerTest {

    @Autowired // Injected by Spring Test context
    private MockMvc mockMvc; // MockMvc simulates HTTP requests (GET, POST, PUT, DELETE)

    // Mock service layer (controller depends on it)
    @MockBean
    private TodoService todoService;

    // Used to convert Java objects to JSON
    @Autowired
    private ObjectMapper objectMapper;

    //Create Todo
    //Endpoint: POST /todos
    //verifies: status = 201 CREATED
    @Test
    void shouldCreateTodo() throws Exception {

        // arrange
        TodoRequestDTO request = new TodoRequestDTO("Title", "Desc", Status.PENDING);
        TodoResponseDTO response = new TodoResponseDTO(1L, "Title", "Desc", Status.PENDING, null);

        when(todoService.createTodo(any())).thenReturn(response);

        // act + assert
        mockMvc.perform(post("/todos")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title").value("Title"));
    }

    //get All Todos
    //endpoint: GET /todos
    //verifies: Status = 200 OK
    @Test
    void shouldReturnAllTodos() throws Exception {

        // arrange
        List<TodoResponseDTO> list = List.of(
                new TodoResponseDTO(1L, "Task", "Desc", Status.PENDING, null)
        );

        when(todoService.getAllTodos()).thenReturn(list);

        // act + assert
        mockMvc.perform(get("/todos"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.size()").value(1));
    }
}