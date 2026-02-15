# API Testing Guide

## Quick Start

### 1. Start Services

```bash
# Start MongoDB
docker compose up -d

# Start API
pnpm start:api
```

API will be available at: `http://localhost:3000`

---

## Postman Collection

Import `cloudflare-bot-api.postman_collection.json` into Postman.

### Collection Variables

Before testing, update these variables:
- `base_url`: `http://localhost:3000` (default)
- `api_auth_token`: Your `API_AUTH_TOKEN` from `.env`

---

## Endpoints

### 1. Health Check
```bash
curl http://localhost:3000/health
```

**Expected Response:**
```json
{
  "status": "ok",
  "timestamp": "2026-02-15T10:50:00.000Z"
}
```

---

### 2. Webhook Endpoints

#### Check Status
```bash
curl http://localhost:3000/api/webhook
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Webhook endpoint is alive"
}
```

#### Send Webhook
```bash
curl -X POST http://localhost:3000/api/webhook \
  -H "Content-Type: application/json" \
  -d '{
    "event": "test",
    "data": {
      "message": "Test webhook"
    }
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Webhook received"
}
```

---

### 3. User Management (Auth Required)

**Set your auth token:**
```bash
export API_TOKEN="your_jwt_secret_here"
```

#### Add User
```bash
curl -X POST http://localhost:3000/api/users \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $API_TOKEN" \
  -d '{
    "telegramId": 123456789,
    "username": "john_doe"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "user_123456789",
    "telegramId": 123456789,
    "username": "john_doe",
    "isAllowed": true,
    "createdAt": "2026-02-15T10:50:00.000Z"
  }
}
```

#### List Users
```bash
curl http://localhost:3000/api/users \
  -H "Authorization: Bearer $API_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "user_123456789",
      "telegramId": 123456789,
      "username": "john_doe",
      "isAllowed": true,
      "createdAt": "2026-02-15T10:50:00.000Z"
    }
  ]
}
```

#### Remove User
```bash
curl -X DELETE http://localhost:3000/api/users/123456789 \
  -H "Authorization: Bearer $API_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "message": "User removed"
}
```

---

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Missing or invalid authorization header"
}
```

### 400 Bad Request
```json
{
  "success": false,
  "message": "Validation error message"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Internal server error"
}
```

---

## Testing Workflow

1. **Start API:**
   ```bash
   pnpm start:api
   ```

2. **Test Health:**
   ```bash
   curl http://localhost:3000/health
   ```

3. **Add User:**
   ```bash
   curl -X POST http://localhost:3000/api/users \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer your_jwt_secret_here" \
     -d '{"telegramId": 453712120, "username": "admin"}'
   ```

4. **List Users:**
   ```bash
   curl http://localhost:3000/api/users \
     -H "Authorization: Bearer your_jwt_secret_here"
   ```

5. **Test Webhook:**
   ```bash
   curl -X POST http://localhost:3000/api/webhook \
     -H "Content-Type: application/json" \
     -d '{"event": "test"}'
   ```

---

## Environment Variables

Required in `.env`:
```bash
MONGODB_URI=mongodb://admin:secret@localhost:27017/cloudflare_bot?authSource=admin
API_AUTH_TOKEN=your_jwt_secret_here
API_PORT=3000
TELEGRAM_BOT_TOKEN=your_bot_token
ALLOWED_CHAT_ID=453712120
```

---

## Logs

API logs are written to:
- `logs/combined.log` - all logs
- `logs/error.log` - errors only

Check logs in real-time:
```bash
tail -f logs/combined.log
```
