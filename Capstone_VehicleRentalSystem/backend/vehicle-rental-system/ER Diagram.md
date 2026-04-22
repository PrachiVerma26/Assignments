# Vehicle Rental System — ER Diagram

## Overview

This document describes the database entity-relationship model for the 
**Vehicle Rental System**, built using Spring Boot and JPA/Hibernate.
The system manages users, vehicles, locations, and bookings across a relational schema.

---

## Entity Relationship Diagram

```
erDiagram

    USER {
        UUID user_id PK
        VARCHAR full_name
        VARCHAR phone_number UK
        VARCHAR address
        VARCHAR email UK
        VARCHAR password
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    USER_ROLES {
        UUID user_id FK
        VARCHAR role
    }

    LOCATION {
        UUID id PK
        VARCHAR address
        VARCHAR state
        VARCHAR city
        VARCHAR pincode
    }

    VEHICLE {
        UUID id PK
        INT version
        VARCHAR model
        VARCHAR brand
        VARCHAR type
        VARCHAR status
        DECIMAL daily_rental_rate
        VARCHAR profile_url
        UUID location_id FK
        TIMESTAMP created_at
        TIMESTAMP updated_at
    }

    BOOKING {
        UUID id PK
        BIGINT version
        UUID user_id FK
        UUID vehicle_id FK
        DATE start_date
        DATE end_date
        DECIMAL price
        VARCHAR status
        DATE created_at
        DATE updated_at
    }

    USER ||--o{ USER_ROLES : "has"
    USER ||--o{ BOOKING : "makes"
    VEHICLE ||--o{ BOOKING : "included in"
    LOCATION ||--o{ VEHICLE : "hosts"
```

---

## Entities & Descriptions

### User
Represents both **customers** and **admins** in the system.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `user_id` | UUID | PK | Auto-generated unique identifier |
| `full_name` | VARCHAR(50) | NOT NULL | User's display name (2–50 chars) |
| `phone_number` | VARCHAR(10) | UNIQUE, NOT NULL | 10-digit phone number |
| `address` | VARCHAR | NOT NULL | Residential address |
| `email` | VARCHAR | UNIQUE, NOT NULL | Used for authentication |
| `password` | VARCHAR | NOT NULL, min 6 | Hashed password |
| `created_at` | TIMESTAMP | NOT NULL, immutable | Set on record creation |
| `updated_at` | TIMESTAMP | NOT NULL | Updated on every change |

> Roles are stored in a separate `user_roles` collection table (via `@ElementCollection`).

---

### User Roles (`user_roles` table)
A join table created by JPA to store the `Set<RoleType>` collection.

| Column | Type | Description |
|---|---|---|
| `user_id` | UUID (FK) | References `users.user_id` |
| `role` | VARCHAR | Enum value: `ADMIN` or `CUSTOMER` |

---

### Location
Represents a physical pickup/drop-off point for vehicles.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | Auto-generated unique identifier |
| `address` | VARCHAR(200) | NOT NULL | Street address |
| `state` | VARCHAR(50) | NOT NULL | State name |
| `city` | VARCHAR(50) | NOT NULL | City name |
| `pincode` | VARCHAR(6) | NOT NULL | Exactly 6 digits; stored as string to preserve leading zeros |

> **Unique constraint** on `(address, city, pincode)` to prevent duplicate location entries.

---

###  Vehicle
Represents a vehicle available for rental.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | Auto-generated unique identifier |
| `version` | INT | NOT NULL | Optimistic locking version field |
| `model` | VARCHAR | NOT NULL | Vehicle model name |
| `brand` | VARCHAR | NOT NULL | Vehicle manufacturer |
| `type` | VARCHAR | NOT NULL | Enum: `VehicleType` (e.g. CAR, BIKE) |
| `status` | VARCHAR | NOT NULL | Enum: `VehicleStatus`; default `AVAILABLE` |
| `daily_rental_rate` | DECIMAL | NOT NULL | Price per day |
| `profile_url` | VARCHAR | — | URL to vehicle image |
| `location_id` | UUID (FK) | NOT NULL | References `locations.id` |
| `created_at` | TIMESTAMP | Immutable | Set by `@CreationTimestamp` |
| `updated_at` | TIMESTAMP | — | Updated by `@UpdateTimestamp` |

> Indexed on `location_id` for fast location-based vehicle lookups.

---

### Booking
Represents a vehicle rental booking made by a user.

| Column | Type | Constraints | Description |
|---|---|---|---|
| `id` | UUID | PK | Auto-generated unique identifier |
| `version` | BIGINT | NOT NULL | Optimistic locking version field |
| `user_id` | UUID (FK) | NOT NULL | References `users.user_id` |
| `vehicle_id` | UUID (FK) | NOT NULL | References `vehicles.id` |
| `start_date` | DATE | NOT NULL | Rental start date |
| `end_date` | DATE | NOT NULL | Rental end date (must be ≥ start date) |
| `price` | DECIMAL | NOT NULL | Total rental cost |
| `status` | VARCHAR | NOT NULL | Enum: `BookingStatus`; default `PENDING` |
| `created_at` | DATE | NOT NULL, immutable | Booking creation date |
| `updated_at` | DATE | NOT NULL | Last update date |

> Indexed on both `user_id` and `vehicle_id` for fast query performance.

---

## Relationships Summary

| Relationship | Type | Description |
|---|---|---|
| `User` → `Booking` | One-to-Many | A user can make multiple bookings; each booking belongs to one user |
| `Vehicle` → `Booking` | One-to-Many | A vehicle can appear in multiple bookings; each booking references one vehicle |
| `Location` → `Vehicle` | One-to-Many | A location can host many vehicles; each vehicle belongs to one location |
| `User` → `UserRoles` | One-to-Many | A user can hold multiple roles (stored via `@ElementCollection`) |

---

## Concurrency & Data Integrity Notes

- **Optimistic Locking**: Both `Booking` and `Vehicle` use `@Version` to safely handle concurrent updates without pessimistic database locks.
- **Cascade**: `User → Booking` uses `CascadeType.ALL`, so deleting a user will also remove their bookings.
- **Lazy Loading**: `Vehicle.location` and `Booking.user/vehicle` use `FetchType.LAZY` to avoid unnecessary joins on every query.
- **Audit Fields**: `User` uses `@PrePersist` / `@PreUpdate` hooks; `Vehicle` uses Hibernate's `@CreationTimestamp` / `@UpdateTimestamp`.

---

## Enum Types Reference

| Enum | Values |
|---|---|
| `RoleType` | `ADMIN`, `CUSTOMER` |
| `VehicleType` | e.g. `CAR`, `BIKE`, `TRUCK` *(define in enum class)* |
| `VehicleStatus` | e.g. `AVAILABLE`, `BOOKED`, `MAINTENANCE` *(define in enum class)* |
| `BookingStatus` | e.g. `PENDING`, `CONFIRMED`, `CANCELLED`, `COMPLETED` *(define in enum class)* |