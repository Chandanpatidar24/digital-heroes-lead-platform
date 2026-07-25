# Digital Heroes Lead Management Platform

A production-grade Lead Management Platform built for sales teams. Features a **public lead capture form**, an **authenticated internal dashboard** with strict Role-Based Access Control (RBAC) for **Admin** and **Member** roles, visual **Kanban pipeline board**, tabular view, timestamped notes, automated **Activity Log audit trails**, **Team Management with 1-Click Lead Transfer**, and comprehensive REST APIs.

---

## 🔗 Live Build Credit & Link
> **Built for Digital Heroes Training Task** — [digitalheroesco.com](https://digitalheroesco.com)

---

## 🛠️ Technology Stack

- **Frontend**: React (Vite) + Tailwind CSS (Ivory & Warm Stone Theme) + Lucide React Icons + Axios
- **Backend**: Node.js + Express.js + JWT Token Auth + Bcrypt Password Hashing
- **Database & ORM**: Neon Serverless Cloud PostgreSQL + Prisma ORM (Type-safe queries, migration, & seed management)
- **Containerization & DevOps**: Docker + Docker Compose (Multi-stage production container build)
- **Testing**: Vitest + Supertest (10 Automated API, Auth, Scoping & RBAC regression tests)

---

## 🔑 Evaluator Quick-Start Credentials

| Role | Email | Password | Permissions & Capabilities |
| :--- | :--- | :--- | :--- |
| **ADMIN** | `admin@digitalheroes.com` | `admin123` | Full access: View all system leads, update status, add notes, **reassign leads to team reps**, register team members, **1-click lead transfer upon deletion**, and delete leads. |
| **MEMBER** | `member@digitalheroes.com` | `member123` | Sales rep access: View **only assigned leads**, update pipeline status, add timestamped notes. *Reassignment, deletion, and other members' leads blocked (403 Forbidden).* |

---

## 🤖 AI Tools Usage Disclosure Statement

> **AI Tools Disclosure Statement**:  
> In accordance with the Digital Heroes task kit guidelines:
> - **Problem Analysis & Concept Validation**: **ChatGPT** was utilized to deeply analyze the task kit requirements, break down the role brief, and structure architectural concepts for legacy refactoring.
> - **Code Generation & Implementation**: **Google Antigravity** (pair programming AI coding assistant) was used to construct full-stack code (React frontend components, Express REST API routes, Prisma schemas), containerize the stack with Docker, migrate database schemas to Neon PostgreSQL, generate automated Vitest test suites, and draft technical documentation.
> - **Human Refinement & Judgment**: All generated components were audited, customized, and refined to enforce strict role scoping, custom UI/UX modal workflows, 1-click lead transfers, and production readiness.

---

## 🐳 1-Command Docker Deployment (Recommended)

Run the entire containerized application (React frontend + Express API + Database connection) with a single command:

```bash
docker compose up --build
```

Open **`http://localhost:5000`** in your browser to test the live platform!

---

## 🚀 Standard Local Installation

### 1. Setup Backend
```bash
cd backend
npm install
npx prisma migrate dev --name init
node prisma/seed.js
npm run dev
```

### 2. Setup Frontend
```bash
cd frontend
npm install
npm run dev
```
Visit **`http://localhost:3000`** in your browser.

---

## ☁️ Server Deployment Guide (Render.com)

1. Push your repository to GitHub.
2. Log into [Render.com](https://render.com) and click **New ➔ Web Service**.
3. Connect your GitHub repository.
4. Select **Docker** as the Environment.
5. Set `DATABASE_URL` environment variable pointing to your Neon PostgreSQL database.
6. Render will automatically build the React frontend and Express API, serving your live HTTPS URL (e.g. `https://digital-heroes-leads.onrender.com`).

---

## 🧪 Running Automated Tests

```bash
cd backend
npm test
```
*Expected Output: 10 Passed (10 tests across 2 test suites).*

---

## 📚 REST JSON API Documentation

All API endpoints return JSON payloads. Authenticated routes require a `Authorization: Bearer <JWT_TOKEN>` header.

### Authentication & Team Management Endpoints
- `POST /api/auth/login` - Authenticates user credentials & returns JWT token.
- `POST /api/auth/register` - Registers new team member (**ADMIN ONLY**).
- `DELETE /api/auth/users/:id` - Removes team member with 1-click lead transfer (**ADMIN ONLY**).
- `GET /api/auth/me` - Validates active session token.
- `GET /api/auth/users` - Fetches active team members list.

### Lead Management Endpoints
- `POST /api/leads/public` - **Public capture endpoint** (No token required).
- `GET /api/leads` - Protected list supporting pagination (`page`, `limit`), filtering (`status`, `assignedTo`, `search`). Members see assigned leads only.
- `GET /api/leads/:id` - Fetches single lead details with full notes and activity audit log.
- `PATCH /api/leads/:id` - Updates lead status or assignee (**ADMIN ONLY for reassignment**).
- `POST /api/leads/:id/notes` - Adds timestamped note & logs activity.
- `DELETE /api/leads/:id` - Permanently deletes lead (**ADMIN ONLY**).

---

## 📄 Task B Architectural & Refactoring Report
The comprehensive engineering report addressing legacy system refactoring, risk matrices, strangler-fig migration roadmaps, before/after code refactors, and engineering standards adoption is located in:
👉 **[`TASK_B_INHERIT_AND_IMPROVE.md`](file:///c:/Users/kartik/Desktop/Digital%20Heroes/TASK_B_INHERIT_AND_IMPROVE.md)**
