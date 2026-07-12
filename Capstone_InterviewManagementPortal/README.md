# Interview Management Portal

A full-stack Interview Management Portal built using React, FastAPI, and MongoDB to streamline the recruitment process. The application provides secure role-based access for Administrators, HR users, and Interviewers to manage users, job openings, candidates, interviews, and feedback through an intuitive dashboard.

---

## Features

### Authentication
- Basic Authentication
- Secure Login
- Reset Password
- Role-Based Access Control (RBAC)
- Protected Routes
- Session Management

---

## Admin Module

- Admin Dashboard
- User Management
- Create Users
- Update Users
- Enable/Disable Users
- Assign Roles (Admin, HR, Interviewer)
- Search Users
- Pagination
- User Status Management

---

## HR Module

### Dashboard

- Total Jobs
- Total Candidates
- Scheduled Interviews
- Selected Candidates
- Rejected Candidates

### Job Management

- Create Job
- Update Job
- View Job Details
- Search Jobs
- Pagination
- Form Validation

### Candidate Management

- Add Candidate
- Update Candidate
- Upload Resume (PDF)
- Candidate Search
- Candidate Status Tracking
- Candidate Status History
- Pagination
- Mobile Number & Email Validation

### Interview Management

- Schedule Interviews
- Assign Interviewers
- Update Interview Details
- View Interview Schedule
- Interview Status Tracking

---

## Interviewer Module

### Dashboard

- Assigned Interviews
- Pending Feedback
- Submitted Feedback

### Interview Management

- View Assigned Interviews Only
- Submit Interview Feedback
- View Submitted Feedback
- Recommendation:
  - Select
  - Hold
  - Reject

---

## Feedback Module

- Technical Rating (1-5)
- Communication Rating (1-5)
- Comments
- Recommendation
- Feedback View Screen
- Prevent Duplicate Feedback Submission

---

## Technology Stack

* Frontend: React
* Backend: FastAPI(Python)
* DataBase: MongoDB
* Testing: Pytest

---

## Project Structure

```text
InterviewManagementPortal/
│
├── backend/
│   ├── src/
│   │   ├── core/
│   │   ├── routers/
│   │   ├── services/
│   │   ├── repositories/
│   │   ├── models/
│   │   ├── schemas/
│   │   ├── enums/
│   │   ├── exceptions/
│   │   ├── middleware/
│   │   ├── utils/
│   │   └── uploads/
│   ├──postman
│   ├── tests/
│   ├── .env
│   ├── requirements.txt
│   └── main.py
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   ├── context/
│   │   ├── routes/
│   │   ├── layouts/
│   │   ├── utils/
│   │   ├── constants/
│   │   └── styles/
│   │
│   ├── package.json
│   └── vite.config.js
│
├── .gitignore
├── LICENSE
└── README.md
```
---

## User Roles

| Role | Permissions |
|-------|-------------|
| Admin | Manage users, roles, dashboard |
| HR | Manage jobs, candidates, interviews |
| Interviewer | View assigned interviews and submit feedback |

---

## Getting Started

### Clone Repository

```bash
git clone https://github.com/PrachiVerma26/Assignments.git

cd Capstone_InterviewManagementPortal
```
---

### Backend Setup

```bash
cd backend

python -m venv .venv

source .venv/bin/activate
# Windows
.venv\Scripts\activate

pip install -r requirements.txt

uvicorn main:app --reload
```

Backend runs at:

```
http://127.0.0.1:8000
```

Swagger Documentation:

```
http://127.0.0.1:8000/docs
```

---

### Frontend Setup

```bash
cd frontend

npm install

npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

## Testing

Run backend tests:

```bash
pytest
```

---

## Author

**Prachi Verma**