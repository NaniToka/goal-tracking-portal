# Employee Goal Setting & Tracking Portal

Production-ready full-stack portal for goal planning, manager approvals, quarterly tracking, reporting, and audit logging.

## Architecture

```
goal-tracking-portal/
├── client/                 # React (Vite) + Tailwind
│   ├── src/
│   │   ├── components/     # Reusable UI components (Button, Input, Select, Modal, Card, Badge, EmptyState)
│   │   ├── pages/          # Auth pages (Login, error pages)
│   │   ├── layouts/        # Shell + Sidebar with user info
│   │   ├── dashboard/      # Role dashboards
│   │   │   ├── employee/  # GoalSheet, Achievements, EmployeeDashboard
│   │   │   ├── manager/   # TeamGoals, ManagerDashboard
│   │   │   └── admin/     # UserManagement, CompletionTracking, AuditLogs, AdminDashboard
│   │   ├── context/        # AuthContext with JWT management
│   │   ├── services/       # Axios API layer with interceptors
│   │   ├── hooks/          # useAuth
│   │   ├── utils/          # Validation helpers
│   │   └── routes/         # AppRoutes, ProtectedRoute, role-based redirects
│   ├── vercel.json         # Vercel deployment config
│   └── package.json
│
├── server/                 # Express + Mongoose
│   ├── controllers/        # auth, goals, manager, admin, report
│   ├── models/             # User, GoalSheet, AuditLog, RefreshToken
│   ├── routes/             # API route definitions
│   ├── middleware/         # JWT auth, RBAC, error handler, audit logger
│   ├── config/             # MongoDB connection
│   ├── utils/              # Progress calculator, goal validation, JWT, async handler
│   ├── seed/               # Demo data script
│   ├── server.js           # Express app with CORS
│   ├── render.yaml         # Render deployment config
│   └── package.json
│
├── DEPLOYMENT.md           # Detailed deployment guide
├── package.json            # Root scripts (dev both apps)
└── README.md
```

### Data flow

```
React (Vercel)  →  JWT REST API (Render)  →  MongoDB Atlas
```

### Technology Stack

**Frontend:**
- React 18 with Vite
- React Router DOM v6 for routing
- Tailwind CSS for styling
- Axios for API calls with interceptors
- React Hot Toast for notifications
- Context API for authentication state

**Backend:**
- Node.js with Express
- MongoDB with Mongoose ODM
- JWT (access + refresh tokens) for authentication
- bcryptjs for password hashing
- Role-based access control (RBAC)

**Deployment:**
- Vercel for frontend
- Render for backend
- MongoDB Atlas for database

### Roles & Permissions

| Role | Access |
|------|--------|
| Employee | Create/edit goal sheets, submit for approval, update quarterly achievements |
| Manager | View team goals, approve/reject/rework, inline edit targets, add comments |
| Admin | Manage users, unlock approved goals, view audit logs, organization-wide reports |

### Goal Validation Rules

- Total weightage must equal 100%
- Minimum weightage per goal: 10%
- Maximum goals per sheet: 8
- Goal title: minimum 5 characters
- Goal description: maximum 1000 characters

### Progress Calculation Formulas

| Unit Type | Formula |
|-----------|---------|
| Numeric / Percentage | `Achievement ÷ Target × 100` (capped at 100) |
| Timeline | On-time completion vs deadline comparison |
| Zero-based | Achievement = 0 → 100%, else 0% |

### Workflow States

```
draft → submitted → approved → (locked)
                  ↘ rejected
                  ↘ rework → submitted
```

---

## Quick start

### Prerequisites

- Node.js 18+
- MongoDB Atlas connection string

### Install

```bash
# From project root
npm install
npm run install:all

# Or separately
cd server && npm install
cd client && npm install
```

### Environment

**server/.env**
```env
PORT=5000
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret
JWT_REFRESH_EXPIRES_IN=30d
JWT_REFRESH_DAYS=30
CLIENT_URL=http://localhost:5173
```

**client/.env**
```env
VITE_API_URL=http://localhost:5000/api
```

### Seed & run

```bash
npm run seed          # Demo users + sample goals
npm run dev           # Starts server + client
# Or: npm run dev:server | npm run dev:client
```

- Frontend: http://localhost:5173  
- API: http://localhost:5000/api  

---

## Demo accounts

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@company.com | Demo@123 |
| Manager | manager@company.com | Demo@123 |
| Employee | employee@company.com | Demo@123 |

---

## Features

### Employee Features
- **Goal Sheet Management**: Create, edit, and submit goal sheets with dynamic inputs
- **Validation**: Real-time validation for weightage (100% total), minimum 10% per goal, max 8 goals
- **Quarterly Achievements**: Update actual achievements and status per quarter
- **Progress Tracking**: Automatic progress calculation based on unit type
- **Status Tracking**: View goal sheet status (draft, submitted, approved, rejected, rework)

### Manager Features
- **Team Goals View**: View all team member goal sheets
- **Approval Workflow**: Approve, reject, or return for rework with comments
- **Inline Editing**: Edit target and weightage for submitted goals
- **Comments System**: Add check-in comments on approved goals
- **Progress Monitoring**: View team progress and planned vs actual

### Admin Features
- **User Management**: Create, deactivate users with role assignment
- **Unlock Goals**: Unlock approved goals for editing
- **Audit Logs**: View all changes with timestamps and user info
- **Organization Reports**: Department-wise progress, achievement status distribution
- **Export**: Download reports in CSV or Excel format

### Common Features
- **Authentication**: JWT-based auth with refresh tokens
- **Role-Based Access**: Automatic redirects based on user role
- **Toast Notifications**: Success/error feedback for all actions
- **Responsive Design**: Mobile-friendly UI with Tailwind CSS
- **Loading States**: Loading spinners and skeletons
- **Error Handling**: Comprehensive error pages (404, 500)

---

## Deployment

### MongoDB Atlas

Create cluster → database user → network access → copy `MONGODB_URI`.

### Backend (Render)

- Root directory: `server`
- Build: `npm install` · Start: `npm start`
- Env: `MONGODB_URI`, `JWT_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_URL`, `NODE_ENV=production`
- Run seed once in shell: `npm run seed`

### Frontend (Vercel)

- Root directory: `client`
- Env: `VITE_API_URL=https://your-api.onrender.com/api`

For detailed deployment instructions, see [DEPLOYMENT.md](./DEPLOYMENT.md).

---

## API overview

### Authentication (`/api/auth`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/login` | Public | Returns `accessToken`, `refreshToken`, `user` |
| POST | `/refresh` | Public | Body: `{ refreshToken }` — rotate tokens |
| POST | `/logout` | Bearer | Revoke refresh token |
| GET | `/me` | Bearer | Current user |
| POST | `/verify` | Bearer | Validate access token |
| PUT | `/change-password` | Bearer | Change password |
| GET | `/sessions` | Bearer | Active refresh sessions |

### Goals (`/api/goals`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/my-sheet` | Employee | Get my goal sheet |
| PUT | `/my-sheet` | Employee | Update goal sheet |
| POST | `/submit` | Employee | Submit for approval |
| PUT | `/achievement` | Employee | Update quarterly achievement |
| GET | `/dashboard` | Employee | Get dashboard stats |

### Manager (`/api/manager`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/team-goals` | Manager | Get team goal sheets |
| POST | `/approve/:id` | Manager | Approve goal sheet |
| POST | `/reject/:id` | Manager | Reject goal sheet |
| POST | `/rework/:id` | Manager | Return for rework |
| PUT | `/edit-goals/:id` | Manager | Inline edit goals |
| POST | `/comment` | Manager | Add check-in comment |
| GET | `/dashboard` | Manager | Get manager dashboard |

### Admin (`/api/admin`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/dashboard` | Admin | Get admin dashboard |
| GET | `/users` | Admin | Get all users |
| POST | `/users` | Admin | Create user |
| PUT | `/users/:id` | Admin | Update user |
| DELETE | `/users/:id` | Admin | Deactivate user |
| PUT | `/goals/:id/unlock` | Admin | Unlock goal sheet |
| GET | `/audit-logs` | Admin | Get audit logs |

### Reports (`/api/reports`)

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/analytics` | Manager/Admin | Get analytics data |
| GET | `/export` | All* | Export CSV/XLSX report |

---

## License

MIT
