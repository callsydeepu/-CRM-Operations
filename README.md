# Mini ERP + CRM Operations Portal

A full-stack web application for enterprise resource planning and customer relationship management.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React + JavaScript (Vite) |
| Backend | Node.js + Express.js |
| Database | MySQL |
| Auth | JWT + bcryptjs |

## Project Structure

```
mini-erp-crm/
├── frontend/          # React application (Vite)
├── backend/           # Express.js API server
├── database/          # SQL schema and seed files
├── .env.example       # Environment variables template
├── .gitignore
└── README.md
```

## Getting Started

### Prerequisites

- Node.js (v18+)
- MySQL (v8+)
- npm

### 1. Database Setup

```bash
# Log into MySQL
mysql -u root -p

# Run the schema
source database/schema.sql;

# Run the seed data
source database/seed.sql;
```

### 2. Backend Setup

```bash
cd backend
cp ../.env.example .env
# Edit .env with your MySQL credentials and JWT secret
npm install
npm run dev
```

The API will start on `http://localhost:5000`.

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app will start on `http://localhost:5173`.

## Test Credentials

| Role | Email | Password |
|---|---|---|
| Admin | admin@example.com | Password123 |
| Sales | sales@example.com | Password123 |
| Warehouse | warehouse@example.com | Password123 |
| Accounts | accounts@example.com | Password123 |

> **Note:** These credentials are for local development only.

## API Endpoints

### Health Check
- `GET /api/health` — Server health check

### Authentication
- `POST /api/auth/login` — Login with email and password
- `GET /api/auth/me` — Get current authenticated user (requires JWT)
- `GET /api/auth/admin-test` — Admin-only test endpoint (requires Admin role)
