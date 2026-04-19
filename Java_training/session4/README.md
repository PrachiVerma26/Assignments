# Todo Application

A RESTful API for managing todo tasks built with Spring Boot. This application provides complete CRUD operations with status transition validation.

## Features

- Create, Read, Update, and Delete todo items
- Status transition validation (PENDING ↔ COMPLETED only)
- Custom exception handling with meaningful error messages
- DTO pattern for request/response mapping
- JPA/Hibernate for database operations
- RESTful API design principles
- Structured logging using SLF4J
- Unit testing with JUnit & Mockito
- Controller testing with MockMvc
- Simulated external service integration (NotificationServiceClient)

## Technologies Used

- **Java 17+**
- **Spring Boot 3.x**
- **Spring Data JPA**
- **PostgresSQL**
- **Maven**
- **Jakarta Validation**
- **JUnit 5 & Mockito**
- **SLF4J (Logging)**

## Project Structure

```
todo-application/
├── src/main/java/com/example/todo_application/
│   ├── controller/
│   │   └── TodoController.java
│   ├── service/
│   │   └── TodoService.java
│   ├── repository/
│   │   └── TodoRepository.java
│   ├── model/
│   │   └── Todo.java
│   ├── dto/
│   │   ├── TodoRequestDTO.java
│   │   └── TodoResponseDTO.java
│   ├── enums/
│   │   └── Status.java
│   └── exception/
│       ├── TodoNotFoundException.java
│       ├── InvalidStatusTransitionException.java
│       └── GlobalExceptionalHandler.java
├── src/test/java/com/example/todo_application/
│   ├── service/
│   │   └── TodoServiceTest.java
│   └── controller/
│       └── TodoControllerTest.java
└── src/main/resources/
    └── application.properties
```

## API Endpoints

### Base URL: `http://localhost:8080`

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| `POST` | `/todos` | Create a new todo | TodoRequestDTO | `201 Created` |
| `GET` | `/todos` | Get all todos | - | `200 OK` |
| `GET` | `/todos/{id}` | Get todo by ID | - | `200 OK` |
| `PUT` | `/todos/{id}` | Update todo by ID | TodoRequestDTO | `200 OK` |
| `DELETE` | `/todos/{id}` | Delete todo by ID | - | `204 No Content` |

## Setup and Installation

### Prerequisites
-  Java 17 or higher
-  Maven 3.6+
-  IDE (IntelliJ IDEA, Eclipse, or VS Code)

### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/PrachiVerma26/Assignments.git
   cd Java_training/session4/todo-application
   ```

2. **Setup PostgreSQL Database**

   Create a database for the application:
   ```sql
   CREATE DATABASE todo;
   ```

3. **Configure Database Connection**

   Edit `src/main/resources/application.properties`:
   ```properties
   # PostgreSQL Database Configuration
   spring.datasource.url=jdbc:postgresql://localhost:5432/tododb
   spring.datasource.username=postgres
   spring.datasource.password=your_password
   spring.datasource.driver-class-name=org.postgresql.Driver
   
   # JPA Configuration
   spring.jpa.hibernate.ddl-auto=update
   spring.jpa.show-sql=true
   spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

   # Logging Configuration
    logging.level.root=INFO
    logging.level.com.example.todo_application=DEBUG
   ```
3. **Build the project**
   ```bash
   mvn clean install
   ```

4. **Run the application**
   ```bash
   mvn spring-boot:run
   ```

5. **Access the API**

   The application will start on: `http://localhost:8080`

6. **Testing**

   mvn test
---

## Testing Tools Used
- JUnit 5 → Unit testing
- Mockito → Mocking dependencies
- MockMvc → Controller testing
  
### Test Coverage
* Service Layer:Create Todo, Get All Todos, Get Todo by ID, Update Todo (including validation) and Delete Todo
* Controller Layer: API endpoint testing, HTTP status validation and JSON response validation

## Testing with Postman

### Quick Test Sequence

1. **Create a Todo**
   ```
   POST http://localhost:8080/todos
   Body: {"title": "Todo task", "description": "First task", "status": "PENDING"}
   ```

2. **Get All Todos**
   ```
   GET http://localhost:8080/todos
   ```

3. **Update Status (Valid Transition)**
   ```
   PUT http://localhost:8080/todos/1
   Body: {"title": "1. Task ", "description": "Task completed successfully. ", "status": "COMPLETED"}
   ```

4. **Try Invalid Transition**
   ```
   PUT http://localhost:8080/todos/1
   Body: {"title": "1. Task", "description": "Task completed successfully", "status": "Completed"}
   Expected: 400 Bad Request
   ```

5. **Delete Todo**
   ```
   DELETE http://localhost:8080/todos/1
   ```

---

## Logging: Uses SLF4J for structured logging
Logs added in:
* Controller layer (request/response)
* Service layer (business logic)
* Exception handling

## Simulated External Service
* NotificationServiceClient simulates external system interaction
* Triggered on Todo creation
* Demonstrates microservice-ready architecture
  
## Dependencies

* Spring Boot Starter Web - For building RESTful APIs
* Spring Boot Starter Data JPA - For database operations
* PostgreSQL Driver - For PostgreSQL database connectivity
* Spring Boot Starter Validation - For request validation
* Spring Boot Starter Test
---

## Author

**Prachi Verma**
