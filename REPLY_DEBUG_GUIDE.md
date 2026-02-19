# Debugging "Failed, no complaints or access denied" Error

## Possible Causes

### 1. **No Complaints Exist Yet**
The error appears when you try to view replies but haven't created any complaints yet.

**Fix:** Create a test complaint first
- Go to Support section
- Fill in subject and description  
- Submit complaint
- Then try viewing "My Complaints"

---

### 2. **Backend Can't Connect to Supabase**
The backend might not have the correct Supabase credentials.

**Check:** Open `backend/.env` and verify:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_anon_key
```

**Fix:** Get credentials from Supabase Dashboard → Settings → API

---

### 3. **RLS Policies Too Restrictive**
The Row Level Security policies might be blocking access.

**Check in Supabase SQL Editor:**
```sql
-- Check if complaints exist
SELECT id, subject, user_id, created_at 
FROM complaints 
ORDER BY created_at DESC 
LIMIT 5;

-- Check if replies exist
SELECT * FROM complaint_replies 
ORDER BY created_at DESC 
LIMIT 5;
```

**Temporary Fix (TESTING ONLY):**
If you need to test without RLS:
```sql
-- DANGER: This disables security - only for testing!
ALTER TABLE complaint_replies DISABLE ROW LEVEL SECURITY;
```

---

### 4. **Check Backend Logs**

Look at the backend terminal (where `npm run dev` is running) for errors like:
- `Error fetching replies:`
- `Insert error:`
- Connection errors to Supabase

---

### 5. **Browser Console Errors**

Open browser DevTools (F12) → Console tab, look for:
- `Failed to fetch replies`
- `404` or `401` errors
- CORS errors

---

## Step-by-Step Debugging

### Step 1: Verify Complaints Exist
```sql
-- Run in Supabase SQL Editor
SELECT COUNT(*) as total_complaints FROM complaints;
```
If result is `0`, you need to create a complaint first.

### Step 2: Check Backend is Running
Open: `http://localhost:5000/health`
Should show: `{"status":"OK","message":"Server is running"}`

### Step 3: Test API Directly
Try fetching replies for a specific complaint ID:

1. Get a complaint ID from Supabase:
```sql
SELECT id FROM complaints LIMIT 1;
```

2. Get your auth token:
- Open browser DevTools → Application tab → Local Storage
- Find Supabase session token

3. Test the API with curl (replace YOUR_COMPLAINT_ID and YOUR_TOKEN):
```powershell
curl http://localhost:5000/api/complaints/YOUR_COMPLAINT_ID/replies `
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Step 4: Check Supabase Connection

In `backend/config/supabase.js`, add debug logging:
```javascript
console.log('Supabase URL:', process.env.SUPABASE_URL);
console.log('Supabase Key exists:', !!process.env.SUPABASE_KEY);
```

Restart backend and check terminal output.

---

## Quick Fixes

### If you get "401 Unauthorized"
- User is not logged in
- Log in first, then try again

### If you get "404 Complaint not found"
- Create a complaint first
- OR the complaint ID doesn't match

### If you get "500 Internal Server Error"
- Check backend terminal for detailed error
- Usually means Supabase connection issue

---

## Still Not Working?

Check:
1. ✅ SQL migration was run successfully
2. ✅ `complaint_replies` table exists
3. ✅ Backend `.env` has correct Supabase credentials
4. ✅ Backend server is running without errors
5. ✅ User is logged in
6. ✅ At least one complaint exists in database
