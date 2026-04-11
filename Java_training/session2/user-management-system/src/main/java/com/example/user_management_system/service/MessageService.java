package com.example.user_management_system.service;

import com.example.user_management_system.component.formatter.MessageFormatter;
import com.example.user_management_system.component.formatter.MessageType;
import com.example.user_management_system.exception.InvalidMessageTypeException;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class MessageService {

    private final Map<MessageType, MessageFormatter> formatterMap;

    public MessageService(List<MessageFormatter> formatters) {
        this.formatterMap = formatters.stream()
                .collect(Collectors.toMap(
                        MessageFormatter::getType,
                        formatter -> formatter
                ));
    }

    // return formatted message based on the input type.
    public String getMessage(String type) {

        //validation for checking message is not null
        if(type==null){
            throw new InvalidMessageTypeException("Message type cannot be null.");
        }

        // empty check
        if(type.trim().isEmpty()){
            throw new InvalidMessageTypeException("Message type cannot be empty.");
        }
        //normalize input
        String normalizedType=type.trim().toUpperCase();
        MessageType messageType;
        try {
            messageType = MessageType.valueOf(normalizedType);
        } catch (IllegalArgumentException e) {
            throw new InvalidMessageTypeException("Invalid message type: " + type);
        }

        MessageFormatter formatter = formatterMap.get(messageType);

        if (formatter == null) {
            throw new InvalidMessageTypeException("Formatter not found for type: " + type);
        }
        return formatter.formatMessage();
    }
}