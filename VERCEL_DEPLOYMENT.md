# Vercel Deployment Guide

This guide will help you deploy the NITG QuickQueue application to Vercel with the same configuration as localhost.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. Your Firebase project credentials
3. Your Razorpay API keys (if using Razorpay)

## Step 1: Push Code to GitHub

Make sure all your code is pushed to GitHub:
```bash
git add .
git commit -m "Ready for Vercel deployment"
git push origin main
```

## Step 2: Import Project to Vercel

1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import your GitHub repository
4. Vercel will auto-detect it's a Vite project

## Step 3: Configure Environment Variables

In Vercel project settings, go to **Settings → Environment Variables** and add the following:

### Firebase Configuration (Required)
```
VITE_FIREBASE_API_KEY=your-firebase-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-messaging-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### Firebase VAPID Key (Optional - for push notifications)
```
VITE_FIREBASE_VAPID_KEY=your-vapid-key
```

### Razorpay Configuration (Required if using Razorpay)
```
VITE_RAZORPAY_KEY_ID=your-razorpay-key-id
```

## Step 4: Configure Build Settings

Vercel should auto-detect these settings, but verify:

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`
- **Root Directory:** (leave empty or set to `nitg-quickqueue` if your project is in a subdirectory)

## Step 5: Deploy

1. Click "Deploy"
2. Wait for the build to complete
3. Your site will be live at `your-project.vercel.app`

## Step 6: Update Firebase Authorized Domains

1. Go to Firebase Console → Authentication → Settings
2. Add your Vercel domain to "Authorized domains":
   - `your-project.vercel.app`
   - `your-custom-domain.com` (if you have one)

## Step 7: Verify Deployment

Check that:
- ✅ Site loads correctly
- ✅ Firebase authentication works
- ✅ Orders can be created
- ✅ Payment flow works (if using Razorpay)
- ✅ Live Queue updates in real-time
- ✅ Admin dashboard works

## Troubleshooting

### Build Fails
- Check that all environment variables are set
- Verify `package.json` has correct dependencies
- Check build logs in Vercel dashboard

### Firebase Errors
- Verify all Firebase environment variables are correct
- Check Firebase console for any errors
- Ensure authorized domains include your Vercel URL

### Payment Not Working
- Verify Razorpay key is set correctly
- Check browser console for errors
- Ensure Razorpay is configured for your domain

### Real-time Updates Not Working
- Check Firestore security rules allow authenticated users
- Verify Firebase configuration is correct
- Check browser console for Firestore errors

## Environment Variables Reference

All environment variables must be prefixed with `VITE_` to be accessible in the Vite build.

### Required Variables:
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_RAZORPAY_KEY_ID` (if using Razorpay)

### Optional Variables:
- `VITE_FIREBASE_VAPID_KEY` (for push notifications)

## Notes

- Environment variables are case-sensitive
- Changes to environment variables require a new deployment
- Use Vercel's environment variable UI to manage secrets securely
- Never commit `.env` files to GitHub

