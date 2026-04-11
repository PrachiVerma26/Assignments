package com.example.user_management_system.component.formatter;
import org.springframework.stereotype.Component;

//implementation for short messages
@Component
public class ShortMessageFormatter implements MessageFormatter {

    @Override
    public String formatMessage() {
        System.out.println("Short formatter used");
        return "Short message";
    }

    @Override
    public MessageType getType() {
        return MessageType.SHORT;
    }
}
