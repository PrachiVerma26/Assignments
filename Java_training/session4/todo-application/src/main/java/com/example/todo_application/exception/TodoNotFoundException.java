package com.example.todo_application.exception;

//custom exception for handling Todo not found
public class TodoNotFoundException  extends RuntimeException{
   public TodoNotFoundException(String message){
       super(message);
    }
}

