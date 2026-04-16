package com.example.todo_application.repository;

import com.example.todo_application.enums.Status;
import com.example.todo_application.model.Todo;
import jakarta.annotation.PostConstruct;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.atomic.AtomicLong;

@Repository
public class TodoRepository {
    // In-memory store mapping todo ids to user objects
    private final Map<Long, Todo> todoMap=new HashMap<>();

    //Thread-safe unique id generator
    private final AtomicLong idCounter = new AtomicLong(1);

    // Pre-populates the in-memory storage with sample Todo data after bean initialization
    @PostConstruct
    private void initData() {
            save(new Todo("Shopping", "Buy new clothes for vacation", Status.PENDING, LocalDateTime.now()));
            save(new Todo("Workout", "Go to gym", Status.COMPLETED, LocalDateTime.now()));
    }
    //save todo
    public Todo save(Todo todo){
        Long id = idCounter.getAndIncrement();
        todo.setId(id);
        todoMap.put(id, todo);
        return todo;
    }

    //get all todo's list
    public List<Todo> findAll(){
        return new ArrayList<>(todoMap.values()); //converts map values to list
    }

    //find todo by id
    public Optional<Todo> findById(Long id){
        return Optional.ofNullable(todoMap.get(id));
    }

    /* update's todo : finds the todo by id, if found updates title, description and status in place
       since map holds a reference to the same object, no re-insertion needed */
    public Optional<Todo> updateById(Long id,Todo updateTodo){
        return findById(id).map(existing->{
            existing.setTitle(updateTodo.getTitle());
            existing.setDescription(updateTodo.getDescription());
            existing.setStatus(updateTodo.getStatus());
            return existing;
        });
    }

    //delete todo list by id
    public boolean deleteById(Long id){
        return todoMap.remove(id) !=null; //delete todo if todo-id exists or else returns null if not found
    }
}
