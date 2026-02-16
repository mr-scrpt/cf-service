# Environment Setup Guide

## Create .env.local file

Create a file named `.env.local` in `/packages/web/` directory with the following content:

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3000

# Admin Credentials (change these!)
ADMIN_USERNAME=admin
ADMIN_PASSWORD=secure_password_123

# Session Secret (must be at least 32 characters)
SESSION_SECRET=change-this-to-a-random-secret-at-least-32-characters-long
```

## Important Notes

1. **NEXT_PUBLIC_API_URL** - URL of your API server (default: http://localhost:3000)
2. **ADMIN_USERNAME** - Username for admin login (min 3 characters)
3. **ADMIN_PASSWORD** - Password for admin login (min 6 characters)
4. **SESSION_SECRET** - Random secret key (min 32 characters)

## Validation

The app uses Zod to validate environment variables on startup. If any variable is missing or invalid, you'll see an error message in the console.

## Security

⚠️ **Never commit `.env.local` to git!** It's already in `.gitignore`.

For production, use proper environment variable management (Vercel, Railway, etc.)
