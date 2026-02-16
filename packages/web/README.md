# Cloudflare Bot Admin Panel

Next.js admin panel for managing Cloudflare Bot users and registration requests.

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **UI Library:** Ant Design 6
- **State Management:** TanStack Query 5
- **Validation:** Zod 4
- **HTTP Client:** Axios 1
- **Architecture:** Feature-Sliced Design (FSD)

## Setup

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment

Create `.env.local` file in the root:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000

# Admin Credentials (used for login)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=secure_password_123

# Session Secret (min 32 characters)
SESSION_SECRET=your-secret-key-here-change-this-min-32-chars-long
```

### 3. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3001](http://localhost:3001)

## Features

### 🔐 Authentication
- Login with credentials from `.env.local`
- Simple cookie-based session
- Protected routes via middleware

### 📊 Dashboard
- **Health Indicator** - Real-time API status (auto-refresh every 30s)
- **Users Table** - View and remove allowed users
- **Registration Requests** - Approve/reject pending requests
- **Test Notifications** - Send test notifications to Telegram

### 🔄 Auto-Refresh
- Users and requests refresh every 30 seconds
- Health check updates every 30 seconds

## Project Structure (FSD)

```
web/
├── app/                    # Next.js App Router
│   ├── layout.tsx         # Root layout with providers
│   ├── page.tsx           # Redirect to login
│   ├── login/
│   └── dashboard/
├── widgets/               # Complex UI blocks
│   ├── health-indicator/
│   ├── users-table/
│   ├── registration-requests-table/
│   └── notification-sender/
├── features/              # User actions
│   └── auth/login/
├── shared/                # Shared utilities
│   ├── api/              # API client and endpoints
│   ├── config/           # Env validation, constants
│   └── lib/              # React Query, auth helpers
└── middleware.ts          # Auth protection
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/health` | GET | Health check |
| `/api/users` | GET | List users |
| `/api/users/:telegramId` | DELETE | Remove user |
| `/api/registration-requests/pending` | GET | List pending requests |
| `/api/registration-requests/:id/approve` | POST | Approve request |
| `/api/registration-requests/:id/reject` | POST | Reject request |
| `/api/notify` | POST | Send test notification |

## Build

```bash
pnpm build
pnpm start
```

## Notes

- Make sure API server is running on `http://localhost:3000`
- Default credentials are in `.env.local`
- Health check will show "offline" if API is not available
