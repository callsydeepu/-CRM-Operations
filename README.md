# Mini ERP + CRM Operations Portal

## 1. Project Overview

The **Mini ERP + CRM Operations Portal** is a full-stack web application designed for enterprise resource planning and customer relationship management. It enables businesses to manage their daily operations through a single unified interface:
- Capturing and tracking leads, managing customer profiles, and scheduling follow-up interactions.
- Maintaining an active product catalog with categories, unit prices, minimum stock alert levels, and warehouse storage locations.
- Performing transactional stock adjustments (Stock IN and Stock OUT) with a real-time movement audit log.
- Creating multi-item sales delivery challans with historical price snapshots and atomic inventory deductions upon confirmation.
- Providing an executive dashboard displaying key operational metrics, recent challan feeds, and low-stock alerts.

---

## 2. Features

* **Authentication and Roles**: Secure token-based access supporting four distinct operational roles (`Admin`, `Sales`, `Warehouse`, and `Accounts`) with role-protected endpoints.
* **Customer CRM**: Complete customer lifecycle management (lead tracking, customer type categorization, GST registration, address/contact details, search, filtering, pagination, and follow-up scheduling with interaction notes).
* **Product Management**: SKU tracking, category classification, price definitions, minimum stock alert thresholds, warehouse bin/rack locations, and low-stock filtering.
* **Inventory / Stock Movements**: Transactional Stock IN (procurement/returns) and Stock OUT (dispatch/scrap) operations with atomic database balance updates and full audit logs.
* **Sales Challans**: Multi-item delivery challan generation with frozen product snapshots (`product_name_snapshot`, `sku_snapshot`, `unit_price_snapshot`), Draft preservation without inventory impact, atomic confirmation with strict stock validation, and cancellation support.
* **Dashboard**: Real-time KPI summary widgets (Total Customers, Total Products, Low Stock Items, Draft Challans, Confirmed Challans), recent delivery feed, and low-stock alert monitoring.

---

## 3. Tech Stack

### Frontend
* **React** (v18.2.0)
* **JavaScript** (ES6+)
* **HTML5** & **CSS3** (Custom Design System based on Google Stitch UI specifications)
* **Vite** (Build tool & local development server)
* **React Router DOM** (Client-side routing)
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
│   └── vite.config.js       # Vite configuration
├── database/
│   ├── schema.sql           # Complete MySQL DDL table definitions
│   └── seed.sql             # Database initialization template
├── postman/
│   └── Mini_ERP_CRM.postman_collection.json # Complete Postman API collection
├── .gitignore               # Ignored dependencies, build artifacts, and secrets
└── README.md                # System documentation
```

---

## 5. Local Setup

### Prerequisites
Make sure you have the following installed on your machine:
* **Node.js** (v18.0.0 or higher)
* **npm** (Node Package Manager)
* **MySQL Server** (v8.0 or higher)

### Setup Steps
1. Clone the repository:
   ```bash
   git clone https://github.com/callsydeepu/-CRM-Operations.git
   cd -CRM-Operations
   ```
2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

---

## 6. Environment Variables

### Backend (`backend/.env`)
Create a `.env` file in the `backend/` directory using the template provided at `backend/.env.example`.

```env
# Server Configuration
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173

# Database Configuration (MySQL)
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_local_mysql_password
DB_NAME=mini_erp_crm

# JWT Configuration
JWT_SECRET=your_local_jwt_secret_key
JWT_EXPIRES_IN=24h
```

| Variable | Description |
|---|---|
| `PORT` | Local port the Express server listens on (default: `5000`). |
| `NODE_ENV` | Environment mode (`development`). |
| `CLIENT_URL` | Local frontend origin for CORS (`http://localhost:5173`). |
| `DB_HOST` | MySQL host (`localhost`). |
| `DB_PORT` | MySQL port (`3306`). |
| `DB_USER` | Local MySQL username (e.g., `root`). |
| `DB_PASSWORD` | Password for your local MySQL user. |
| `DB_NAME` | Database name (`mini_erp_crm`). |
| `JWT_SECRET` | Secret key used to sign JSON Web Tokens locally. |
| `JWT_EXPIRES_IN` | Token expiration duration (default: `24h`). |

### Frontend (`frontend/.env`)
Create an optional `.env` file in the `frontend/` directory (template at `frontend/.env.example`):

```env
VITE_API_URL=http://localhost:5000/api
```

> **Security Note:** `.env` files contain sensitive local credentials and are excluded from Git via `.gitignore`.

---

## 7. Database Setup

1. Start your local MySQL service.
2. Open MySQL CLI:
   ```bash
   mysql -u root -p
   ```
3. Run the schema file to create the database and all tables:
   ```sql
   source database/schema.sql;
   ```
4. Alternatively, initialize the database tables using the project script:
   ```bash
   cd backend
   npm run seed
   ```

---

## 8. Running the Backend

From the `backend/` directory, start the Express API server:

```bash
cd backend
node server.js
```

* The backend server will start and listen at **`http://localhost:5000`**.
* Health check endpoint: `http://localhost:5000/api/health`

---

## 9. Running the Frontend

From the `frontend/` directory, start the Vite development server:

```bash
cd frontend
npm run dev
```

* The frontend application will start and be available at **`http://localhost:5173`**.
* Open your browser and navigate to **`http://localhost:5173`**.

---

## 10. API Documentation / Postman

A complete Postman collection is included in the project at:
📁 `postman/Mini_ERP_CRM.postman_collection.json`

To test all endpoints:
1. Open **Postman** and click **Import**.
2. Select `postman/Mini_ERP_CRM.postman_collection.json`.
3. The collection is organized into 6 folders:
   - **1. Authentication**: `POST /register`, `POST /login`, `GET /me` *(automatically saves JWT token to collection variables)*.
   - **2. Customers**: `GET /customers`, `GET /:id`, `POST /`, `PUT /:id`, `POST /:id/followup`.
   - **3. Products**: `GET /products`, `GET /:id`, `POST /`, `PUT /:id`.
   - **4. Inventory**: `GET /movements`, `POST /stock-in`, `POST /stock-out`.
   - **5. Sales Challans**: `GET /challans`, `GET /:id`, `POST /`, `PUT /:id`, `POST /:id/confirm`, `POST /:id/cancel`.
   - **6. Dashboard**: `GET /dashboard`.

---

## 11. Test Credentials

The portal implements role-based access control supporting four roles:

| Role | Permissions Summary |
|---|---|
| **Admin** | Full system access across all modules (Customers, Products, Inventory, Challans, Dashboard). |
| **Sales** | Full access to Customer CRM and Sales Challan creation/confirmation; read-only access to products and movements. |
| **Warehouse** | Full access to Product catalog management and direct Stock IN / Stock OUT operations; read-only access to customers and challans. |
| **Accounts** | Read-only access across all records and reporting metrics. |

### Registering Test Accounts
The database starts clean with zero pre-seeded records. You can register test accounts for any role directly from the login screen by clicking **"Don't have an account? Register"** or via the API:

```json
POST /api/auth/register
{
  "name": "Local Admin",
  "email": "admin@mycompany.com",
  "password": "Password123!",
  "role": "Admin"
}
```

---

## 12. Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React Client (Vite)                      │
│     (State, UI Components, Context API, Axios Client)       │
└──────────────────────────────┬──────────────────────────────┘
                               │ HTTP / JSON (Port 5173 -> 5000)
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
1. **Authentication**: Validates user credentials, issues signed JWTs, and enforces role authorization on protected endpoints.
2. **Customer CRM**: Manages client profiles, wholesale/retail categorization, and schedules follow-up interactions.
3. **Product Management**: Maintains catalog master data, unique SKU validation, and minimum stock alert levels.
4. **Inventory**: Executes transactional Stock IN and Stock OUT operations with strict non-negative stock validation.
5. **Sales Challans**: Handles multi-item draft creation with price snapshotting and atomic stock reduction upon confirmation.
6. **Dashboard**: Directly queries MySQL tables for live aggregate counts and low-stock alerts.

---

## 13. Assumptions

1. **Database Engine**: MySQL with InnoDB was used to ensure ACID transaction support (`START TRANSACTION`, `COMMIT`, `ROLLBACK`) and row locking (`FOR UPDATE`) during challan confirmation.
2. **Role Boundaries**: Standard enterprise separation of concerns was applied where permissions were not explicitly detailed in the PDF:
   - `Sales` manages CRM and challans, but cannot perform direct warehouse adjustments.
   - `Warehouse` manages product master entries and physical stock IN/OUT, but cannot create customer accounts or sales challans.
   - `Accounts` has read-only visibility across all modules.
3. **Challan Numbering**: Automatically generated sequentially (`CH-YYYY-XXXXXX`) to ensure unique dispatch tracking.
4. **Local Evaluation**: This project is submitted for local execution and GitHub evaluation; cloud deployment is not part of this submission.

---

## 14. Known Limitations

* **All features specified in the Case Study PDF are 100% complete and verified locally.**
* PDF invoice exports, third-party cloud file storage (S3), containerization (Docker), CI/CD pipelines, and payment processing were out-of-scope for this phase and were intentionally omitted in accordance with the project instructions.

---

## 15. Testing

The project includes an automated test battery with **102/102 passing tests**:

* **Batch 1 (Auth & Health)**: `node utils/test.js` — 15/15 tests passing.
* **Batch 2 (CRM & Products)**: `node utils/test-batch2.js` — 24/24 tests passing.
* **Batch 3 (Inventory & Challans)**: `node utils/test-batch3.js` — 13/13 tests passing.
* **Batch 4 (Full E2E Integration)**: `node utils/test-batch4.js` — 21/21 tests passing.
* **Batch 5 (Complete QA & Edge Cases)**: `node utils/test-full-qa.js` — 29/29 tests passing.
* **Frontend Production Build**: `npm run build` (`npx vite build`) compiles with 0 errors.

To run the complete test suite locally:
```bash
cd backend
node utils/test-full-qa.js
```
