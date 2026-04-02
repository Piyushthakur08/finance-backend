# Finance Data Processing and Access Control Backend

A RESTful backend for managing financial records (income/expenses) with role-based access control, dashboard summaries, and data filtering. Built with Node.js, Express, and MongoDB.

---

## Table of Contents

- [Architecture Overview](#architecture-overview)
- [Setup](#setup)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Roles and Access Control](#roles-and-access-control)
- [Design Decisions](#design-decisions)
- [Assumptions](#assumptions)
- [Tradeoffs](#tradeoffs)

---

## Architecture Overview

The project follows a layered architecture pattern:

```
Routes → Middleware → Controllers → Services → Models (MongoDB)
```

- **Routes** define the HTTP endpoints and attach the right middleware.
- **Middleware** handles authentication (JWT), authorization (role-based permissions), input validation, and error handling.
- **Controllers** parse the request and call the appropriate service.
- **Services** contain the actual business logic and database queries.
- **Models** define the data schema using Mongoose and include any model-level hooks or validations.

This separation keeps each layer focused on one concern, making it easier to test and modify individual parts without breaking others.

---

## Setup

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (v6 or higher) running locally, or a MongoDB Atlas connection string

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd finance-backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env and set your MongoDB URI and JWT secret

# Seed the database with sample data
npm run seed

# Start the server
npm start
```

The server starts on `http://localhost:3000` by default.

### Seed Data

Running `npm run seed` populates the database with:

| User           | Email                | Password    | Role    |
|----------------|----------------------|-------------|---------|
| Rahul Sharma   | admin@example.com    | admin123    | admin   |
| Priya Patel    | analyst@example.com  | analyst123  | analyst |
| Amit Kumar     | viewer@example.com   | viewer123   | viewer  |

It also creates ~25 sample financial records across multiple categories and months.

---

## Project Structure

```
finance-backend/
├── src/
│   ├── app.js                    # Express app setup and server start
│   ├── config/
│   │   ├── database.js           # MongoDB connection
│   │   └── constants.js          # Roles, permissions, categories
│   ├── controllers/
│   │   ├── authController.js     # Register, login, profile
│   │   ├── userController.js     # User CRUD
│   │   ├── recordController.js   # Financial record CRUD
│   │   └── summaryController.js  # Dashboard aggregations
│   ├── middleware/
│   │   ├── authenticate.js       # JWT token verification
│   │   ├── authorize.js          # Permission checking
│   │   └── errorHandler.js       # Global error formatting
│   ├── models/
│   │   ├── User.js               # User schema
│   │   └── Record.js             # Financial record schema
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── userRoutes.js
│   │   ├── recordRoutes.js
│   │   └── summaryRoutes.js
│   ├── services/
│   │   ├── authService.js        # Auth business logic
│   │   ├── userService.js        # User management logic
│   │   ├── recordService.js      # Record CRUD logic
│   │   └── summaryService.js     # Aggregation pipelines
│   ├── utils/
│   │   ├── AppError.js           # Custom error class
│   │   ├── catchAsync.js         # Async error wrapper
│   │   ├── pagination.js         # Pagination helpers
│   │   └── seed.js               # Database seeder
│   └── validators/
│       └── inputValidators.js    # Request body validation
├── tests/
│   └── api.test.js               # Integration tests
├── .env.example
├── .gitignore
├── package.json
└── README.md
```

---

## API Documentation

All endpoints return JSON. Authenticated endpoints require an `Authorization: Bearer <token>` header.

### Authentication

#### POST `/api/auth/register`
Create a new user account.

**Request body:**
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123",
  "role": "analyst"
}
```

**Response (201):**
```json
{
  "success": true,
  "message": "Account created successfully.",
  "data": {
    "user": {
      "_id": "...",
      "name": "Jane Doe",
      "email": "jane@example.com",
      "role": "analyst",
      "isActive": true,
      "createdAt": "..."
    },
    "token": "eyJhbGciOi..."
  }
}
```

#### POST `/api/auth/login`
Log in with email and password.

**Request body:**
```json
{
  "email": "admin@example.com",
  "password": "admin123"
}
```

#### GET `/api/auth/profile`
Get the currently authenticated user's details. Requires token.

---

### Users (Admin only)

#### GET `/api/users`
List all users. Supports query params: `page`, `limit`, `role`, `isActive`, `search`.

**Example:** `GET /api/users?role=analyst&page=1&limit=10`

#### GET `/api/users/:id`
Get a single user by ID.

#### PATCH `/api/users/:id`
Update user details (name, email, role, isActive). Password changes are blocked through this endpoint for security.

#### DELETE `/api/users/:id`
Deactivate a user (soft delete — sets `isActive` to false). Admins cannot deactivate themselves.

---

### Financial Records (Admin: full access, Analyst: read-only)

#### POST `/api/records`
Create a new financial record.

**Request body:**
```json
{
  "amount": 5000,
  "type": "expense",
  "category": "rent",
  "date": "2024-03-01",
  "description": "March apartment rent"
}
```

**Valid types:** `income`, `expense`

**Valid categories:** `salary`, `freelance`, `investment`, `rent`, `utilities`, `groceries`, `transportation`, `entertainment`, `healthcare`, `education`, `other`

#### GET `/api/records`
List records with filtering and pagination.

**Query params:**
| Param       | Description                              | Example            |
|-------------|------------------------------------------|--------------------|
| `type`      | Filter by income or expense              | `type=expense`     |
| `category`  | Filter by category                       | `category=rent`    |
| `startDate` | Records on or after this date            | `startDate=2024-01-01` |
| `endDate`   | Records on or before this date           | `endDate=2024-03-31`   |
| `search`    | Search in description field              | `search=salary`    |
| `sortBy`    | Sort by field (amount, date, category)   | `sortBy=amount`    |
| `sortOrder` | Sort direction                           | `sortOrder=asc`    |
| `page`      | Page number (default: 1)                 | `page=2`           |
| `limit`     | Items per page (default: 20, max: 100)   | `limit=10`         |

**Example:** `GET /api/records?type=expense&category=rent&startDate=2024-01-01&page=1&limit=10`

#### GET `/api/records/:id`
Get a single record by ID.

#### PATCH `/api/records/:id`
Update a record's fields.

#### DELETE `/api/records/:id`
Soft delete a record (sets `isDeleted` to true). The record is preserved in the database but excluded from normal queries.

---

### Dashboard Summaries (All authenticated roles)

#### GET `/api/summary/overview`
Returns total income, total expenses, net balance, and record count. Supports `startDate` and `endDate` filters.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalIncome": 190000,
    "totalExpenses": 98000,
    "netBalance": 92000,
    "recordCount": 25
  }
}
```

#### GET `/api/summary/categories`
Returns totals grouped by category and type. Supports `type`, `startDate`, `endDate` filters.

#### GET `/api/summary/trends`
Returns monthly income/expense trends. Defaults to the last 12 months. Supports `startDate`, `endDate` filters.

#### GET `/api/summary/recent`
Returns the most recent records. Supports `limit` param (default: 10).

---

## Roles and Access Control

The system uses a permission-based approach. Each role has a set of allowed actions:

| Action          | Viewer | Analyst | Admin |
|-----------------|--------|---------|-------|
| View summaries  | ✓      | ✓       | ✓     |
| View records    |        | ✓       | ✓     |
| Create records  |        |         | ✓     |
| Update records  |        |         | ✓     |
| Delete records  |        |         | ✓     |
| Manage users    |        |         | ✓     |

Access control is enforced in two layers:

1. **Authentication middleware** (`authenticate.js`) — Verifies the JWT token and loads the user. Rejects expired or invalid tokens.
2. **Authorization middleware** (`authorize.js`) — Checks the user's role against the required permissions for the endpoint. Returns 403 if the role doesn't have access.

This two-layer approach means a valid token alone isn't enough — the user must also have the right permissions.

---

## Design Decisions

**Why MongoDB?**
Financial records have a fairly flat structure, and MongoDB's aggregation pipeline handles the summary calculations efficiently without needing complex joins. The flexible schema also makes it easier to add new record fields down the line.

**Why JWT over sessions?**
JWTs keep the server stateless. There's no session store to manage, which simplifies deployment and horizontal scaling. The tradeoff is that tokens can't be invalidated server-side (short of maintaining a blacklist), but for this project scope, a 24-hour expiry is a reasonable balance.

**Soft deletes on records:**
Financial records shouldn't just disappear. The `isDeleted` flag preserves data integrity while hiding deleted records from normal queries via a Mongoose query middleware.

**Validation at two levels:**
Input validation happens first in the validator middleware (clear, early error messages), then again at the Mongoose schema level (as a safety net). This way, bad data is caught before it even reaches the service layer.

**Service layer separation:**
Controllers don't talk to the database directly. All business logic lives in services. This makes it straightforward to reuse logic (e.g., the summary service could be called from a scheduled job or a different controller) and keeps controllers thin.

**Aggregation for summaries:**
The dashboard endpoints use MongoDB's aggregation pipeline rather than pulling all records into memory and computing totals in JavaScript. This is significantly more efficient, especially as the dataset grows.

---

## Assumptions

1. **Registration is open:** Any user can register with any role. In a production system, only admins would assign roles — this is simplified for demo purposes.
2. **Single currency:** All amounts are treated as a single currency. There's no currency field or conversion logic.
3. **Date handling:** Dates are stored in UTC. The API accepts ISO date strings and any format that JavaScript's `Date` constructor can parse.
4. **No file uploads:** The system only handles structured JSON data, not receipts or documents.
5. **Password reset:** Not implemented. In production, this would involve email verification.

---

## Tradeoffs

| Decision                         | Benefit                              | Tradeoff                                     |
|----------------------------------|--------------------------------------|----------------------------------------------|
| JWT (no refresh tokens)          | Simpler implementation               | Can't revoke tokens before expiry            |
| Soft delete                      | Data preservation                    | Slightly more complex queries                |
| Open registration with roles     | Easy to test all roles               | Not secure for production                    |
| No request caching               | Always fresh data                    | Higher DB load on repeated requests          |
| Single validation library (none) | No extra dependency, full control    | More manual validation code to maintain      |

---

## Running Tests

```bash
# Make sure MongoDB is running and the server is started
npm start

# In another terminal
npm test
```

The tests cover authentication flow, role-based access control, and input validation. They run against the live server, so they need both MongoDB and the Express server to be up.

---

## Error Response Format

All errors follow this structure:

```json
{
  "success": false,
  "error": "Human-readable error message"
}
```

Common status codes used:

| Code | Meaning                                     |
|------|---------------------------------------------|
| 400  | Bad request / validation error              |
| 401  | Authentication required or invalid token    |
| 403  | Insufficient permissions                    |
| 404  | Resource not found                          |
| 409  | Conflict (e.g., duplicate email)            |
| 429  | Rate limit exceeded                         |
| 500  | Unexpected server error                     |
