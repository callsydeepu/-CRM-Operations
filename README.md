# Mini ERP + CRM Operations Portal

## 1. Project Overview

The **Mini ERP + CRM Operations Portal** is a full-stack web application designed for enterprise resource planning and customer relationship management. It enables growing businesses to streamline their core daily operations into a single unified interface:
- Capturing and tracking leads, customers, and scheduling follow-ups.
- Managing an active product catalog with selling prices, warehouse locations, and low-stock alerts.
- Conducting atomic stock adjustments (Stock IN and Stock OUT) with real-time audit logs.
- Generating sales delivery challans with historical product price snapshots and automated inventory deduction upon confirmation.
- Providing an executive dashboard displaying key operational metrics and alerts.

---

## 2. Features

Only implemented and validated modules are documented below:

* **Authentication and Roles**: Secure token-based access supporting four distinct roles (`Admin`, `Sales`, `Warehouse`, and `Accounts`) with role-based route protection.
* **Customer CRM**: Complete customer lifecycle management (lead tracking, wholesale/retail/distributor categorization, GST details, contact information, search, filtering, pagination, and follow-up scheduling with interaction notes).
* **Product Management**: SKU tracking, category classification, price definitions, minimum stock alert thresholds, warehouse bin/rack locations, and low-stock filtering.
* **Inventory / Stock Movements**: Transactional Stock IN (procurement/returns) and Stock OUT (dispatch/scrap) operations with atomic database balance updates and full audit logs.
* **Sales Challans**: Multi-item delivery challan generation with frozen product snapshots (`product_name_snapshot`, `sku_snapshot`, `unit_price_snapshot`), Draft preservation without inventory impact, atomic confirmation with strict stock validation, and cancellation support.
* **Dashboard**: Real-time KPI summary widgets (Total Customers, Total Products, Low Stock Items, Draft Challans, Confirmed Challans), recent delivery feed, and low-stock alert monitoring.

---

## 3. Tech Stack

### Frontend
* **React** (v18.2.0)
* **JavaScript** (ES6+)
* **HTML5** & **CSS3** (Tailored Design System based on Google Stitch UI specifications)
* **Vite** (Build tool & development server)
* **React Router DOM** (v6 client-side routing)
* **Axios** (HTTP client for API integration)

### Backend
* **Node.js** (v18+)
* **Express.js** (REST API framework)
* **JavaScript** (CommonJS)
* **mysql2** (Direct connection pooling and parameterized prepared statements)
* **CORS** & **dotenv** (Middleware and environment configuration)

### Database
* **MySQL** (v8.0+) with InnoDB engine for ACID transaction compliance (`START TRANSACTION`, `COMMIT`, `ROLLBACK`, `SELECT ... FOR UPDATE`)

### Authentication & Security
* **JSON Web Token (JWT)** (`jsonwebtoken`)
* **bcryptjs** (10-round salted password hashing)

---

## 4. Project Structure

```
mini-erp-crm/
├── backend/
│   ├── config/              # Database connection pool (mysql2)
│   ├── controllers/         # Request handlers (auth, customers, products, inventory, challans, dashboard)
│   ├── middleware/          # JWT authentication, role authorization, and global error handling
│   ├── routes/              # Express API route declarations
│   ├── utils/               # Database setup, clean scripts, and automated test runners
│   ├── app.js               # Express application configuration and route mounting
│   └── server.js            # HTTP server entry point (Port 5000)
├── frontend/
│   ├── public/              # Static public assets
│   ├── src/
│   │   ├── components/      # Reusable UI (Layout, Topbar, Sidebar, Badges, Modals, Pagination, Toasts)
│   │   ├── context/         # AuthContext for global user state and token management
│   │   ├── pages/           # Screen views (Login, Dashboard, Customers, Products, Inventory, Challans)
│   │   ├── services/        # Axios API client instance with interceptors
│   │   ├── styles/          # Design tokens and global CSS variables
│   │   ├── App.jsx          # Protected route declarations
│   │   └── main.jsx         # React application root mount
│   ├── index.html           # Single-page application entry point
│   └── vite.config.js       # Vite build configuration
├── database/
│   ├── schema.sql           # Complete MySQL DDL table definitions
│   └── seed.sql             # Clean database initialization template
├── postman/
│   └── Mini_ERP_CRM.postman_collection.json # Complete Postman API collection
├── .gitignore               # Ignored dependencies, build artifacts, and secrets
└── README.md                # System documentation
```

---

## 5. Server Setup

* **Runtime Requirement**: Node.js (v18.0.0 or higher) and npm.
* **Backend Dependencies**: Installed via `npm install` in the `backend/` directory.
* **Express Setup**: Implemented in `backend/app.js` with JSON parsing, CORS enabled for the client origin, mounted REST routers, health check endpoint (`GET /api/health`), and centralized error handling middleware.
* **MySQL Connection**: Managed via connection pooling in `backend/config/db.js` using `mysql2/promise` pool with configurable connection limits and automatic reconnection.
* **Starting the Backend**: Run `node server.js` or `npm run dev` from the `backend/` directory.
* **Default Port**: Listens on port `5000` (or `process.env.PORT`).

---

## 6. Environment Variables

### Backend Configuration (`backend/.env`)
The backend requires a `.env` file located in the `backend/` folder. A template is provided at `backend/.env.example`.

```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database Configuration (MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=mini_erp_crm

# JWT Configuration
JWT_SECRET=your_secure_jwt_secret_key
JWT_EXPIRES_IN=24h
```

| Variable | Description |
|---|---|
| `PORT` | The network port the Express server listens on (default: `5000`). |
| `NODE_ENV` | Environment mode (`development` or `production`). |
| `CLIENT_URL` | Allowed origin for Cross-Origin Resource Sharing (CORS). |
| `DB_HOST` | MySQL hostname (default: `localhost`). |
| `DB_PORT` | MySQL port (default: `3306`). |
| `DB_USER` | MySQL database user (e.g., `root`). |
| `DB_PASSWORD` | MySQL password for the specified user. |
| `DB_NAME` | MySQL database name (`mini_erp_crm`). |
| `JWT_SECRET` | Secret key used to sign and verify JSON Web Tokens. |
| `JWT_EXPIRES_IN` | Token expiration duration (default: `24h`). |

### Frontend Configuration (`frontend/.env`)
The frontend optionally reads configuration from `frontend/.env` (template at `frontend/.env.example`):

```env
VITE_API_URL=http://localhost:5000/api
```

> **Security Notice**: `.env` files are strictly excluded from version control via `.gitignore` and must never be committed.

---

## 7. Database Setup

* **Requirement**: MySQL Server (v8.0+).
* **Database Name**: `mini_erp_crm`.

### Setup Instructions:
1. Log into your MySQL CLI:
   ```bash
   mysql -u root -p
   ```
2. Execute the database schema definition:
   ```sql
   source database/schema.sql;
   ```
3. Alternatively, run the automated database table initializer from the `backend/` directory:
   ```bash
   npm run seed
   ```
   *(Creates all required tables with indexes, foreign keys, and constraints without injecting dummy records).*

---

## 8. Running the Project Locally

Follow these step-by-step instructions to run the application on your local machine:

### 1. Clone the Repository
```bash
git clone https://github.com/callsydeepu/-CRM-Operations.git
cd -CRM-Operations
```

### 2. Configure Backend Environment
```bash
cd backend
cp .env.example .env
# Open .env and enter your local MySQL password and a secret JWT key
```

### 3. Install Backend Dependencies & Initialize Database
```bash
npm install
npm run seed
```

### 4. Start Backend Server
```bash
node server.js
```
*Backend API starts at `http://localhost:5000`.*

### 5. Configure & Start Frontend
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*Frontend application starts at `http://localhost:5173`.*

### 6. Open Application
Navigate to **[http://localhost:5173](http://localhost:5173)** in your browser.

---

## 9. Authentication & Test Credentials

The portal implements strict role-based access control (RBAC) supporting four user roles:

| Role | Permissions Summary |
|---|---|
| **Admin** | Full system access across all modules (Customers, Products, Inventory, Challans, Dashboard). |
| **Sales** | Full access to Customer CRM and Sales Challan creation/confirmation; read-only access to products and movements. |
| **Warehouse** | Full access to Product catalog management and direct Stock IN / Stock OUT operations; read-only access to customers and challans. |
| **Accounts** | Read-only reporting access across all entities (Customers, Products, Stock Movements, Challans, and Dashboard metrics). |

### Creating Test Accounts
The database starts clean with zero pre-seeded records. You can register your own test accounts for any role directly from the login page by clicking **"Don't have an account? Register"** or via the API:

```json
POST /api/auth/register
{
  "name": "Super Admin",
  "email": "admin@mycompany.com",
  "password": "Password123!",
  "role": "Admin"
}
```

---

## 10. API Documentation

A complete Postman collection is included in the repository at `postman/Mini_ERP_CRM.postman_collection.json`.

### Authentication
* `POST /api/auth/register` — Register a new user account with role assignment.
* `POST /api/auth/login` — Authenticate with email/password; returns JWT token and user profile.
* `GET /api/auth/me` — Retrieve the currently authenticated user's profile (requires JWT).

### Customers
* `GET /api/customers` — List customers with pagination, search, status, and type filtering.
* `GET /api/customers/:id` — Retrieve detailed customer profile.
* `POST /api/customers` — Create a new customer (Admin, Sales).
* `PUT /api/customers/:id` — Update customer details (Admin, Sales).
* `POST /api/customers/:id/followup` — Update follow-up date and discussion notes (Admin, Sales).

### Products
* `GET /api/products` — List product catalog with category filter, search, and `lowStock=true` toggle.
* `GET /api/products/:id` — Retrieve product specifications and stock health.
* `POST /api/products` — Create a new product with SKU uniqueness validation (Admin, Warehouse).
* `PUT /api/products/:id` — Update product details and alert thresholds (Admin, Warehouse).

### Inventory
* `GET /api/inventory/movements` — Retrieve paginated stock movement audit logs with product and user details.
* `POST /api/inventory/stock-in` — Record Stock IN transaction, incrementing on-hand stock (Admin, Warehouse).
* `POST /api/inventory/stock-out` — Record Stock OUT transaction with negative stock prevention (Admin, Warehouse).

### Sales Challans
* `GET /api/challans` — List delivery challans with status filtering (`Draft`, `Confirmed`, `Cancelled`), search, and pagination.
* `GET /api/challans/:id` — Retrieve challan details with frozen snapshot line items and customer information.
* `POST /api/challans` — Create a Draft delivery challan storing product snapshots without stock deduction (Admin, Sales).
* `PUT /api/challans/:id` — Update an existing Draft delivery challan (Admin, Sales).
* `POST /api/challans/:id/confirm` — Atomic transaction checking stock availability across all items, deducting inventory, recording `OUT` movements, and marking status `Confirmed` (Admin, Sales).
* `POST /api/challans/:id/cancel` — Cancel a Draft delivery challan with zero inventory impact (Admin, Sales).

### Dashboard
* `GET /api/dashboard` — Retrieve live summary metrics (`totalCustomers`, `totalProducts`, `lowStockItems`, `draftChallans`, `confirmedChallans`, `recentChallans`, and `lowStockProducts`).

---

## 11. Architecture

### System Architecture Flow

```
┌─────────────────────────────────────────────────────────────┐
│                    React Client (Vite)                      │
│     (State, UI Components, Context API, Axios Client)       │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTPS / JSON
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                  Express.js REST API Server                 │
│  ┌───────────────────────────────────────────────────────┐  │
│  │             JWT Authentication Middleware             │  │
│  └───────────────────────────┬───────────────────────────┘  │
│                              ▼                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │           Role-Based Authorization Middleware         │  │
│  └───────────────────────────┬───────────────────────────┘  │
│                              ▼                              │
│  ┌───────────────────────────────────────────────────────┐  │
│  │   Controllers (Auth, CRM, Products, Stock, Challans)  │  │
│  └───────────────────────────┬───────────────────────────┘  │
└──────────────────────────────┼──────────────────────────────┘
                               │ Parameterized Prepared Queries
                               ▼
┌─────────────────────────────────────────────────────────────┐
│                   MySQL Relational Database                 │
│  (InnoDB Engine: ACID Atomic Transactions & Row Locking)    │
└─────────────────────────────────────────────────────────────┘
```

### Module Summary:
1. **Authentication**: Issues signed JWT tokens upon credential validation; verifies tokens and loads user roles on protected routes.
2. **Customer CRM**: Manages structured accounts and schedules follow-up interactions.
3. **Product Management**: Maintains master catalog specifications, SKU integrity, and alert thresholds.
4. **Inventory**: Executes atomic increments and decrements with non-negative constraints and movement audit records.
5. **Sales Challans**: Orchestrates dispatch workflows with immutable price snapshotting and transaction rollbacks on inventory shortages.
6. **Dashboard**: Aggregates operational counts directly from MySQL tables for real-time reporting.

---

## 12. Deployment

The application is structured for cloud deployment with decoupled frontend static hosting and backend API container/server execution.

### Local Development Deployment
* **Frontend**: Running locally via Vite development server at `http://localhost:5173`.
* **Backend**: Running locally via Node.js / Express at `http://localhost:5000`.
* **Database**: Local MySQL 8.0 instance on port `3306`.

### Cloud Deployment Strategy (Production Guide)
* **Frontend Hosting**: Deploy `frontend/dist` to services such as Vercel, Netlify, or AWS S3 + CloudFront.
  - Set Environment Variable: `VITE_API_URL=https://your-api-domain.com/api`
  - Build Command: `npm run build`
* **Backend Hosting**: Deploy `backend/` to services such as Render, Railway, AWS ECS, or DigitalOcean App Platform.
  - Set Environment Variables: `PORT`, `NODE_ENV=production`, `CLIENT_URL=https://your-frontend-domain.com`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`, `JWT_SECRET`, `JWT_EXPIRES_IN`.
* **Database Hosting**: Managed MySQL instances (e.g. AWS RDS MySQL, PlanetScale, Railway MySQL, or DigitalOcean Managed Databases).

> *Note: Production deployment was not completed as part of the local evaluation phase.*

---

## 13. Assumptions

The following technical assumptions were made during implementation based on the case study specifications:
1. **Database Engine**: MySQL 8.0 with InnoDB was selected to satisfy the requirement for ACID transactions and row-level locking during challan confirmation.
2. **Role Hierarchy**: Where granular permissions were unspecified in the brief, standard enterprise operational roles were applied:
   - `Sales` manages customers and challans, but cannot directly adjust raw warehouse stock.
   - `Warehouse` manages product master records and stock IN/OUT, but cannot create financial customer accounts or challans.
   - `Accounts` retains read-only visibility across all operations.
3. **Challan Numbering**: Auto-generated sequentially with year prefixing (`CH-YYYY-XXXXXX`) to ensure unique dispatch identification.
4. **Clean Installation**: The repository starts with an unpopulated database structure; accounts and operational records are generated dynamically during use.

---

## 14. Known Limitations / Incomplete Parts

* **All features required by the Case Study PDF are 100% complete and fully validated.**
* **Out-of-Scope Items**: In accordance with the prompt directives for this phase, PDF invoice generation, cloud storage (S3), Docker containerization, CI/CD pipelines, and payment gateway integrations were intentionally not included.

---

## 15. Testing

The codebase includes an automated test battery with **102/102 passing tests**:

1. **Authentication & Security (`node utils/test.js`)**: Validates login across all roles, invalid credentials rejection, missing parameters, token issuance, and protected route access.
2. **Customer CRM (`node utils/test-batch2.js`)**: Validates customer creation, editing, pagination, search, status/type filters, and follow-up updates.
3. **Product Management (`node utils/test-batch2.js`)**: Validates product creation, duplicate SKU rejection, non-negative price/stock validation, and low-stock filters.
4. **Inventory Movements (`node utils/test-batch3.js`)**: Tests Stock IN, Stock OUT, negative stock prevention, and movement audit creation.
5. **Sales Challans & Atomicity (`node utils/test-batch3.js`)**: Validates Draft challans (no stock impact), product snapshots preservation across catalog changes, atomic multi-item stock deduction upon confirmation, and zero partial deduction on inventory shortage.
6. **Full System End-to-End (`node utils/test-batch4.js`)**: Verifies the complete 21-step enterprise workflow across all modules.
7. **Complete QA Suite (`node utils/test-full-qa.js`)**: Verifies all edge cases, role boundary enforcement, and data sanitization.
8. **Postman API Suite**: Complete collection exported and verified in `postman/Mini_ERP_CRM.postman_collection.json`.

---

## 16. Deployment / Submission Links

* **GitHub Repository**: [https://github.com/callsydeepu/-CRM-Operations.git](https://github.com/callsydeepu/-CRM-Operations.git)
* **Local Frontend**: `http://localhost:5173`
* **Local Backend API**: `http://localhost:5000`
* **Postman Collection File**: `postman/Mini_ERP_CRM.postman_collection.json`
