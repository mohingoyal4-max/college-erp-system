# 🎓 AcademiaPro — Full Stack College ERP System

> A comprehensive, modern, production-ready Full Stack College Enterprise Resource Planning (ERP) web application featuring dedicated portals for **Administrators**, **Faculty**, and **Students**, built with **React (Vite + Tailwind CSS)**, **Node.js / Express**, and **Prisma ORM with SQLite**.

---

## 🌟 Key Highlights & Core Features

### 1. 👨‍🎓 Students Management Module
- **Comprehensive Student Profiles**: Roll Number, Institutional Enrollment Number, Department, Semester, Section, Academic Batch, Parent/Guardian information, Blood Group, and Contact Details.
- **Admin Control**: Full CRUD capabilities (Add, Edit, View, and Delete students) with live multi-filter searching by Name, Roll Number, Department, and Semester.
- **Curriculum Enrollment**: Automated mapping of students to their departmental semester courses and syllabus.

### 2. 👨‍🏫 Faculty Management & Course Allocation
- **Faculty Directory**: Employee ID, Department, Academic Designation (Professor, Assoc. Professor, Assistant Professor, HOD), and Qualifications (e.g. Ph.D., M.Tech).
- **Course & Section Assignment**: Assign faculty instructors to specific subjects, classroom sections (e.g., Section A, B), and academic years.
- **Teaching Schedule**: View assigned lecture classes and student batches under instruction.

### 3. 📅 Lecture Attendance Management System (Core Feature)
- **Interactive Marking Interface**:
  - Faculty selects Course, Section, Date, Time Slot, and Lecture Topic.
  - Interactive status toggles: **Present** (Green), **Absent** (Red), and **Late** (Amber) with instant feedback.
  - One-click bulk actions: `Mark All Present` and `Mark All Absent`.
  - Real-time present, absent, and late live counters.
- **Shortage Warning Indicator**:
  - Highlights any student falling below the mandatory **75% minimum attendance requirement** with a prominent **Shortage Alert** badge and warning card.
  - Visual color-coded attendance progress bars.
- **Lecture History & Rosters**: Full historical log of all past class sessions with student-by-student presence logs.

### 4. 📊 Examination Marks & Grading Module (Core Feature)
- **Multi-Tier Assessment Support**: Internal Assessment 1 (IA-1), Internal Assessment 2 (IA-2), Midterm Examinations, Practical/Assignments, and End-Semester Exams.
- **Automated Grading Engine**:
  - Dynamic Letter Grade calculation: **A+ (≥90%)**, **A (≥80%)**, **B (≥70%)**, **C (≥60%)**, **D (≥50%)**, **E (≥40%)**, and **F (<40% - Fail)**.
  - Automatic Grade Point mapping (10, 9, 8, 7, 6, 5, 0).
  - Validation preventing scores greater than maximum marks or negative inputs.
- **Class Analytics**: Real-time calculation of Class Mean/Average, Top Scorer (Highest), Lowest, and Pass Percentage.
- **Student Marksheet & SGPA/CGPA**: Complete semester grade report card with subject-by-subject assessment scores, earned credits, and academic standing (*All Clear* vs *Backlogs*).

### 5. 📢 Campus Announcements & Circulars
- System-wide and audience-targeted bulletins (**All Campus**, **Students Only**, **Faculty Only**).
- Category badges: *Exam*, *Academic*, *Holiday*, *General*.

### 6. 🛡️ Role & Permissions Management (Custom Roles)
- **Create Custom Roles**: Administrators can define any role (e.g., `HOD`, `EXAM_CONTROLLER`, `LIBRARIAN`, `ACCOUNTANT`, `WARDEN`).
- **Granular Permissions Matrix**: Assign permissions for Students, Faculty, Attendance, Marks, Departments, Curriculum, and Notices.
- **Dynamic Portal & Navigation**: Users logging in with custom roles receive a dedicated dashboard and sidebar customized to their permissions.
- **Self-Registration with Role**: Users can choose any active role directly from the login page under **"Add Account / Role"** to register and immediately log in.

---

## 🔑 Demo Login Credentials (1-Click Logins on UI)

The login screen features **⚡ 1-Click Demo Login Buttons** to allow immediate testing without manual typing:

| Portal Role | Demo Email | Password | Key Persona & Features |
| :--- | :--- | :--- | :--- |
| **👑 Admin** | `admin@erp.edu` | `admin123` | Dr. Rajesh Sharma (Dean / Administrator) — Full management & role creation |
| **👨‍🏫 Faculty** | `faculty.cs@erp.edu` | `faculty123` | Dr. Ananya Verma (CSE) — Take attendance, enter examination marks |
| **👨‍🎓 Student 1** | `student1@erp.edu` | `student123` | Rohan Gupta — **88% Attendance (Eligible & High Performer)** |
| **⚠️ Student 2** | `student2@erp.edu` | `student123` | Priya Nair — **50% Attendance (Triggers Shortage Warning <75%)** |
| **🏛️ Custom HOD** | `hod.cs@erp.edu` | `hod123` | Dr. Arvind Mehta (HOD - CSE) — Custom role with monitoring permissions |
| **📝 Exam Controller** | `exam@erp.edu` | `exam123` | Prof. S. K. Bansal — Custom role for marks validation & exam circulars |

---

## 🛠️ Technology Stack & Architecture

- **Frontend**:
  - React 18 with Vite
  - Tailwind CSS for modern responsive styling
  - Lucide React for consistent icons
  - React Router DOM v6 with Role-Based Protected Routes
  - Axios with JWT Interceptors
- **Backend**:
  - Node.js & Express.js
  - RESTful API design with clean separation of routes, controllers, and middleware
  - JWT (JSON Web Tokens) with 7-day session expiration
  - Bcrypt.js for secure password hashing
  - Role-based authorization middleware (`ADMIN`, `FACULTY`, `STUDENT`)
- **Database & ORM**:
  - SQLite (stored in `backend/dev.db` — runs zero-config locally on any Mac/PC)
  - Prisma ORM 5.22.0 for type-safe database schemas and migrations

---

## 🚀 How to Run the Project

### 1. Start Backend Server
In your terminal, navigate to the project root and run:
```bash
npm run dev:backend
```
*The backend API server starts at `http://localhost:5000`.*

### 2. Start Frontend Server
Open a second terminal window in the project root and run:
```bash
npm run dev:frontend
```
*The React application starts at `http://localhost:5173`.*

### 3. (Optional) Re-Seed Sample Database
To reset and re-populate the database with sample students, faculty, attendance sessions, and test marks at any time:
```bash
npm run seed
```

---

## 📂 Project Directory Structure

```
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma        # Complete relational schema (Users, Students, Faculty, Attendance, Marks)
│   │   ├── seed.js              # Comprehensive demo seed data
│   │   └── dev.db               # SQLite database
│   ├── src/
│   │   ├── config/
│   │   │   └── prisma.js        # Prisma client singleton
│   │   ├── controllers/
│   │   │   ├── auth.controller.js
│   │   │   ├── student.controller.js
│   │   │   ├── faculty.controller.js
│   │   │   ├── department.controller.js
│   │   │   ├── subject.controller.js
│   │   │   ├── attendance.controller.js
│   │   │   ├── marks.controller.js
│   │   │   ├── notice.controller.js
│   │   │   └── dashboard.controller.js
│   │   ├── middleware/
│   │   │   └── auth.js          # JWT verification & RBAC permissions
│   │   ├── routes/              # Express API endpoints
│   │   └── server.js            # Main Express server entry point
│   ├── package.json
│   └── .env
├── frontend/
│   ├── src/
│   │   ├── components/          # Navbar, Sidebar, StatCard, Modal, Layout, ProtectedRoute
│   │   ├── context/             # AuthContext (login, quickLogin, logout)
│   │   ├── pages/
│   │   │   ├── Login.jsx        # Login page with 1-click demo login buttons
│   │   │   ├── admin/           # AdminDashboard, StudentsList, FacultyList, DepartmentsList, SubjectsList, AdminAttendance, AdminMarks, NoticesPage
│   │   │   ├── faculty/         # FacultyDashboard, TakeAttendance, ViewAttendance, EnterMarks, SubjectMarksView, AssignedClasses
│   │   │   └── student/         # StudentDashboard, MyAttendance, MyMarks, MyCourses, StudentProfile
│   │   ├── services/
│   │   │   └── api.js           # Axios instance with interceptors
│   │   ├── App.jsx              # Routing & role guards
│   │   ├── main.jsx
│   │   └── index.css
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
├── package.json                 # Root script runner
└── README.md
```

---

## 📡 REST API Reference

| Endpoint | Method | Role | Description |
| :--- | :--- | :--- | :--- |
| `/api/auth/login` | `POST` | Public | Authenticate user & return JWT token |
| `/api/auth/me` | `GET` | Authenticated | Get current user profile |
| `/api/students` | `GET`, `POST` | Admin/Faculty | List students with filters or register new student |
| `/api/students/:id` | `GET`, `PUT`, `DELETE` | Admin/Faculty | Manage individual student record |
| `/api/faculty` | `GET`, `POST` | Admin | List faculty directory or register new faculty |
| `/api/subjects` | `GET`, `POST` | Admin | Curriculum courses management |
| `/api/subjects/assign` | `POST` | Admin | Assign faculty to course section |
| `/api/attendance/mark` | `POST` | Faculty/Admin | Submit batch lecture attendance |
| `/api/attendance/sessions` | `GET` | Faculty/Admin | View session history logs |
| `/api/attendance/subject-stats`| `GET` | Faculty/Admin | Subject attendance rates & shortage list |
| `/api/attendance/my-attendance` | `GET` | Student | Student personal attendance breakdown & logs |
| `/api/marks/save` | `POST` | Faculty/Admin | Record & update examination scores |
| `/api/marks/subject/:id` | `GET` | Faculty/Admin | Class marksheet & performance metrics |
| `/api/marks/my-marks` | `GET` | Student | Complete student marksheet & SGPA report |
| `/api/dashboard/:role` | `GET` | Role-specific | Live analytics & KPI metrics |
