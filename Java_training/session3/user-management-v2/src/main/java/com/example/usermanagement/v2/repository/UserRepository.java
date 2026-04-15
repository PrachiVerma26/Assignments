package com.example.usermanagement.v2.repository;

import com.example.usermanagement.v2.model.User;
import org.springframework.stereotype.Repository;

import java.util.*;
import java.util.concurrent.atomic.AtomicLong;

@Repository
public class UserRepository {

    // In-memory store mapping user ids to user objects
    private final Map<Long,User> userMap=new HashMap<>();

    //Thread-safe unique id generator
    private final AtomicLong idCounter = new AtomicLong(1);

    //save user
    public User save(User user){
        Long id = idCounter.getAndIncrement();
        user.setId(id);
        userMap.put(id, user);
        return user;
    }

    //get all users
    public List<User> findAll(){
        return new ArrayList<>(userMap.values()); //converts map values to list
    }

    //find user by id
    public Optional<User> findById(Long id){
        return Optional.ofNullable(userMap.get(id));
    }

    //delete user
    public boolean deleteById(Long id){
        return userMap.remove(id) !=null; //delete user if user-id exists or else returns null if not found
    }
}
