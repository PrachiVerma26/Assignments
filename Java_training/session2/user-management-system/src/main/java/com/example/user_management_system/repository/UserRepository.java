package com.example.user_management_system.repository;

import java.util.HashMap;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.Optional;
import java.util.concurrent.atomic.AtomicLong;

import org.springframework.stereotype.Repository;
import com.example.user_management_system.entity.User;

@Repository  // marks this class as a repository layer component responsible for data access operations
public class UserRepository  {

    //in-memory storage using hash-map
    private final Map<Long, User> userMap = new HashMap<>();
    
    //counter to generate unique IDs for users
    private final AtomicLong idCounter = new AtomicLong(1);

    //save user and generate ID
    public User save(User user) {
        user.setId(idCounter.getAndIncrement());
        userMap.put(user.getId(), user);
        return user;
    }

    // returns all users as a list
    public List<User> findAll() {
        return new ArrayList<>(userMap.values());
    }

    // searches a user by the Id provided, returns Optional if not found
    public Optional<User> findById(Long id) {
        return Optional.ofNullable(userMap.get(id));
    }

    // searched for a user by email, return empty Optional if not found
    public Optional<User> findByEmail(String email) {
        return userMap.values().stream()
                .filter(u -> u.getEmail().equalsIgnoreCase(email))
                .findFirst();
    }

    //returns true if a user with the given email already exists
    public boolean existsByEmail(String email) {
        return findByEmail(email).isPresent();
    }

}
