package com.example.todo_application.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service // marks this class as a service layer component containing business logic
public class NotificationServiceClient {

    // Logger instance specific to this class
    private static final Logger log = LoggerFactory.getLogger(NotificationServiceClient.class);

    //Simulates sending a notification for a newly created TODO.
    //@param todoTitle title of the TODO
    public void sendNotification(String todoTitle) {
        log.info("Notification sent for new TODO: {}", todoTitle);
    }
}
