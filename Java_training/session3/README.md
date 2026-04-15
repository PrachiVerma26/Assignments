# User Management System
### Implemented REST-based functionality

A lightweight RESTful API for managing users, built to demonstrate clean layered architecture, DTO patterns, and global exception handling — all backed by in-memory storage.

---

## Tech Stack

| Layer | Technology |
|-------|------------|
| Language | Java 17 |
| Framework | Spring Boot |
| Build Tool | Maven |
| Utilities | Lombok |
| Storage | In-Memory (HashMap) |

---

## Project Structure

```
src/
├── controller/       # Handles incoming HTTP requests
├── service/          # Business logic layer
├── repository/       # In-memory data management
├── dto/              # Request & Response objects
├── entity/           # User model
└── exception/        # Global exception handling
```

---

## Features

- **Create User** — with input validation
- **Search Users** — dynamic filtering by name, role, or age
- **Delete User** — with explicit confirmation check
- **Global Exception Handling** — consistent error responses
- **Clean Layered Architecture** — separation of concerns throughout

---

## API Reference

### Create User
```
POST /submit
```
Accepts a JSON body and validates all fields before persisting.

**Request Body**
```json
{
  "name": "aman",
  "age": 21,
  "role": "student"
}
```

**Responses**

| Status | Meaning |
|--------|---------|
| `201 Created` | User created successfully |
| `400 Bad Request` | Invalid or missing input |

---

### Search Users
```
GET /users/search
```
All query parameters are optional and can be combined freely.

| Parameter | Type | Match |
|-----------|------|-------|
| `name` | String | Case-insensitive |
| `role` | String | Case-insensitive |
| `age` | Integer | Exact |

**Example**
```
GET /users/search?name=prachi&role=student&age=21
```

---

### Delete User
```
DELETE /users/{id}?confirm=true
```
Requires explicit confirmation to proceed with deletion.

| `confirm` value | Outcome |
|-----------------|---------|
| `true` | User deleted |
| `false` or missing | Request rejected |

**Responses**

| Status | Meaning |
|--------|---------|
| `200 OK` | User deleted successfully |
| `400 Bad Request` | Confirmation missing or user not found |

---

## Validation Rules

| Field | Rule |
|-------|------|
| `name` | Must not be null or empty |
| `role` | Must not be null or empty |
| `age` | Must not be null |

---

## Key Concepts

- Layered Architecture
- Constructor Injection
- DTO Pattern
- Stream API for dynamic filtering
- Global Exception Handling

---

## Getting Started

**1. Clone the repository**
```bash
git clone https://github.com/PrachiVerma26/Assignments.git
```

**2. Navigate to the project folder**
```bash
cd Java_training/session-3/user-management-v2
```

**3. Run the application**
```bash
mvn spring-boot:run
```

**4. Access the API**
```
http://localhost:8080
```

---

## Author
**Prachi Verma**