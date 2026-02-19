# Backend Reply System Setup Guide

## Step 1: Run SQL Migration in Supabase

1. **Open Supabase Dashboard**
   - Go to your project: [supabase.com](https://supabase.com)
   - Navigate to **SQL Editor** in the left sidebar

2. **Run the Migration Script**
   - Open the file: `supabase_replies_setup.sql`
   - Copy ALL the contents
   - Paste into Supabase SQL Editor
   - Click **Run** button

3. **Verify Tables Created**
   - Go to **Table Editor**
   - You should see a new table: `complaint_replies`
   - Check it has columns: id, complaint_id, user_id, message, is_admin_reply, marks_resolved, created_at, updated_at

## Step 2: Restart Backend Server

The backend server should automatically restart if it's running with `npm run dev`.

If not, manually restart:
```bash
cd backend
npm run dev
```

## Step 3: Test the System

### Test Creating a Complaint
1. Go to Support section
2. Fill out a complaint and submit
3. Check "My Complaints" history
4. Click on the complaint - you should see the automatic admin welcome message

### Test Adding Replies
1. In the complaint detail modal
2. Type a message in the reply textarea
3. Click "Send Reply"
4. The message should appear in the chat thread

### Test Mark as Resolved
1. Type a final message
2. Check "Mark this issue as resolved"
3. Click "Send Reply"
4. The complaint status should change to "resolved"
5. The reply input should be disabled

## Troubleshooting

### Backend Error: "Cannot find module '../config/supabase.js'"
- Check that `backend/config/supabase.js` exists
- Verify it exports the supabase client correctly

### CORS Errors
- Make sure backend is running on port 5000
- Check CORS settings in `server.js`

### "Unauthorized" when fetching replies
- User must be logged in
- Check that auth token is being passed correctly

### Replies not showing
1. Open browser DevTools → Network tab
2. Look for the fetch request to `/api/complaints/:id/replies`
3. Check response - should return `{ replies: [...] }`

## Database Verification

Run this in Supabase SQL Editor to check data:

```sql
-- Check replies table
SELECT * FROM complaint_replies ORDER BY created_at DESC LIMIT 10;

-- Check complaints with their reply counts
SELECT 
  c.id, 
  c.subject, 
  c.status,
  COUNT(cr.id) as reply_count
FROM complaints c
LEFT JOIN complaint_replies cr ON cr.complaint_id = c.id
GROUP BY c.id
ORDER BY c.created_at DESC;
```

## Success Criteria

✅ complaint_replies table exists in Supabase
✅ Backend server starts without errors  
✅ New complaints automatically get admin acknowledgment message
✅ Users can add replies to their complaints
✅ Marking as resolved updates complaint status  
✅ Resolved/closed complaints cannot receive new replies
