package com.example.user_management_system.controller;

import com.example.user_management_system.service.MessageService;
import jakarta.validation.constraints.NotNull;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/message")
public class MessageController {
    private final MessageService messageService;

    public MessageController(MessageService messageService) {
        this.messageService=messageService;
    }

    @GetMapping
    public String getMessage(@RequestParam String type){
        return messageService.getMessage(type);
    }
}
