# RoomScheduler 🏢

[![Status](https://img.shields.io/badge/status-complete-green)]()
[![License](https://img.shields.io/badge/license-MIT-blue)]()
[![Deploy Backend](https://img.shields.io/badge/Backend-Render-46E3B7?logo=render)](STATUS_API_RENDER)
[![Deploy Frontend](https://img.shields.io/badge/Frontend-Vercel-000?logo=vercel)](LINK_ROOMSCHEDULER_VERCEL)

[Leia este documento em Português](README-pt.md)

**Enterprise-grade Full Stack system for space and scheduling management with advanced security and RBAC.**

## 📖 About the Project

**RoomScheduler** is a complete solution to solve the problem of conflicts in meeting room bookings. Unlike a simple CRUD, this system implements **stateful scheduling logic**, mathematically ensuring that two people never occupy the same space at the same time (**Double Booking Prevention**).

The project was architected simulating a real production environment, using **Hybrid Cloud Deploy** across three different clouds to optimize costs, performance, and security.

### 🌐 Live Production Links

-   **Application (Frontend):** [Access RoomScheduler (Vercel)](https://room-scheduler-gold.vercel.app/)
-   **API (Backend):** [API Status (Render)](https://room-scheduler-api.onrender.com/api/rooms)

> **⚠️ Deployment Note (Render Free Tier):**
> The Backend API (Node.js) is hosted on **Render's free tier**.
> The first request (login/signup) **may take up to 60 seconds** to wake up the server. Please be patient on the first interaction.

---

## 🏗️ Architecture & Technologies

The system follows a distributed and "Cloud Native" architecture:

### Backend (RESTful API)

-   **Java 21 & Spring Boot 3:** Robust and typed application core.
-   **Spring Security + JWT:** Stateless authentication and permission control (**RBAC** - Role Based Access Control).
-   **Hibernate/JPA:** Optimized persistence layer.
-   **Docker:** Containerization with Multi-stage build (Maven image -> JRE Alpine image) for lightweight deployment.
-   **Hosting:** Render.

### Frontend (SPA/SSR)

-   **Next.js 15 (App Router):** Modern React framework with Server Components.
-   **TypeScript:** Strict typing shared with the Backend via interfaces.
-   **Tailwind CSS:** Responsive styling with a corporate "Clean" theme.
-   **Middleware:** Route protection and secure Cookie management.
-   **Hosting:** Vercel (Edge Network).

### Data

-   **PostgreSQL (Neon Tech):** Serverless database in the cloud for high availability.

---

## ✨ Key Features

### 🔒 Security & Identity

-   **JWT Authentication:** Secure login with signed tokens and HttpOnly Cookies.
-   **RBAC (Roles):** Strict differentiation between **USER** (standard) and **ADMIN** (manager).
-   **Route Protection:** Middleware in the Frontend prevents unauthorized access to administrative pages.

### 📅 Smart Booking Management

-   **Conflict Algorithm:** Prevents overlapping bookings in the database (`StartA < EndB && EndA > StartB`).
-   **Business Rules (SLA):** Cancellation is allowed only with 24h notice for standard users.
-   **Super Admin:** Administrators have an override to cancel any booking at any time.

### ⚙️ Complete Administrative Panel

-   **Room Management:** Create, Edit, and Delete physical spaces.
-   **User Management:** List users, promote to Admin, or ban from the system.
-   **Audit:** Global view of all schedules.

---

## 📸 Screenshots

### Administrative Dashboard

![Admin Dashboard](./assets/dashboard.png)
_Overview of bookings and room/user management._

### My Bookings (24h Rule)

![My Bookings](./assets/my-bookings.png)
_User interface showing cancellation block for short deadlines._

### Landing Page

![Home](./assets/home.png)
_Public listing of available rooms._

---

## 🚀 How to Run Locally

Follow these steps to run the project on your machine:

### Prerequisites

-   Docker & Docker Compose
-   Java 21 (JDK)
-   Node.js 18+

### Step 1: Clone and Configure

```bash
git clone [https://github.com/paulorag/room-scheduler.git](https://github.com/paulorag/room-scheduler.git)
cd room-scheduler
```

### Step 2: Database (Docker)

Start the Postgres container locally:

```bash
docker-compose up -d
```

### Step 3: Backend (Spring Boot)

In a separate terminal:

```bash
cd scheduler
./mvnw spring-boot:run
```

_The Backend will run at http://localhost:8080_

### Step 4: Frontend (Next.js)

Start the Postgres container locally:

```bash
cd frontend
npm install
npm run dev
```

_The Frontend will run at http://localhost:3000_

Developed by Paulo Roberto A. Gomes.
