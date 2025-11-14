# Complete Firebase Setup Guide

This guide will walk you through setting up Firebase for NITG QuickQueue step by step.

## 📋 Table of Contents

1. [Create Firebase Project](#1-create-firebase-project)
2. [Enable Authentication](#2-enable-authentication)
3. [Set Up Firestore Database](#3-set-up-firestore-database)
4. [Enable Cloud Functions](#4-enable-cloud-functions)
5. [Set Up Cloud Messaging (FCM)](#5-set-up-cloud-messaging-fcm)
6. [Get Firebase Configuration](#6-get-firebase-configuration)
7. [Initialize Firebase CLI](#7-initialize-firebase-cli)
8. [Deploy Security Rules](#8-deploy-security-rules)
9. [Test Your Setup](#9-test-your-setup)

---

## 1. Create Firebase Project

### Step 1.1: Go to Firebase Console
1. Visit [https://console.firebase.google.com/](https://console.firebase.google.com/)
2. Sign in with your Google account

### Step 1.2: Create New Project
1. Click **"Add project"** or **"Create a project"**
2. Enter project name: `nitg-quickqueue` (or your preferred name)
3. Click **Continue**

### Step 1.3: Configure Google Analytics (Optional)
1. Choose whether to enable Google Analytics
   - **Recommended**: Enable it for better insights
   - Or disable if you don't need it
2. If enabled, select or create an Analytics account
3. Click **Create project**

### Step 1.4: Wait for Project Creation
- Firebase will create your project (takes 30-60 seconds)
- Click **Continue** when ready

---

## 2. Enable Authentication

### Step 2.1: Navigate to Authentication
1. In your Firebase project dashboard, click **Authentication** in the left sidebar
2. Click **Get started**

### Step 2.2: Enable Email/Password Sign-in
1. Click on the **Sign-in method** tab
2. Find **Email/Password** in the list
3. Click on it
4. Toggle **Enable** to ON
5. Click **Save**

### Step 2.3: Enable Google Sign-in (Optional but Recommended)
1. Still in **Sign-in method** tab
2. Find **Google** in the list
3. Click on it
4. Toggle **Enable** to ON
5. Set **Project support email** (your email)
6. Click **Save**

### Step 2.4: Configure Authorized Domains
1. Scroll down to **Authorized domains**
2. Your project domain is already listed
3. For local development, `localhost` is automatically authorized
4. Add your custom domain if needed (for production)

---

## 3. Set Up Firestore Database

### Step 3.1: Create Firestore Database
1. Click **Firestore Database** in the left sidebar
2. Click **Create database**

### Step 3.2: Choose Security Rules Mode
1. Select **Start in production mode**
   - Don't worry, we'll add proper security rules later
2. Click **Next**

### Step 3.3: Choose Database Location
1. Select a location closest to your users
   - **Recommended**: `us-central1` (Iowa) or `asia-south1` (Mumbai) for India
2. Click **Enable**
3. Wait for database creation (30-60 seconds)

### Step 3.4: Verify Database Creation
- You should see an empty database with a message: "Cloud Firestore has been created"

---

## 4. Enable Cloud Functions

### Step 4.1: Navigate to Functions
1. Click **Functions** in the left sidebar
2. Click **Get started**

### Step 4.2: Enable Billing (Required)
1. Firebase will prompt you to enable billing
2. Click **Upgrade project** or **Select a plan**
3. Choose **Blaze Plan** (Pay as you go)
   - **Note**: You get free tier usage, so you likely won't be charged unless you exceed limits
   - Free tier includes:
     - 2 million function invocations/month
     - 400,000 GB-seconds compute time/month
     - 5 GB egress/month
4. Complete billing setup with your payment method
5. Return to Functions

### Step 4.3: Verify Functions Enabled
- You should see the Functions dashboard
- No functions deployed yet (that's normal)

---

## 5. Set Up Cloud Messaging (FCM)

### Step 5.1: Navigate to Project Settings
1. Click the **gear icon** (⚙️) next to "Project Overview"
2. Select **Project settings**

### Step 5.2: Go to Cloud Messaging Tab
1. Click on the **Cloud Messaging** tab
2. Scroll down to **Web configuration**

### Step 5.3: Generate Web Push Certificate
1. If you see "No certificates", click **Generate key pair**
2. A VAPID key will be generated
3. **Copy this key** - you'll need it for your `.env` file
   - It looks like: `BElGGi...` (long string)
4. Save it somewhere safe

### Step 5.4: Note Your Sender ID
1. In the same section, note your **Sender ID**
   - This is your `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - It's a numeric value like `123456789012`

---

## 6. Get Firebase Configuration

### Step 6.1: Add Web App
1. Still in **Project settings** > **General** tab
2. Scroll to **Your apps** section
3. Click the **Web icon** (`</>`)

### Step 6.2: Register App
1. Enter app nickname: `QuickQueue Web`
2. Check **"Also set up Firebase Hosting"** (optional, but recommended)
3. Click **Register app**

### Step 6.3: Copy Configuration
1. You'll see your Firebase config object
2. It looks like this:
   ```javascript
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:abc123def456"
   };
   ```
3. **Copy each value** - you'll need them for your `.env` file

### Step 6.4: Map to Environment Variables
Create these mappings:
- `apiKey` → `VITE_FIREBASE_API_KEY`
- `authDomain` → `VITE_FIREBASE_AUTH_DOMAIN`
- `projectId` → `VITE_FIREBASE_PROJECT_ID`
- `storageBucket` → `VITE_FIREBASE_STORAGE_BUCKET`
- `messagingSenderId` → `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `appId` → `VITE_FIREBASE_APP_ID`
- VAPID key (from step 5.3) → `VITE_FIREBASE_VAPID_KEY`

---

## 7. Initialize Firebase CLI

### Step 7.1: Install Firebase CLI

**For PowerShell:**
```powershell
npm install -g firebase-tools
```

**For Bash/Git Bash:**
```bash
npm install -g firebase-tools
```

### Step 7.2: Login to Firebase
```powershell
firebase login
```
- This will open your browser
- Sign in with the same Google account
- Allow Firebase CLI access
- Return to terminal when done

### Step 7.3: Initialize Firebase in Your Project

Navigate to your project directory:
```powershell
cd D:\canteen
```

Run initialization:
```powershell
firebase init
```

### Step 7.4: Select Features
When prompted, select:
- ✅ **Firestore**: Configure security rules and indexes files
- ✅ **Functions**: Configure a Cloud Functions directory and files
- ✅ **Hosting**: Configure files for Firebase Hosting

Press **Space** to select, **Enter** to confirm.

### Step 7.5: Configure Firestore
1. **Use an existing project** → Select your project (`nitg-quickqueue`)
2. **What file should be used for Firestore Rules?** → `firestore.rules` (press Enter)
3. **What file should be used for Firestore indexes?** → `firestore.indexes.json` (press Enter)

### Step 7.6: Configure Functions
1. **What language would you like to use?** → **JavaScript**
2. **Do you want to use ESLint?** → **Yes** (recommended)
3. **Do you want to install dependencies now?** → **Yes**

### Step 7.7: Configure Hosting
1. **What do you want to use as your public directory?** → `dist` (press Enter)
2. **Configure as a single-page app?** → **Yes**
3. **Set up automatic builds and deploys with GitHub?** → **No** (or Yes if you want)

---

## 8. Deploy Security Rules

### Step 8.1: Verify Rules File
Check that `firestore.rules` exists in your project root with proper rules.

### Step 8.2: Deploy Rules
```powershell
firebase deploy --only firestore:rules
```

### Step 8.3: Verify Deployment
- You should see: "✔ Deploy complete!"
- Check Firebase Console > Firestore > Rules to verify

---

## 9. Test Your Setup

### Step 9.1: Create `.env` File
In your project root (`D:\canteen`), create `.env`:

```env
VITE_FIREBASE_API_KEY=AIzaSy...your-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123
VITE_FIREBASE_VAPID_KEY=your-vapid-key-here
```

### Step 9.2: Test Authentication
1. Run your app: `npm run dev`
2. Try to sign up with email/password
3. Check Firebase Console > Authentication > Users
4. You should see your new user

### Step 9.3: Test Firestore
1. In your app, try to add a menu item (as admin)
2. Check Firebase Console > Firestore Database
3. You should see collections: `users`, `menu`, `orders`

### Step 9.4: Create Admin User
1. Sign up through your app
2. Go to Firebase Console > Firestore Database
3. Navigate to `users` collection
4. Find your user document (by email or UID)
5. Click on it, then click **Edit document**
6. Add field: `role` with value `"admin"` (string)
7. Save

---

## 🔍 Verification Checklist

After setup, verify:

- [ ] Firebase project created
- [ ] Authentication enabled (Email/Password + Google)
- [ ] Firestore database created
- [ ] Cloud Functions enabled (billing set up)
- [ ] FCM VAPID key generated
- [ ] Firebase config values copied
- [ ] Firebase CLI installed and logged in
- [ ] `firebase init` completed
- [ ] Security rules deployed
- [ ] `.env` file created with all values
- [ ] Can sign up/login in app
- [ ] Admin user created in Firestore

---

## 🐛 Common Issues & Solutions

### Issue: "Billing account required"
**Solution**: Enable billing in Firebase Console > Usage and billing

### Issue: "Permission denied" in Firestore
**Solution**: 
1. Deploy rules: `firebase deploy --only firestore:rules`
2. Check rules syntax in `firestore.rules`

### Issue: "Authentication not working"
**Solution**:
1. Verify Authentication is enabled in Console
2. Check Email/Password provider is ON
3. Verify `.env` has correct `VITE_FIREBASE_API_KEY`

### Issue: "Functions not deploying"
**Solution**:
1. Check billing is enabled
2. Verify Node.js version: `node --version` (should be 18+)
3. Check `functions/package.json` exists

### Issue: "VAPID key not found"
**Solution**:
1. Go to Project Settings > Cloud Messaging
2. Generate new key pair if needed
3. Copy the full key (it's long!)

---

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase Authentication](https://firebase.google.com/docs/auth)
- [Cloud Functions](https://firebase.google.com/docs/functions)

---

## 🎯 Next Steps

Once Firebase is set up:

1. ✅ Test authentication in your app
2. ✅ Add menu items as admin
3. ✅ Test order creation
4. ✅ Deploy Cloud Functions: `firebase deploy --only functions`
5. ✅ Test notifications (after implementing FCM tokens)

---

**Need Help?** Check the main `README.md` or `SETUP_GUIDE.md` for more details.

