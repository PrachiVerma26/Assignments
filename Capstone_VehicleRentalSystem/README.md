# Vehicle Rental System

A full-stack web application for managing vehicle rentals, featuring dedicated Admin and Customer dashboards. 
Built with Spring Boot on the backend and JavaScript on the frontend.

---

## Features

### Authentication & Authorization
- Secure signup and login using **JWT authentication**
- **Role-Based Access Control (RBAC)** for Admin and Customer roles

### Vehicle Management
- Add, update, and delete vehicles *(Admin)*
- Manage vehicle inventory efficiently
- Support for multiple rental locations

### Booking System
- Browse available vehicles
- Book vehicles with date selection
- View and manage booking history

### Dashboards
- **Admin Dashboard** — Manage vehicles, bookings, and users
- **Customer Dashboard** — Track bookings and rental activity

---

## Tech Stack

### Backend
| Technology | Details |
|---|---|
| Framework | Spring Boot 4.0.5 |
| Language | Java 17 |
| Database | PostgreSQL |
| Security | Spring Security + JWT |
| ORM | Spring Data JPA |
| Build Tool | Maven |
| Testing | JUnit 5, Mockito, JaCoCo |

### Frontend
- HTML5, CSS3, JavaScript

---

## Project Structure

```
Capstone_VehicleRentalSystem/
├── backend/
│   └── vehicle-rental-system/
│       ├── src/
│       │   ├── main/java/com/training/vehiclerentalsystem/
│       │   │   ├── config/
│       │   │   ├── controller/
│       │   │   ├── service/
│       │   │   ├── repository/
│       │   │   ├── model/
│       │   │   ├── dto/
│       │   │   ├── security/
│       │   │   ├── exceptions/
│       │   │   ├── mapper/
│       │   │   ├── enums/
│       │   │   └── constants/
│       │   └── test/
│       └── pom.xml
└── frontend/
    ├── index.html
    ├── login.html
    ├── signup.html
    ├── vehicles.html
    ├── admin-dashboard.html
    ├── customer-dashboard.html
    ├── css/
    ├── js/
    └── assets/
```

---

## Prerequisites

- Java 17+
- Maven 3.6+
- PostgreSQL 12+

---

## Installation & Setup

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend/vehicle-rental-system
   ```

2. **Create the database:**
   ```sql
   CREATE DATABASE vehicle_rental_db;
   ```

3. **Configure your database credentials** in `src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:postgresql://localhost:5432/vehicle_rental_db
   spring.datasource.username=<enter_the_username>
   spring.datasource.password=<enter _the_password>
   ```

4. **Build the project:**
   ```bash
   mvn clean install
   ```

5. **Run the application:**
   ```bash
   mvn spring-boot:run
   ```

> Backend runs at: `http://localhost:8080`

---

### Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Serve using a local development server** 

> Frontend runs at: `http://localhost:5500`

---

##  API Endpoints

### Authentication APIs

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `POST` | `/api/auth/login` | Public | User login |
| `POST` | `/api/auth/signup` | Public | User registration |

---

### Vehicle APIs

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `GET` | `/api/vehicles` | Public | Public vehicle catalog |
| `GET` | `/api/vehicles/{id}` | Public | Vehicle detail |
| `GET` | `/api/vehicles/filter` | Public | Public catalog filter |
| `GET` | `/api/vehicles/admin/all` | Admin UI | Full inventory view |
| `GET` | `/api/vehicles/admin/filter` | Admin UI | Full inventory filter, including retired vehicles |
| `POST` | `/api/vehicles` | Admin | Add vehicle |
| `PUT` | `/api/vehicles/{id}` | Admin | Update vehicle |
| `DELETE` | `/api/vehicles/{id}` | Admin | Delete vehicle |

---

### Booking APIs

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `POST` | `/api/bookings` | Authenticated | Create booking |
| `GET` | `/api/bookings/my-bookings` | Authenticated | User booking history |
| `GET` | `/api/bookings/{id}` | Authenticated | Get specific booking details |
| `PATCH` | `/api/bookings/{id}/cancel` | Authenticated | Cancel a booking |

---

### Customer APIs

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `GET` | `/api/customer/profile` | Authenticated | Get user profile |
| `PUT` | `/api/customer/profile` | Authenticated | Update user profile |

---

### Admin APIs

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| `GET` | `/api/admin/bookings` | Admin | Get all bookings |

 **Auth Header:** Protected endpoints require `Authorization: Bearer {token}`

---

## Snapshots

### Home page:-
 <img width="1884" height="871" alt="image" src="https://github.com/user-attachments/assets/e4afb28f-3622-4ba5-8582-c2adef6ec5df" />

---
### Vehicle page: 
<img width="1897" height="862" alt="image" src="https://github.com/user-attachments/assets/92e942b5-9d21-4818-8814-f133c9a9c739" />

---
### Login page:
<img width="1899" height="856" alt="image" src="https://github.com/user-attachments/assets/721634b8-168e-4ccc-88ed-9744ac122f95" />

---
### Signup page:
<img width="1874" height="865" alt="image" src="https://github.com/user-attachments/assets/3dc0a801-6a3c-4212-a112-ba8f6fe922e6" />

---
### Admin dashboard page: 
<img width="1919" height="876" alt="image" src="https://github.com/user-attachments/assets/0c86d508-7bd3-4f43-a3d3-b40223e59761" />

---
### Customer dashboard page:
<img width="1898" height="860" alt="image" src="https://github.com/user-attachments/assets/b0f21d29-35b6-46b3-8d30-3875a6b29c37" />

---

---

## Database Schema

Main entities: **User**, **Vehicle**, **Booking**, **Location**

> Refer to `ER Diagram.md` for the full schema details.

---

## Testing

Run all tests:
```bash
mvn clean test
```

Test coverage is measured using **JaCoCo**.

<img width="1573" height="392" alt="image" src="https://github.com/user-attachments/assets/c411b187-6b26-4725-9c7d-ff242a3b40b3" />


---

## Security Features

- JWT-based authentication
- Password encryption
- Role-based authorization
- CORS configuration
- Input validation

---

## Usage

1. **Sign up** for a new account
2. **Log in** with your credentials
3. **Browse** available vehicles
4. **Book** a vehicle for your desired dates
5. **Admins** can manage vehicles, bookings, and users via the Admin Dashboard

---

## Developed By

**Prachi Verma**