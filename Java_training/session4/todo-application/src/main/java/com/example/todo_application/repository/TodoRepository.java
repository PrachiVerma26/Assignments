package com.example.todo_application.repository;

import com.example.todo_application.model.Todo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;


@Repository // Repository for Todo entity providing CRUD operations via Spring Data JPA
public interface TodoRepository extends JpaRepository<Todo, Long> {
}
