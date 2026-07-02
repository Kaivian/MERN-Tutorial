# FPT Unimate

A full-stack university student management platform built with the **MERN stack** (MongoDB, Express.js, React/Next.js, Node.js). It provides curriculum tracking, GPA calculation, expense management, task & deadline management, role-based access control, and an admin panel — all wrapped in a retro pixel-art themed UI with dark mode support.

---

## Key Features

- **Authentication & Authorization** — JWT access/refresh token strategy, Google OAuth 2.0, role-based access control (RBAC)
- **Curriculum Management** — Browse curriculums, majors, and subjects; admin CRUD for curriculum structures
- **User Curriculum & GPA** — Track enrolled subjects, save grades, and calculate GPA
- **Task & Deadline Manager** — Create tasks with subtasks tied to subjects, manage deadlines
- **Expense Tracker** — Record transactions, set budgets, manage recurring expenses, view dashboard analytics
- **User & Role Administration** — Manage user accounts, create and assign custom roles with granular permissions
- **Internationalization (i18n)** — English and Vietnamese language support
- **Dark Mode** — Light/dark theme toggle powered by `next-themes` and HeroUI theming
- **Responsive UI** — Retro pixel-art design system with custom animations, built on HeroUI + Tailwind CSS v4

---

## Tech Stack

### Frontend (`client/`)

| Category | Technology |
|---|---|
| Framework | Next.js 16 (App Router, React Compiler) |
| Language | TypeScript |
| UI Library | HeroUI (formerly NextUI) |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| State/Data | TanStack React Query, React Hook Form |
| HTTP Client | Axios |
| Auth (client-side) | Jose (JWT verification) |
| Charts | Recharts |
| Drag & Drop | @dnd-kit |
| Icons | Solar Icons, Lucide React, React Icons, Pixel Icon Library |
| Theming | next-themes |

### Backend (`server/`)

| Category | Technology |
|---|---|
| Runtime | Node.js ≥ 22 |
| Framework | Express.js 4 |
| Database | MongoDB (Mongoose ODM) |
| Authentication | JSON Web Tokens (jsonwebtoken), bcrypt |
| OAuth | Google Auth Library |
| Validation | Zod, Joi |
| Security | Helmet, CORS, HPP, express-rate-limit, cookie-parser |
| Logging | Morgan → custom Winston-style logger |
| Scheduling | node-cron |
| Caching | lru-cache |
| HTTP Compression | compression |

### DevOps & Tooling

| Category | Technology |
|---|---|
| Containerization | Docker, Docker Compose |
| Deployment | Vercel (frontend) |
| Linting | ESLint (flat config) with `check-file` plugin |
| Formatting | Prettier |
| Dev Server | Nodemon (server), Next.js dev (client) |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         Client (Next.js 16)                     │
│  App Router ─► Pages ─► Components ─► Services ─► Axios ──┐    │
│  Providers: Auth, Theme, Language, React Query              │    │
└─────────────────────────────────────────────────────────────┼────┘
                                                              │
                                                   HTTP / API Proxy
                                                              │
┌─────────────────────────────────────────────────────────────┼────┐
│                       Server (Express.js)                   │    │
│  Routes ─► Middlewares ─► Controllers ─► Services ─► Repos  │    │
│  Middlewares: Auth, RBAC, Validation, Rate Limit, Response  │    │
└─────────────────────────────────────────────────────────────┼────┘
                                                              │
                                                          Mongoose
                                                              │
                                                    ┌─────────▼──────┐
                                                    │    MongoDB      │
                                                    └────────────────┘
```

The backend follows a **layered architecture**: Routes → Controllers → Services → Repositories → Models. Middleware handles cross-cutting concerns (auth, validation, rate limiting, response formatting).

---

## Folder Structure

```
.
├── client/                          # Frontend (Next.js 16 + TypeScript)
│   ├── src/
│   │   ├── app/                     # App Router pages & layouts
│   │   │   ├── (auth)/              # Auth pages (login, register)
│   │   │   ├── (main)/              # Protected pages
│   │   │   │   ├── calendar/
│   │   │   │   ├── curriculums/
│   │   │   │   ├── dashboard/
│   │   │   │   ├── deadline-manager/
│   │   │   │   ├── expense/
│   │   │   │   ├── grade/
│   │   │   │   ├── profile/
│   │   │   │   ├── roles/
│   │   │   │   └── user-accounts/
│   │   │   └── api/                 # Next.js API routes (proxy)
│   │   ├── components/              # Reusable UI components
│   │   ├── config/                  # App config, env, fonts, permissions
│   │   ├── data/                    # Static data / constants
│   │   ├── hooks/                   # Custom React hooks
│   │   ├── i18n/                    # Internationalization (en, vi)
│   │   ├── providers/               # Context providers (Auth, Language)
│   │   ├── services/                # API service layer (Axios calls)
│   │   ├── styles/                  # Global CSS
│   │   ├── types/                   # TypeScript type definitions
│   │   └── utils/                   # Utility functions
│   ├── public/                      # Static assets
│   ├── Dockerfile                   # Multi-stage Docker build
│   ├── next.config.ts               # Next.js configuration (API proxy)
│   ├── tailwind.config.ts           # Tailwind + HeroUI theme config
│   ├── tsconfig.json
│   ├── vercel.json                  # Vercel deployment config
│   └── package.json
│
├── server/                          # Backend (Node.js + Express)
│   ├── src/
│   │   ├── config/                  # Environment & database config
│   │   ├── controllers/             # Route handlers
│   │   ├── db/                      # Database connection & seed data
│   │   ├── middlewares/             # Auth, RBAC, validation, rate limit
│   │   ├── models/                  # Mongoose schemas & models
│   │   ├── repositories/           # Data access layer
│   │   ├── routes/                  # Express route definitions
│   │   ├── scripts/                 # Seed scripts
│   │   ├── services/                # Business logic layer
│   │   ├── utils/                   # Logger, cron utilities
│   │   ├── validations/             # Input validation schemas
│   │   ├── app.js                   # Express app setup & middleware
│   │   └── server.js                # Entry point (DB connect + listen)
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml               # Orchestrate client + server containers
├── LICENSE.txt                       # GNU GPL v3
└── README.md
```

---

## Prerequisites

- **Node.js** ≥ 22.0.0
- **npm** (ships with Node.js)
- **MongoDB** instance (local or [MongoDB Atlas](https://www.mongodb.com/atlas))
- **Google Cloud Console** project (for OAuth — optional but recommended)
- **Docker** & **Docker Compose** (optional, for containerized deployment)

---

## Installation

### 1. Clone the repository

```bash
git clone https://github.com/Kaivian/MERN-Tutorial.git
cd MERN-Tutorial/MERN/src/SSG
```

### 2. Install dependencies

```bash
# Server
cd server
npm install

# Client
cd ../client
npm install
```

---

## Environment Configuration

Both workspaces require environment files. Example templates are provided.

### Server

```bash
cp server/.env.example server/.env
```

Key variables:

| Variable | Description |
|---|---|
| `PORT` | Server port (default: `5000`) |
| `DATABASE_URL` | MongoDB connection string |
| `JWT_ACCESS_SECRET` | Secret for signing access tokens |
| `JWT_REFRESH_SECRET` | Secret for signing refresh tokens |
| `JWT_ACCESS_EXPIRES_IN` | Access token TTL (e.g., `15m`) |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token TTL (e.g., `7d`) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret |
| `GOOGLE_CALLBACK_URL` | Google OAuth redirect URI |
| `COOKIE_SECRET` | Secret for signing cookies |
| `ALLOWED_ORIGINS` | Comma-separated allowed CORS origins |
| `EMAIL_*` | SMTP config for password reset emails |

### Client

```bash
cp client/.env.example client/.env.local
```

Key variables:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL (e.g., `http://localhost:5000`) |
| `NEXT_PUBLIC_APP_URL` | Frontend URL (e.g., `http://localhost:3000`) |
| `NEXT_PUBLIC_CLIENT_AUDIENCE_ID` | JWT audience ID (must match server) |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client ID (must match server) |
| `NEXT_PUBLIC_APP_NAME` | Application display name |
| `NEXT_PUBLIC_ENABLE_REGISTRATION` | Toggle registration (`true`/`false`) |

> **Sync Check:** Ensure `NEXT_PUBLIC_CLIENT_AUDIENCE_ID` matches `JWT_ACCESS_AUDIENCE_ID` on the server, and `NEXT_PUBLIC_GOOGLE_CLIENT_ID` matches `GOOGLE_CLIENT_ID`.

---

## Running the Project

### Development

Start each workspace in separate terminals:

```bash
# Terminal 1 — Server (port 5000)
cd server
npm run dev

# Terminal 2 — Client (port 3000)
cd client
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production

```bash
# Server
cd server
npm start

# Client
cd client
npm run build
npm start
```

### Docker

```bash
# From the project root
docker-compose up --build
```

This starts both services:
- **Server** → `http://localhost:5000`
- **Client** → `http://localhost:3000`

---

## Available Scripts

### Server (`server/`)

| Script | Description |
|---|---|
| `npm run dev` | Start dev server with Nodemon (auto-reload) |
| `npm start` | Start production server |
| `npm run seed` | Seed database (development) |
| `npm run seedprod` | Seed database (production) |
| `npm run lint` | Run ESLint |
| `npm run format` | Format code with Prettier |
| `npm test` | Run tests (`node --test`) |
| `npm run test:watch` | Run tests in watch mode |

### Client (`client/`)

| Script | Description |
|---|---|
| `npm run dev` | Start Next.js dev server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint (Next.js + TypeScript rules) |
| `npm run type-check` | Run TypeScript type checking (`tsc --noEmit`) |
| `npm run format` | Format code with Prettier |

---

## API Endpoints

All API routes are prefixed with `/api`.

| Method | Route | Description |
|---|---|---|
| `GET` | `/api/status` | Health check |
| `*` | `/api/auth/*` | Authentication (login, register, logout, refresh) |
| `*` | `/api/curriculums/*` | Curriculum & subject browsing |
| `*` | `/api/user/curriculum` | User curriculum context, grades, GPA |
| `*` | `/api/tasks/*` | Task & deadline management |
| `*` | `/api/expense/*` | Expense tracking & budgets |
| `*` | `/api/users/*` | User account management (protected) |
| `*` | `/api/roles/*` | Role management (protected) |
| `*` | `/api/admin/*` | Admin curriculum builder (protected) |

---

## Screenshots

<!-- Add screenshots here when available -->

| Page | Screenshot |
|---|---|
| Landing Page | *Coming soon* |
| Dashboard | *Coming soon* |
| Curriculum Browser | *Coming soon* |
| Expense Tracker | *Coming soon* |
| Admin Panel | *Coming soon* |

---

## License

This project is licensed under the **GNU General Public License v3.0** — see the [LICENSE.txt](LICENSE.txt) file for details.

Copyright © 2025 Thế Lực Đoàn

---

## Contributors

| # | Name |
|---|---|
| 1 | Đoàn Thế Lực |
| 2 | Nguyễn Hoàng Ngọc Ánh |
| 3 | Trần Đức Việt |
| 4 | Nguyễn Văn Quý |
| 5 | Nguyễn Văn Tuấn |