# RoomScheduler 🏢

[![Status](https://img.shields.io/badge/status-complete-green)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()
[![Java](https://img.shields.io/badge/Java-21-orange)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-4.0-green)](https://spring.io/projects/spring-boot)
[![Next.js](https://img.shields.io/badge/Next.js-16-black)](https://nextjs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)](https://www.postgresql.org/)

[Leia este documento em Português](README-pt.md)

**Enterprise-grade Full Stack system for meeting room scheduling and space management featuring Double Booking Prevention, RBAC security, JPA Auditing, iCalendar export, Analytics Dashboard, and automated CI/CD.**

---

## 📖 About the Project

**RoomScheduler** is a production-ready corporate solution designed to eliminate meeting room booking conflicts. Unlike standard CRUD applications, RoomScheduler incorporates **stateful scheduling logic** that mathematically prevents overlapping bookings at the database level (**Double Booking Prevention** algorithm: `StartA < EndB && EndA > StartB`).

### 🌐 Live Production Links

- **Application (Frontend):** [Access RoomScheduler (Vercel)](https://room-scheduler-gold.vercel.app/)
- **API Status (Backend):** [API Status (Render)](https://room-scheduler-api.onrender.com/api/rooms)
- **Health Check (Actuator):** [Health Endpoint](https://room-scheduler-api.onrender.com/actuator/health)

> **⚠️ Deployment Note (Render Free Tier):**
> The Backend API is hosted on Render's free tier. The first request after a period of inactivity may take up to 60 seconds to spin up.

---

## 🏗️ Architecture & Technologies

### Backend (RESTful API)
- **Java 21 & Spring Boot 4.0**: Layered architecture (`Controller -> Service -> Repository`) with strict DTO isolation and zero entity leakage.
- **Spring Security & JWT**: Stateless authentication with Role-Based Access Control (**RBAC** - `USER` vs `ADMIN`), timezone-agnostic expiration (`Instant.now()`), and custom preflight CORS handling.
- **JPA Auditing & Entity Lifecycle Hooks**: Automatic timestamping (`created_at`, `updated_at`) using `@EnableJpaAuditing` and `@PrePersist` / `@PreUpdate` callbacks.
- **Database Migrations (Flyway)**: Versioned database evolution with performance indexes (`idx_bookings_room_time`, `idx_bookings_user`, `idx_users_email`).
- **Spring Data Pagination**: Paged endpoints with `Pageable` parameters (`/api/bookings/page`, `/api/users/page`).
- **Spring Boot Actuator**: Production monitoring endpoints (`/actuator/health`, `/actuator/metrics`).
- **Email Notifications (`NotificationService`)**: Asynchronous email delivery with `JavaMailSender` and resilient fallback logging on booking creations and cancellations.
- **iCalendar (.ics) RFC 5545 Engine**: Standard calendar invitation generator (`/api/bookings/{id}/ics`) compatible with Google Calendar, Apple Calendar, and Microsoft Outlook.
- **Automated Data Seeder (`DataInitializer`)**: Automatic provisioning of default administrator account (`admin@room.com`) and starter meeting rooms on startup.
- **Swagger / OpenAPI 3**: Interactive API documentation at `/swagger-ui.html`.
- **JUnit 5 & Mockito**: Full automated test suite with in-memory H2 database.

### Frontend (SPA/SSR)
- **Next.js 16 (App Router)** & **React 19**: Modern UI with server and client component separation.
- **TypeScript**: Strictly typed interfaces aligned with backend DTOs.
- **Next.js Edge Middleware**: Edge route protection and RBAC verification for `/admin` and `/my-bookings`.
- **Centralized API Client**: Typed client (`src/services/api.ts`) with standardized error mapping.
- **Interactive Daily Schedule Timeline**: Visual daily room availability grid with live date filtering.
- **Analytics & Utilization Dashboard**: Admin KPIs, total booked hours, and percentage breakdown per room.
- **Real-Time Password Validation**: Live password strength criteria checklist (5 rules), password confirmation match feedback, and visibility toggles.
- **Custom Accessible Modals**: Tailwind CSS confirmation modals (`ConfirmModal`) replacing native browser alerts.
- **CSV Data Export**: One-click spreadsheet export for reservations and registered users.
- **Tailwind CSS**: Clean, responsive enterprise styling.

### DevOps & Infrastructure
- **Docker Compose**: Containerized local PostgreSQL (port `5434`) and backend configuration.
- **GitHub Actions CI**: Automated CI pipeline running backend Maven tests and frontend Next.js builds on every push and pull request.

---

## ✨ Key Features

### 🔒 Security & RBAC
- **JWT Bearer Authentication**: Secure stateless token authentication.
- **Granular Permissions**: Role enforcement (`ADMIN` manages rooms/users; `USER` manages own bookings).
- **Password Strength Engine**: Dynamic 5-point validation (minimum 8 characters, uppercase, lowercase, numbers, special characters).
- **Edge Route Guards**: Server-side route interception protecting private areas.

### 📅 Smart Booking Logic
- **Double Booking Prevention**: Mathematical conflict avoidance (`existsOverlappingBooking`).
- **24-Hour Cancellation SLA**: Standard users can only cancel reservations with at least 24 hours notice.
- **Admin Override**: Administrators can cancel any reservation immediately.
- **15-Minute Minimum Duration**: Client and server-side duration validation.
- **Calendar Integration**: Export bookings directly to `.ics` files for calendar sync.

### ⚙️ Administrative Dashboard & Analytics
- **Space Management**: Create, update, and delete meeting rooms with active reservation checks.
- **User Management**: View users, promote/demote roles (`USER` / `ADMIN`), and remove accounts.
- **Occupancy Analytics**: Real-time charts showing room usage share and cumulative meeting hours.
- **Reports Export**: Export bookings and user data to CSV files.

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
*(PostgreSQL runs on port `5434` to prevent port conflicts on the host machine)*

### Step 3: Start Backend (Spring Boot)
```bash
cd scheduler
./mvnw spring-boot:run
```
*The API will be available at http://localhost:8080*

> **Default Admin Credentials (Auto-created on first run):**
> - **Email:** `admin@room.com`
> - **Password:** `Admin@12345`

### Step 4: Start Frontend (Next.js)
In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
*The Frontend will be available at http://localhost:3000*

### Step 5: Run Tests & Verification
```bash
# Run backend test suite (25 automated tests)
cd scheduler
./mvnw test

# Validate Next.js frontend build
cd ../frontend
npm run build
```

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

Developed by Paulo Roberto A. Gomes.
