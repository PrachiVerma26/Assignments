package com.example.user_management_system.service;

import com.example.user_management_system.component.NotificationComponent;
import org.springframework.stereotype.Service;

@Service
public class NotificationService {

    private final NotificationComponent notificationComponent;

    public NotificationService(NotificationComponent notificationComponent){
        this.notificationComponent=notificationComponent;
    }

    public String triggerNotification() {
        return notificationComponent.generateNotification();
    }
}
