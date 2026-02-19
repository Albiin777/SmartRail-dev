# Google OAuth Setup Guide for Supabase

## Step 1: Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth client ID**
5. If prompted, configure the OAuth consent screen:
   - User Type: **External**
   - App name: **SmartRail**
   - User support email: Your email
   - Developer contact: Your email
   - Add scopes: `email`, `profile`, `openid`
6. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: **SmartRail Web**
   - Authorized JavaScript origins:
     - `http://localhost:5173` (for development)
     - Your production URL (e.g., `https://smartrail.com`)
   - Authorized redirect URIs:
     - `https://mllzqxycrhyywvsdqfrp.supabase.co/auth/v1/callback`
     - Replace with your actual Supabase URL
7. Click **Create** and save the **Client ID** and **Client Secret**

## Step 2: Configure Supabase

1. Go to your [Supabase Dashboard](https://app.supabase.com)
2. Select your project: **SmartRail**
3. Navigate to **Authentication** → **Providers**
4. Find **Google** in the list
5. Enable the Google provider
6. Enter your Google OAuth credentials:
   - **Client ID**: (from Step 1)
   - **Client Secret**: (from Step 1)
7. Click **Save**

## Step 3: Configure Redirect URL

The redirect URL format is:
```
https://YOUR_SUPABASE_PROJECT_REF.supabase.co/auth/v1/callback
```

For your project:
```
https://mllzqxycrhyywvsdqfrp.supabase.co/auth/v1/callback
```

Make sure this exact URL is added to:
- Google Cloud Console → Authorized redirect URIs
- Supabase → Authentication → URL Configuration → Redirect URLs

## Step 4: Test Google Sign-In

1. Restart your frontend server
2. Click "Continue with Google"
3. You should see Google's sign-in page
4. After signing in, you'll be redirected back to your app
5. Your first name should appear in the header as "Hi, [YourName]"

## Troubleshooting

### "Unsupported provider: provider is not enabled"
- Make sure you enabled Google provider in Supabase dashboard
- Check that Client ID and Secret are correctly entered
- Try refreshing the Supabase dashboard

### "redirect_uri_mismatch"
- The redirect URI in Google Console must exactly match Supabase's callback URL
- Check for typos or extra slashes

### "OAuth consent screen not configured"
- Complete the OAuth consent screen setup in Google Cloud Console
- Add your email as a test user if app is in testing mode

### User not showing in Header
- Check browser console for errors
- Verify Supabase session is created (check Application → Local Storage)
- Make sure Header component is getting user data

## For Production

When deploying to production:
1. Add your production domain to Google Cloud Console authorized origins
2. Add production callback URL to Google Cloud Console redirect URIs
3. Update Supabase site URL in Authentication → URL Configuration
4. Set `VITE_API_URL` to your production backend URL
