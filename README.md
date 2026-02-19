<p align="center">
  <img src="https://img.shields.io/badge/node-%3E%3D18.0.0-339933?style=for-the-badge&logo=node.js&logoColor=white" />
  <img src="https://img.shields.io/badge/license-ISC-blue?style=for-the-badge" />
  <img src="https://img.shields.io/badge/version-1.0.0-brightgreen?style=for-the-badge" />
  <img src="https://img.shields.io/badge/build-passing-success?style=for-the-badge" />
  <img src="https://img.shields.io/badge/PRs-welcome-ff69b4?style=for-the-badge" />
</p>

<h1 align="center">SAMS — Student Attendance Management System</h1>

<p align="center">
  <strong>A full-stack web application for centralized student attendance tracking, reporting, and certificate generation.</strong>
</p>

---

## Executive Summary

**SAMS** is a production-ready, full-stack attendance management platform designed for educational institutions. It enables teachers to register students, record daily attendance in bulk, generate per-student and class-wide analytics, and produce downloadable PDF attendance certificates — all behind a secure JWT-authenticated portal.

The system eliminates paper-based attendance workflows by providing a single, centralized dashboard that handles the entire lifecycle: student enrollment → daily attendance marking → statistical reporting → certificate issuance.

---

## Problem Statement

Manual attendance tracking in schools and colleges is error-prone, time-consuming, and difficult to audit. Spreadsheet-based solutions lack access control, real-time reporting, and standardized certificate generation. SAMS solves this by delivering a purpose-built digital platform that is fast, secure, and accessible from any browser.

---

## Core Features

| Feature | Description |
|---|---|
| **Teacher Authentication** | Secure signup (with institutional secret key) and login via JWT tokens |
| **Student Registry** | Full CRUD management of student records with class/section categorization |
| **Bulk Attendance** | Mark attendance (Present, Absent, Late, On Leave) for an entire class in a single operation |
| **Filterable Views** | Filter students and attendance by class, section, and search keywords |
| **Attendance Reports** | Per-student breakdown and overall class/section analytics with percentage calculations |
| **Certificate Generator** | Generate and download official PDF attendance certificates with live preview |
| **Auto-Refresh Dashboard** | Live data refresh every 5 seconds for multi-user environments |
| **Session Persistence** | Authentication state survives browser refresh via `localStorage` |

---

## Target Users

- **Teachers** — Primary operators who manage students and mark daily attendance
- **School Administrators** — Oversight through reports and certificate generation
- **IT Staff** — Deployment and environment configuration

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 19 | Component-based UI framework |
| | Vite 7 | Lightning-fast build tooling and HMR |
| | React Router DOM 7 | Client-side routing with protected routes |
| | Axios | HTTP client with JWT interceptor |
| | html2pdf.js | Client-side PDF certificate generation |
| **Backend** | Express 5 | RESTful API server |
| | Mongoose 9 | MongoDB ODM with schema validation |
| | bcryptjs | Password hashing (salted, 10 rounds) |
| | jsonwebtoken | JWT token generation and verification |
| | cors | Cross-origin resource sharing |
| | dotenv | Environment variable management |
| **Database** | MongoDB Atlas | Cloud-hosted NoSQL document database |
| **Dev Tools** | ESLint | Code quality and linting |
| | Node `--watch` | Auto-restart backend on file changes |

---

## System Architecture

### How Frontend Communicates with Backend

The React frontend communicates with the Express backend exclusively through RESTful HTTP calls via an Axios instance configured in `api/api.js`. Every outbound request passes through an Axios request interceptor that reads the JWT token from `localStorage` and attaches it as a `Bearer` token in the `Authorization` header. The backend never serves the frontend — they run as independent processes on separate ports.

### Authentication Flow

1. **Signup** — Teacher provides a name, password, and a pre-shared `TEACHER_SECRET_ID`. The backend validates the secret, hashes the password with bcrypt (10 salt rounds), stores the teacher record, and returns a signed JWT (24-hour expiry).
2. **Login** — Teacher provides credentials. The backend looks up the teacher by name, compares the hashed password with bcrypt, and returns a signed JWT on success.
3. **Session Persistence** — The frontend stores `{ teacher, token }` in `localStorage` under the key `sams_auth`. On page load, `AuthContext` restores the session.
4. **Route Protection** — React Router wraps the dashboard in a `ProtectedRoute` component that redirects unauthenticated users to `/login`. Public routes redirect authenticated users to `/`.

### Request Lifecycle

Every authenticated API request follows this path:

```
Client → Axios Interceptor (attach JWT) → Express Router → authMiddleware (verify JWT, attach teacher to req) → Controller (business logic) → Mongoose Model (DB operation) → MongoDB → JSON Response → Axios → React State → UI Re-render
```

### Middleware Layer

| Middleware | Role |
|---|---|
| `authMiddleware` | Extracts and verifies JWT from `Authorization` header, attaches teacher object to `req.teacher`, rejects with 401 on failure |
| `errorMiddleware` | Centralized error handler that normalizes `CastError` (404), duplicate key errors (400), and defaults unknown errors to 500 |

### Error Handling Strategy

- **Backend** — All controllers delegate errors to Express `next()`. The centralized `errorMiddleware` catches them, normalizes status codes, and returns consistent `{ message }` JSON responses.
- **Frontend** — Axios `.catch()` blocks extract `err.response?.data?.message` and display it to the user via `alert()` or inline error text.

---

## Architecture Diagrams

### High-Level Architecture

```mermaid
graph LR
    A["🖥️ React Frontend<br/>(Vite Dev Server — Port 5173)"] -->|"HTTP / Axios<br/>+ JWT Bearer Token"| B["⚙️ Express.js API<br/>(Port 5000)"]
    B -->|"Mongoose ODM"| C["🗄️ MongoDB Atlas<br/>(Cloud Database)"]
    B --- D["🔐 JWT Auth<br/>Middleware"]
    B --- E["🚨 Error<br/>Middleware"]

    style A fill:#1a1a2e,stroke:#e0e0e0,color:#fff
    style B fill:#1a1a2e,stroke:#e0e0e0,color:#fff
    style C fill:#1a1a2e,stroke:#e0e0e0,color:#fff
    style D fill:#0d0d1a,stroke:#888,color:#ccc
    style E fill:#0d0d1a,stroke:#888,color:#ccc
```

### Data Flow Diagram

```mermaid
sequenceDiagram
    participant T as Teacher (Browser)
    participant UI as React UI
    participant AX as Axios Client
    participant MW as Auth Middleware
    participant CT as Controller
    participant DB as MongoDB Atlas

    T->>UI: Interact (click, submit)
    UI->>AX: API call (e.g., POST /attendance/bulk)
    AX->>AX: Attach JWT from localStorage
    AX->>MW: HTTP Request + Authorization header
    MW->>MW: Verify JWT, lookup Teacher
    MW->>CT: req.teacher attached, proceed
    CT->>DB: Mongoose query / bulkWrite
    DB-->>CT: Documents / acknowledgment
    CT-->>AX: JSON response
    AX-->>UI: Promise resolved
    UI-->>T: Re-render with updated state
```

### Entity Relationship Diagram

```mermaid
erDiagram
    TEACHER {
        ObjectId _id PK
        String name UK "unique, required"
        String password "bcrypt hashed"
        Date createdAt
        Date updatedAt
    }

    STUDENT {
        ObjectId _id PK
        String name "required"
        String roll UK "unique, required"
        String className "required"
        String section "required"
        String email
        String phone
        Date createdAt
        Date updatedAt
    }

    ATTENDANCE {
        ObjectId _id PK
        ObjectId studentId FK "ref → Student"
        Date date "required"
        String status "enum: P, A, L, LV"
        Date createdAt
        Date updatedAt
    }

    STUDENT ||--o{ ATTENDANCE : "has many"
```

> **Note:** The `ATTENDANCE` collection enforces a compound unique index on `(studentId, date)` to prevent duplicate attendance entries for the same student on the same day.

### API Lifecycle Diagram

```mermaid
graph TD
    A["Incoming Request"] --> B{"Has Authorization<br/>Header?"}
    B -->|No| C["401 — No token provided"]
    B -->|Yes| D["Extract Bearer Token"]
    D --> E{"JWT Valid?"}
    E -->|No| F["401 — Not authorized"]
    E -->|Yes| G["Lookup Teacher by ID"]
    G --> H{"Teacher Exists?"}
    H -->|No| I["401 — User not found"]
    H -->|Yes| J["Attach teacher to req"]
    J --> K["Route to Controller"]
    K --> L{"Operation<br/>Successful?"}
    L -->|Yes| M["200/201 — JSON Response"]
    L -->|No| N["Error Middleware"]
    N --> O{"Error Type?"}
    O -->|CastError| P["404 — Resource not found"]
    O -->|Duplicate Key| Q["400 — Duplicate field"]
    O -->|Other| R["500 — Server Error"]

    style A fill:#1a1a2e,stroke:#e0e0e0,color:#fff
    style M fill:#0a3d0a,stroke:#4caf50,color:#fff
    style C fill:#3d0a0a,stroke:#f44336,color:#fff
    style F fill:#3d0a0a,stroke:#f44336,color:#fff
    style I fill:#3d0a0a,stroke:#f44336,color:#fff
    style P fill:#3d0a0a,stroke:#f44336,color:#fff
    style Q fill:#3d0a0a,stroke:#f44336,color:#fff
    style R fill:#3d0a0a,stroke:#f44336,color:#fff
```

---

## Folder Structure

### Frontend

```
Frontend/
├── index.html                  # SPA entry point, loads React root
├── vite.config.js              # Vite build configuration
├── package.json                # Dependencies and scripts
├── public/                     # Static assets served as-is
└── src/
    ├── main.jsx                # React DOM render entry
    ├── App.jsx                 # Root component with routing (ProtectedRoute, PublicRoute)
    ├── Dashboard.jsx           # Main dashboard — orchestrates all feature panels
    ├── index.css               # Global stylesheet (design system, components, layout)
    ├── api/
    │   └── api.js              # Axios instance, JWT interceptor, all API functions
    ├── context/
    │   └── AuthContext.jsx     # React Context for auth state (login, logout, persistence)
    ├── components/
    │   ├── AppLayout.jsx       # App shell — header, branding, user info, logout
    │   ├── Login.jsx           # Login form with error handling
    │   ├── StudentForm.jsx     # Add / Edit student form (CRUD)
    │   ├── StudentManagement.jsx  # Student list with search, filter, section chips
    │   ├── DailyAttendance.jsx # Bulk attendance marking interface
    │   ├── Reports.jsx         # Per-student and overall attendance analytics
    │   └── CertificateGenerator.jsx  # PDF certificate generation with live preview
    └── assets/
        └── image.png           # Application favicon
```

### Backend

```
Backend/
├── index.js                    # Express app entry — middleware registration, route mounting, server start
├── package.json                # Dependencies and scripts
├── .env                        # Environment variables (not committed in production)
├── SAMS_Postman_Collection.json  # Pre-built Postman collection for API testing
├── config/
│   └── db.js                   # MongoDB connection handler via Mongoose
├── models/
│   ├── Teacher.js              # Teacher schema — name (unique), password (hashed)
│   ├── Student.js              # Student schema — name, roll (unique), className, section, email, phone
│   └── Attendance.js           # Attendance schema — studentId (FK), date, status (enum). Compound unique index
├── controllers/
│   ├── authController.js       # signup (with secret validation + bcrypt) and login (credential verification)
│   ├── studentController.js    # CRUD operations for student records with query filtering
│   ├── attendanceController.js # Bulk attendance upsert via MongoDB bulkWrite
│   └── reportController.js     # Per-student and overall attendance statistics
├── routes/
│   ├── authRoutes.js           # POST /api/auth/signup, POST /api/auth/login
│   ├── studentRoutes.js        # CRUD /api/students (protected)
│   ├── attendanceRoutes.js     # POST /api/attendance/bulk (protected)
│   └── reportRoutes.js         # GET /api/reports/student/:id, GET /api/reports/overall (protected)
├── middleware/
│   ├── authMiddleware.js       # JWT verification, teacher lookup, request enrichment
│   └── errorMiddleware.js      # Centralized error normalization (CastError, duplicates, generic)
└── utils/
    ├── generateToken.js        # JWT signing utility (1-day expiry)
    └── calculateStats.js       # Attendance statistics calculator (present, absent, late, leave, percentages)
```

---

## File-Level Explanation

### Frontend

| File | Purpose |
|---|---|
| `main.jsx` | Mounts the `<App />` component into the DOM root |
| `App.jsx` | Defines routing with `ProtectedRoute` (requires auth) and `PublicRoute` (login redirect) |
| `Dashboard.jsx` | Composes all feature panels, manages edit state, triggers auto-refresh every 5s |
| `index.css` | Complete design system — layout grid, card styles, form elements, certificate layout, responsive breakpoints |
| `api/api.js` | Centralized Axios instance with base URL and JWT interceptor. Exports named API functions for auth, students, attendance, and reports |
| `context/AuthContext.jsx` | React Context providing `login()`, `logout()`, `teacher`, `token`, `isAuthenticated`, and `loading` state. Persists to `localStorage` |
| `AppLayout.jsx` | Application shell with header bar, branding, logged-in teacher display, and logout button |
| `Login.jsx` | Login form with username/password fields, enter-key submission, and error display |
| `StudentForm.jsx` | Dual-purpose form for adding new students or editing existing ones. Auto-populates fields when editing |
| `StudentManagement.jsx` | Student list table with search, class/section dropdown filters, section chips with counts, edit/delete actions |
| `DailyAttendance.jsx` | Date picker, class/section filters, "Mark All Present/Absent" shortcuts, per-student status selectors, save action |
| `Reports.jsx` | Student-level stats, overall summary, and class/section breakdown table. Requires both class and section for detailed view |
| `CertificateGenerator.jsx` | Selects a student, displays a live certificate preview with attendance stats, and exports to PDF via `html2pdf.js` |

### Backend

| File | Purpose |
|---|---|
| `index.js` | Initializes Express, registers `json` parser and `cors`, mounts all route groups under `/api/*`, attaches error middleware, connects to MongoDB, and starts listening |
| `config/db.js` | Connects to MongoDB Atlas using the `MONGO_URI` environment variable. Exits process on failure |
| `models/Teacher.js` | Mongoose schema for teachers. `name` is unique. `password` stores bcrypt hash. Timestamps enabled |
| `models/Student.js` | Mongoose schema for students. `roll` is unique. Fields: `name`, `roll`, `className`, `section`, `email`, `phone`. Timestamps enabled |
| `models/Attendance.js` | Mongoose schema for attendance entries. References `Student` via `studentId`. Status is enum `[P, A, L, LV]`. Compound unique index on `(studentId, date)` prevents duplicates |
| `controllers/authController.js` | `signup` validates the institutional secret, checks for existing teacher, hashes password, creates record, returns JWT. `login` verifies credentials and returns JWT |
| `controllers/studentController.js` | Standard CRUD: `createStudent`, `getStudents` (with optional `className`/`section` query filters), `updateStudent`, `deleteStudent` |
| `controllers/attendanceController.js` | `bulkMarkAttendance` accepts a date and array of `{ studentId, status }` records, normalizes the date to midnight UTC, and executes a `bulkWrite` with upsert semantics |
| `controllers/reportController.js` | `getStudentReport` returns stats for a single student. `getOverallReport` aggregates stats across all students matching optional class/section filters |
| `middleware/authMiddleware.js` | Extracts JWT from `Authorization: Bearer <token>`, verifies with `JWT_SECRET`, looks up teacher by decoded ID, attaches to `req.teacher` |
| `middleware/errorMiddleware.js` | Catches all thrown errors. Maps `CastError` → 404, duplicate key (code 11000) → 400, defaults to 500 |
| `utils/generateToken.js` | Signs a JWT with the teacher's `_id` and `JWT_SECRET`, 1-day expiration |
| `utils/calculateStats.js` | Iterates attendance records, counts P/A/L/LV statuses, calculates unique days and present percentage |

---

## Installation Guide

### Prerequisites

| Requirement | Version |
|---|---|
| Node.js | ≥ 18.0.0 |
| npm | ≥ 9.0.0 |
| MongoDB | Atlas cluster or local instance |
| Git | Latest |

### 1. Clone the Repository

```bash
git clone https://github.com/<your-username>/SAMS.git
cd SAMS
```

### 2. Backend Setup

```bash
cd Backend
npm install
```

Create a `.env` file in the `Backend/` directory:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/<dbName>
JWT_SECRET=your_jwt_secret_key_here
TEACHER_SECRET_ID=your_institutional_secret_here
```

Start the development server:

```bash
npm run dev
```

The API will be available at `http://localhost:5000`.

### 3. Frontend Setup

```bash
cd Frontend
npm install
```

> **Note:** The API base URL is configured in `src/api/api.js`. Update it if your backend runs on a different host/port.

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`.

### 4. Production Build (Optional)

```bash
cd Frontend
npm run build
npm run preview
```

The optimized build output will be in the `Frontend/dist/` directory.

---

## Environment Variables

| Variable | Description | Example |
|---|---|---|
| `PORT` | Port number for the Express server | `5000` |
| `MONGO_URI` | MongoDB connection string (Atlas or local) | `mongodb+srv://user:pass@cluster0.abc.mongodb.net/sams` |
| `JWT_SECRET` | Secret key used to sign and verify JWT tokens | `a_strong_random_string_here` |
| `TEACHER_SECRET_ID` | Institutional secret required during teacher signup to prevent unauthorized registrations | `SCHOOL2026SECRET` |

---

## API Documentation

All endpoints except `/api/auth/*` require a valid JWT token in the `Authorization: Bearer <token>` header.

### Authentication

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/auth/signup` | Register a new teacher (requires `secretId`) | No |
| `POST` | `/api/auth/login` | Authenticate and receive JWT token | No |

### Students

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/students` | List all students (supports `?className=&section=` query filters) | Yes |
| `POST` | `/api/students` | Create a new student record | Yes |
| `PUT` | `/api/students/:id` | Update an existing student by ID | Yes |
| `DELETE` | `/api/students/:id` | Delete a student by ID | Yes |

### Attendance

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/attendance/bulk` | Bulk upsert attendance records for a given date | Yes |

**Request Body:**
```json
{
  "date": "2026-02-19",
  "records": [
    { "studentId": "65a1b2c3d4e5f6g7h8i9j0k1", "status": "P" },
    { "studentId": "65a1b2c3d4e5f6g7h8i9j0k2", "status": "A" }
  ]
}
```

**Status values:** `P` (Present), `A` (Absent), `L` (Late), `LV` (On Leave)

### Reports

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/reports/student/:id` | Get attendance statistics for a specific student | Yes |
| `GET` | `/api/reports/overall` | Get aggregated statistics (supports `?className=&section=` filters) | Yes |

**Response Shape (both endpoints):**
```json
{
  "totalDays": 45,
  "present": 40,
  "absent": 3,
  "late": 1,
  "leave": 1,
  "totalMarked": 45,
  "presentPercentage": "88.9"
}
```

---

## Security Considerations

| Aspect | Implementation |
|---|---|
| **Authentication** | JWT-based stateless authentication with 24-hour token expiry |
| **Password Storage** | bcrypt hashing with 10 salt rounds — plaintext passwords are never stored |
| **Signup Gating** | Teacher registration requires a pre-shared `TEACHER_SECRET_ID`, preventing unauthorized account creation |
| **Token Handling** | Tokens are stored in `localStorage` and attached automatically via Axios interceptor |
| **Route Protection** | Frontend uses `ProtectedRoute` wrapper; backend enforces `authMiddleware` on all data routes |
| **Input Validation** | Mongoose schema-level validation (required fields, enums, unique constraints) |
| **Duplicate Prevention** | Compound unique index on `(studentId, date)` prevents double attendance entries |
| **Error Sanitization** | Centralized error middleware avoids leaking stack traces — only `{ message }` is returned |
| **CORS** | Enabled via `cors` middleware for cross-origin requests from the frontend dev server |

---

## Future Improvements

| Category | Planned Enhancement |
|---|---|
| **Feature Expansion** | Multi-teacher support with role-based access (Admin, Teacher, Viewer) |
| | Export attendance data to CSV/Excel |
| | Parent notification system via email/SMS for absent students |
| | Holiday calendar integration to auto-skip non-working days |
| **Performance** | Pagination for student lists and attendance records |
| | Redis caching for frequently accessed reports |
| | Database query optimization with selective field projection |
| **Scaling** | Horizontal scaling with PM2 cluster mode |
| | Database read replicas for report-heavy workloads |
| **Infrastructure** | Docker and Docker Compose for one-command deployment |
| | CI/CD pipeline with GitHub Actions (lint, test, build, deploy) |
| | Environment-specific configs (dev, staging, production) |
| **Testing** | Unit tests for controllers and utils with Jest |
| | Integration tests for API endpoints with Supertest |
| | End-to-end tests with Playwright |
| **Security** | Rate limiting on authentication endpoints |
| | Refresh token rotation for extended sessions |
| | Helmet.js for HTTP security headers |

---

## Contributing

Contributions are welcome. Please follow these guidelines:

### Getting Started

1. **Fork** the repository
2. **Clone** your fork locally
3. **Create a feature branch** from `main`:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. **Make your changes** with clear, descriptive commits
5. **Push** to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
6. **Open a Pull Request** against the `main` branch

### Coding Standards

- Follow existing code style and naming conventions
- Use `async/await` for all asynchronous operations
- Delegate errors to `next()` in controllers — do not handle them inline
- Keep components focused and single-responsibility
- Write descriptive commit messages in present tense (`Add student filter` not `Added student filter`)

---

## License

This project is licensed under the **ISC License**.

---

<p align="center">
  Built with ❤️ for educational institutions
</p>
