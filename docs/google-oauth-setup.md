# Google Calendar OAuth Setup Guide

This guide will walk you through setting up Google OAuth credentials to enable Google Calendar sync in Orbit.

## Prerequisites

- A Google account
- Access to [Google Cloud Console](https://console.cloud.google.com/)
- Orbit application running locally or deployed

## Step-by-Step Instructions

### Step 1: Create a Google Cloud Project

1. Navigate to [Google Cloud Console](https://console.cloud.google.com/)
2. Click on the project dropdown at the top
3. Click **"New Project"**
4. Enter a project name (e.g., "Orbit Calendar Sync")
5. Click **"Create"**
6. Wait for the project to be created and select it

### Step 2: Enable Google Calendar API

1. In your Google Cloud project, navigate to **"APIs & Services"** > **"Library"**
2. Search for **"Google Calendar API"**
3. Click on **"Google Calendar API"** from the results
4. Click the **"Enable"** button
5. Wait for the API to be enabled (usually takes a few seconds)

### Step 3: Configure OAuth Consent Screen

1. Navigate to **"APIs & Services"** > **"OAuth consent screen"**
2. Choose **"External"** user type (unless you have a Google Workspace account)
3. Click **"Create"**
4. Fill in the required information:
   - **App name**: Orbit
   - **User support email**: Your email address
   - **Developer contact information**: Your email address
5. Click **"Save and Continue"**
6. On the **"Scopes"** page, click **"Add or Remove Scopes"**
7. Search for and select: `https://www.googleapis.com/auth/calendar.readonly`
8. Click **"Update"**, then **"Save and Continue"**
9. On the **"Test users"** page (if in testing mode), add your Google account email
10. Click **"Save and Continue"**
11. Review and click **"Back to Dashboard"**

### Step 4: Create OAuth 2.0 Credentials

1. Navigate to **"APIs & Services"** > **"Credentials"**
2. Click **"Create Credentials"** > **"OAuth client ID"**
3. If prompted, select **"Web application"** as the application type
4. Fill in the OAuth client details:
   - **Name**: Orbit Calendar Sync
   - **Authorized JavaScript origins**: 
     - For development: `http://localhost:3000`
     - For production: `https://yourdomain.com` (replace with your domain)
   - **Authorized redirect URIs**:
     - For development: `http://localhost:3000/api/calendar/google/callback`
     - For production: `https://yourdomain.com/api/calendar/google/callback`
5. Click **"Create"**
6. **Important**: Copy the **Client ID** and **Client Secret** immediately
   - You won't be able to see the Client Secret again
   - Store them securely

### Step 5: Configure Environment Variables

Add the OAuth credentials to your Orbit application:

1. Open your `.env` or `.env.local` file in the Orbit project root
2. Add the following variables:

```env
GOOGLE_CLIENT_ID=your_client_id_here
GOOGLE_CLIENT_SECRET=your_client_secret_here
GOOGLE_REDIRECT_URI=http://localhost:3000/api/calendar/google/callback
```

**For production**, update `GOOGLE_REDIRECT_URI` to your production URL:
```env
GOOGLE_REDIRECT_URI=https://yourdomain.com/api/calendar/google/callback
```

3. Save the file
4. Restart your development server if it's running

### Step 6: Test the Connection

1. Start your Orbit application:
   ```bash
   npm run dev
   ```

2. Navigate to **Settings** in Orbit
3. Scroll to the **"Calendar Sync"** section
4. Click **"Connect Google Calendar"**
5. You'll be redirected to Google's OAuth consent screen
6. Sign in with your Google account
7. Review the permissions (read-only access to your calendar)
8. Click **"Allow"** or **"Continue"**
9. You'll be redirected back to Orbit
10. You should see a success message and the connection status

### Step 7: Sync Your Calendar

1. In the **Calendar Sync** section, click **"Sync Now"**
2. Wait for the sync to complete
3. Check your Events page to see imported events
4. Events from the last 30 days and next 90 days will be imported

## Troubleshooting

### Error: "redirect_uri_mismatch"

**Problem**: The redirect URI in your OAuth credentials doesn't match what Orbit is using.

**Solution**:
1. Check that `GOOGLE_REDIRECT_URI` in your `.env` file matches exactly what you entered in Google Cloud Console
2. Ensure there are no trailing slashes or extra characters
3. For local development, use: `http://localhost:3000/api/calendar/google/callback`
4. Update the redirect URI in Google Cloud Console if needed

### Error: "invalid_client"

**Problem**: The Client ID or Client Secret is incorrect.

**Solution**:
1. Verify your `.env` file has the correct values
2. Ensure there are no extra spaces or quotes around the values
3. Recreate the OAuth credentials in Google Cloud Console if needed

### Error: "access_denied"

**Problem**: The OAuth consent screen hasn't been properly configured or you're not a test user.

**Solution**:
1. Go to OAuth consent screen in Google Cloud Console
2. Add your email to the test users list (if in testing mode)
3. Ensure the consent screen is published (for production use)

### Token Refresh Issues

**Problem**: Sync stops working after some time.

**Solution**:
1. The app should automatically refresh tokens, but if it fails:
2. Disconnect and reconnect Google Calendar in Settings
3. This will generate new tokens

### API Not Enabled

**Problem**: "Google Calendar API has not been used in project"

**Solution**:
1. Go to APIs & Services > Library in Google Cloud Console
2. Search for "Google Calendar API"
3. Click "Enable"
4. Wait a few minutes for the API to be fully enabled

## Security Best Practices

1. **Never commit credentials**: Keep `.env` files out of version control (already in `.gitignore`)
2. **Use environment variables**: Never hardcode credentials in your code
3. **Rotate credentials**: If credentials are exposed, immediately revoke and recreate them in Google Cloud Console
4. **Limit scope**: The app only requests read-only access to your calendar
5. **Review permissions**: Regularly review which apps have access to your Google account

## Production Deployment

When deploying to production:

1. Update the **Authorized redirect URIs** in Google Cloud Console to include your production domain
2. Update `GOOGLE_REDIRECT_URI` in your production environment variables
3. Consider publishing your OAuth consent screen (required for public use)
4. Add your production domain to authorized JavaScript origins

## Additional Resources

- [Google Calendar API Documentation](https://developers.google.com/calendar/api)
- [OAuth 2.0 for Web Applications](https://developers.google.com/identity/protocols/oauth2/web-server)
- [Google Cloud Console](https://console.cloud.google.com/)

## Support

If you encounter issues not covered in this guide:

1. Check the browser console for error messages
2. Check the Orbit application logs
3. Verify all environment variables are set correctly
4. Ensure your Google Cloud project has the Calendar API enabled
5. Open an issue on GitHub with details about the error
