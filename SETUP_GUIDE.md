# Detailed Setup Guide

## Step-by-Step Firebase Configuration

### 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name: `nitg-quickqueue` (or your preferred name)
4. Disable Google Analytics (optional) or enable if you want analytics
5. Click "Create project"

### 2. Enable Authentication

1. In Firebase Console, go to **Authentication** > **Get started**
2. Click on **Sign-in method** tab
3. Enable **Email/Password**
4. Enable **Google** (optional but recommended)
   - Add your project's support email
   - Save the OAuth consent screen settings

### 3. Create Firestore Database

1. Go to **Firestore Database** > **Create database**
2. Start in **production mode** (we'll add rules later)
3. Choose a location (preferably closest to your users)
4. Click **Enable**

### 4. Set Up Firestore Security Rules

1. Go to **Firestore Database** > **Rules**
2. Copy the rules from `firestore.rules` in this project
3. Paste and click **Publish**

### 5. Enable Cloud Functions

1. Go to **Functions** in Firebase Console
2. Click **Get started**
3. Enable billing (required for Cloud Functions)
4. Follow the setup wizard

### 6. Set Up Cloud Messaging (FCM)

1. Go to **Project Settings** > **Cloud Messaging**
2. If not already created, generate a new Web Push certificate
3. Copy the **Key pair** (VAPID key) - you'll need this for `.env`

### 7. Get Firebase Configuration

1. Go to **Project Settings** (gear icon) > **General**
2. Scroll to **Your apps** section
3. Click the **Web** icon (`</>`)
4. Register app with nickname: "QuickQueue Web"
5. Copy the `firebaseConfig` object values

### 8. Initialize Firebase CLI

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project directory
firebase init

# Select the following:
# ✓ Firestore: Configure security rules and indexes files
# ✓ Functions: Configure a Cloud Functions directory and files
# ✓ Hosting: Configure files for Firebase Hosting

# When prompted:
# - Select your Firebase project
# - Use default file names (or customize)
# - For Functions: Choose JavaScript, ESLint: Yes
# - For Hosting: public directory = "dist", single-page app: Yes
```

### 9. Create First Admin User

After running the app and creating your first account:

1. Go to **Firestore Database** in Firebase Console
2. Navigate to `users` collection
3. Find your user document (by your email or UID)
4. Click on the document
5. Click the edit icon (pencil)
6. Add or update the `role` field to `"admin"`
7. Save

## Razorpay Setup

### 1. Create Razorpay Account

1. Go to [Razorpay](https://razorpay.com/)
2. Sign up for an account
3. Complete KYC verification (for production)

### 2. Get Test API Keys

1. Log in to Razorpay Dashboard
2. Go to **Settings** > **API Keys**
3. Generate **Test Keys**
4. Copy the **Key ID** (starts with `rzp_test_`)
5. Copy the **Key Secret** (keep this secure, don't commit to git)

### 3. Configure Webhook (Optional, for production)

1. In Razorpay Dashboard, go to **Settings** > **Webhooks**
2. Add webhook URL: `https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/updatePaymentStatus`
3. Select events: `payment.captured`, `payment.failed`

## Environment Variables Setup

Create a `.env` file in the project root:

```env
# Firebase Config (from Step 7)
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abc123
VITE_FIREBASE_VAPID_KEY=your-vapid-key-from-step-6

# Razorpay Config (from Razorpay Setup)
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
```

## First Run Checklist

- [ ] Firebase project created
- [ ] Authentication enabled (Email/Password + Google)
- [ ] Firestore database created
- [ ] Security rules deployed
- [ ] Cloud Functions enabled
- [ ] FCM VAPID key obtained
- [ ] Firebase config copied to `.env`
- [ ] Razorpay test keys obtained
- [ ] `.env` file created with all variables
- [ ] Dependencies installed (`npm install`)
- [ ] App runs successfully (`npm run dev`)
- [ ] First user account created
- [ ] User role set to "admin" in Firestore

## Testing the Application

### Test Student Flow

1. Sign up with a new email
2. Browse menu items
3. Add items to cart
4. Proceed to checkout
5. Complete payment (use Razorpay test card: 4111 1111 1111 1111)
6. View order status
7. Add items to favorites

### Test Admin Flow

1. Login with admin account
2. Go to Menu Management
3. Add a new menu item
4. Go to Orders Management
5. Update order status (placed → preparing → ready)
6. View Analytics dashboard

## Common Issues

### Issue: "Firebase: Error (auth/configuration-not-found)"
**Solution**: Check that all Firebase config values in `.env` are correct

### Issue: "Permission denied" in Firestore
**Solution**: 
- Verify security rules are deployed: `firebase deploy --only firestore:rules`
- Check that user document exists in `users` collection

### Issue: Razorpay script not loading
**Solution**: 
- Check browser console for errors
- Verify `VITE_RAZORPAY_KEY_ID` is set correctly
- Ensure internet connection (Razorpay loads from CDN)

### Issue: Cloud Functions not deploying
**Solution**:
- Ensure billing is enabled
- Check Node.js version: `node --version` (should be 18+)
- Run `firebase functions:log` to see errors

### Issue: Notifications not working
**Solution**:
- Request notification permission in browser
- Verify FCM VAPID key is correct
- Check that user document has `fcmToken` field (set automatically)

## Next Steps

1. **Add Menu Items**: Use admin panel to add your canteen's menu
2. **Customize Branding**: Update colors, logo in `tailwind.config.js`
3. **Set Up Production**: 
   - Get Razorpay production keys
   - Update environment variables
   - Deploy to Firebase Hosting
4. **Enable Analytics**: Set up Firebase Analytics for user insights
5. **Add More Features**: 
   - Inventory management
   - Staff management
   - Feedback system
   - Order ratings

---

**Need Help?** Check the main README.md or open an issue on GitHub.

