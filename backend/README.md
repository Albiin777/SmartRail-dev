# SmartRail Backend Setup Guide

## Prerequisites
- Node.js (v18 or higher)
- npm or yarn
- Supabase account

## Setup Instructions

### 1. Supabase Configuration

1. Go to [https://supabase.com](https://supabase.com) and create a new project
2. Once created, go to **Project Settings** → **API**
3. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key**
   - **service_role key** (keep this secret!)

### 2. Email Configuration (Supabase)

1. In Supabase Dashboard, go to **Authentication** → **Email Templates**
2. Customize your email templates if needed
3. Go to **Authentication** → **Providers** → **Email**
4. Enable **Email provider**
5. Configure **Email OTP** settings

### 3. SMS/Phone Configuration (Supabase)

1. Go to **Authentication** → **Providers** → **Phone**
2. Enable **Phone provider**
3. Choose an SMS provider (Twilio recommended):
   - Sign up for [Twilio](https://www.twilio.com)
   - Get your Account SID and Auth Token
   - Get a Twilio phone number
4. Add Twilio credentials in Supabase Phone settings

### 4. Backend Installation

```bash
cd backend
npm install
```

### 5. Environment Variables

Create a `.env` file in the `backend` directory:

```env
# Supabase Configuration
SUPABASE_URL=https://xxxxx.supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# JWT Secret (generate a strong random string)
JWT_SECRET=your_very_secure_random_string_here

# Server Configuration
PORT=5000
NODE_ENV=development

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### 6. Frontend Installation

```bash
cd frontend
npm install @supabase/supabase-js
```

Create a `.env` file in the `frontend` directory:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
VITE_API_URL=http://localhost:5000
```

### 7. Start the Servers

**Backend:**
```bash
cd backend
npm run dev
```

**Frontend:**
```bash
cd frontend
npm run dev
```

## API Endpoints

### Authentication

- `POST /api/auth/signup-email` - Sign up with email
- `POST /api/auth/verify-email-otp` - Verify email OTP
- `POST /api/auth/signup-phone` - Sign up with phone
- `POST /api/auth/verify-phone-otp` - Verify phone OTP
- `POST /api/auth/login-email` - Login with email/password
- `POST /api/auth/login-phone` - Login with phone (sends OTP)
- `POST /api/auth/resend-otp` - Resend OTP
- `POST /api/auth/logout` - Logout (protected)
- `GET /api/auth/profile` - Get user profile (protected)

## Testing

### Test Email Signup:
```bash
curl -X POST http://localhost:5000/api/auth/signup-email \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "SecurePass123!",
    "fullName": "Test User"
  }'
```

### Test Email Verification:
```bash
curl -X POST http://localhost:5000/api/auth/verify-email-otp \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "token": "123456"
  }'
```

## Security Notes

- Never commit `.env` files to version control
- Keep `SUPABASE_SERVICE_ROLE_KEY` secret
- Use strong JWT secrets in production
- Enable Row Level Security (RLS) in Supabase for database tables
- Use HTTPS in production

## Troubleshooting

### OTP not received?
- Check Supabase email/SMS provider settings
- Verify Twilio credentials (for SMS)
- Check spam folder (for email)

### CORS errors?
- Ensure `FRONTEND_URL` in backend `.env` matches your frontend URL
- Check CORS configuration in `server.js`

### Authentication errors?
- Verify Supabase keys are correct
- Check JWT_SECRET is set
- Ensure user is verified before login
