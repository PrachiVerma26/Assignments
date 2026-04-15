package com.example.user_management_system.controller;

import com.example.user_management_system.service.NotificationService;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/notifications")
public class NotificationController {

    private final NotificationService notificationService;

    //constructor injection
    NotificationController(NotificationService notificationService){
        this.notificationService=notificationService;
    }

    //endpoint to trigger notification
    @PostMapping("/trigger")
    public String triggerNotification() {
        return notificationService.triggerNotification();
    }
}