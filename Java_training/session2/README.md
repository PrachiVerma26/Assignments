# User Management System — Spring Boot

A Spring Boot REST API project demonstrating core Spring concepts including IoC, Dependency Injection,
Layered Architecture, Validation, and Exception Handling using an in-memory data store.

---

## Tech Stack
* Java - 17 
* Framework - Spring Boot(version - 3.2.5)
* Build Tool - Maven
* Data Storage - In-memory(HashMap)

---

## Project Structure

```
src/main/java/com/example/user_management_system/
│
├── UserManagementSystemApplication.java     
│
├── entity/
│   └── User.java                            
│
├── dto/
│   ├── UserRequestDTO.java                  
│   └── UserResponseDTO.java                 
│
├── exception/
│   ├── UserNotFoundException.java           
│   ├── UserAlreadyExistsException.java      
│   ├── InvalidMessageTypeException.java     
│   └── GlobalExceptionHandler.java         
│
├── repository/
│   └── UserRepository.java                 
│
├── component/
│   ├── UserValidator.java                  
│   ├── NotificationComponent.java  
│   ├── formatter/
│       ├── MessageType.java
│       ├── MessageFormatter.java                
│       ├── ShortMessageFormatter.java           
│       └── LongMessageFormatter.java            
│
├── service/
│   ├── UserService.java                     
│   ├── NotificationService.java             
│   └── MessageService.java                  
│
└── controller/
    ├── UserController.java                  
    ├── NotificationController.java          
    └── MessageController.java               

src/main/resources/
├── application.properties                  

```

---
## Spring Core Concepts Used
- IOC(Inversion of Control)
- Constructor-Based Dependency Injection
- Component Scanning
- Stereotype Annotations: @Repository, @Service, @Entity, @Component and @RestController etc. 
- Spring Data JPA 
- DTO Pattern
- Centralised Exceptional Handling

## How to Run

### Prerequisites
- Java 17
- Maven

### Steps

```bash
# Clone the repository
git clone https://github.com/PrachiVerma/Assignments/java_training.git

# Navigate to project folder
cd java_training/session2/user-management-system

# Run the application
mvn spring-boot:run
```

App starts at: `http://localhost:8080`

```
---

## API Reference

### 1. User Management System

* GET `http://localhost:8080/users` — Fetch all users
* GET `http://localhost:8080/users/{id}` — Fetch user by ID
* POST `http://localhost:8080/users` — Create new user

### 2. Notification System

* POST `http://localhost:8080/notifications/trigger`- Trigger notification

### 3. Dynamic Message Formatter System

* GET ` http://localhost:8080/message?type=SHORT` - returns a concise message
* GET ` http://localhost:8080/message?type=LONG`  - returns a detailed message

## Validation 
* Format Validation - UserValidation
* Business Validation - UserService(After format check passm the service check whether the email is already restered in the database using `userRepostiory.existsByEmail()').

## Exceptional Handling
* GlobalExceptionHandler - handles all exceptions centrally.
* InvalidMessageTpeException - handles all the Invalid message types.
* UserAlreadyExistedException - If the user tries to register an already existed in the database.
* UserNotFoundException - When user Id is not found in the database.

## Layered Architecture

```
Controller: accepts HTTP request, delegates to service, returns ResponseEntity
Service:  all business logic, validation decisions, orchestration
Component: reusable helpers (validation, message generation, formatting)
Repository: data access only via JpaRepository
```

## Author

**Prachi Verma**
