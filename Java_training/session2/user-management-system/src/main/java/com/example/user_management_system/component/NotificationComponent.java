package com.example.user_management_system.component;
import org.springframework.stereotype.Component;

@Component //used to mark a class as a Spring-managed bean so that it can be automatically detected and injected where needed.
public class NotificationComponent {
    public String generateNotification() {
        return "Application is working successfully";
    }
}