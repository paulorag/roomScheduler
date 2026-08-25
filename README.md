# RoomScheduler 🏢

[![Status](https://img.shields.io/badge/status-complete-green)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()
[![Java](https://img.shields.io/badge/Java-21-orange)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3%2F4-green)](https://spring.io/projects/spring-boot)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)](https://www.postgresql.org/)

[Leia este documento em Português](README-pt.md)

**Enterprise-grade Full Stack system for meeting room scheduling and space management with Double Booking Prevention, RBAC security, and automated CI/CD.**

---

## 📖 About the Project

**RoomScheduler** is a complete, production-ready solution to solve meeting room booking conflicts. Unlike a basic CRUD, this system implements **stateful scheduling logic**, mathematically preventing overlapping bookings in the database (**Double Booking Prevention** algorithm: `StartA < EndB && EndA > StartB`).

### 🌐 Live Production Links

- **Application (Frontend):** [Access RoomScheduler (Vercel)](https://room-scheduler-gold.vercel.app/)
- **API Status (Backend):** [API Status (Render)](https://room-scheduler-api.onrender.com/api/rooms)

> **⚠️ Deployment Note (Render Free Tier):**
> The Backend API is hosted on Render's free tier. The first request may take up to 60 seconds to spin up.

---

## 🏗️ Architecture & Technologies

### Backend (RESTful API)
- **Java 21 & Spring Boot**: Robust core with DTO isolation and layered architecture (`Controller -> Service -> Repository`).
- **Spring Security & JWT**: Stateless authentication with Role-Based Access Control (**RBAC** - `USER` vs `ADMIN`).
- **Flyway Migrations**: Database schema versioning with performance indexes (`idx_bookings_room_time`, `idx_bookings_user`).
- **Swagger / OpenAPI 3**: Interactive API documentation at `/swagger-ui.html`.
- **Spring Data JPA & Hibernate**: Validated schema and queries against PostgreSQL.
- **JUnit 5 & Mockito**: Test suite with in-memory H2 database.

### Frontend (SPA/SSR)
- **Next.js 16 (App Router)** & **React 19**: Server and client components with clean separation.
- **TypeScript**: Shared typing and payloads with backend DTOs.
- **Next.js Edge Middleware**: Route protection and RBAC enforcement for `/admin` and `/my-bookings`.
- **Centralized API Client**: Typed HTTP client (`src/services/api.ts`) with error handling.
- **Tailwind CSS**: Modern, responsive corporate design.

### DevOps & Infrastructure
- **Docker Compose**: Multi-container setup for local PostgreSQL and backend services.
- **GitHub Actions CI**: Automated test execution and build verification on push and pull requests.

---

## ✨ Key Features

### 🔒 Security & RBAC
- **JWT Bearer Authentication**: Secure login and token generation.
- **Protected Endpoints**: Strict role validation (`ADMIN` for room/user management; `USER` for bookings).
- **Edge Middleware**: Route guards preventing unauthorized client-side access.

### 📅 Smart Booking Logic
- **Double Booking Prevention**: Database-level overlap prevention algorithm.
- **24-Hour SLA Rule**: Standard users can only cancel bookings with at least 24 hours notice.
- **Admin Override**: Administrators can manage and cancel any reservation at any time.
- **15-Minute Minimum Duration**: Client and server-side validation.

### ⚙️ Administrative Dashboard
- **Space Management**: Create, edit, and delete meeting rooms (with referential integrity validation).
- **User Management**: List users, promote/demote roles, and remove accounts.
- **Live Search & Filters**: Filter rooms, users, and bookings in real-time.

---

## 📚 API Documentation (Swagger)

When running the backend locally, access the interactive Swagger UI documentation at:
- **Swagger UI**: [http://localhost:8080/swagger-ui.html](http://localhost:8080/swagger-ui.html)
- **OpenAPI JSON**: [http://localhost:8080/v3/api-docs](http://localhost:8080/v3/api-docs)

---

## 🚀 How to Run Locally

### Prerequisites
- **Docker & Docker Compose**
- **Java 21 (JDK)**
- **Node.js 20+**

### Step 1: Clone the Repository
```bash
git clone https://github.com/paulorag/room-scheduler.git
cd room-scheduler
```

### Step 2: Start PostgreSQL Database
```bash
docker compose up -d postgres
```
*(PostgreSQL runs on port `5434` to avoid conflict with standard installations)*

### Step 3: Start Backend (Spring Boot)
```bash
cd scheduler
./mvnw spring-boot:run
```
*The Backend API will be available at http://localhost:8080*

### Step 4: Start Frontend (Next.js)
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
*The Frontend will be available at http://localhost:3000*

### Step 5: Run Tests
```bash
# Backend tests
cd scheduler
./mvnw test

# Frontend build check
cd ../frontend
npm run build
```

---

Developed by Paulo Roberto A. Gomes.
