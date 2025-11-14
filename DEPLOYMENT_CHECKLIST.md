# Quick Vercel Deployment Checklist

Follow these steps to deploy your app to Vercel exactly like localhost:

## ✅ Pre-Deployment

- [ ] All code is pushed to GitHub
- [ ] You have your Firebase project credentials ready
- [ ] You have your Razorpay API key ready (if using Razorpay)

## 📋 Step-by-Step Deployment

### 1. Import to Vercel
- [ ] Go to https://vercel.com/dashboard
- [ ] Click "Add New..." → "Project"
- [ ] Import your GitHub repository
- [ ] Vercel will auto-detect Vite framework

### 2. Set Environment Variables
Go to **Settings → Environment Variables** and add:

**Firebase (Required):**
- [ ] `VITE_FIREBASE_API_KEY`
- [ ] `VITE_FIREBASE_AUTH_DOMAIN`
- [ ] `VITE_FIREBASE_PROJECT_ID`
- [ ] `VITE_FIREBASE_STORAGE_BUCKET`
- [ ] `VITE_FIREBASE_MESSAGING_SENDER_ID`
- [ ] `VITE_FIREBASE_APP_ID`

**Firebase VAPID (Optional - for notifications):**
- [ ] `VITE_FIREBASE_VAPID_KEY`

**Razorpay (Required if using Razorpay):**
- [ ] `VITE_RAZORPAY_KEY_ID`

### 3. Configure Build Settings
Verify these settings (should auto-detect):
- [ ] Framework: Vite
- [ ] Build Command: `npm run build`
- [ ] Output Directory: `dist`
- [ ] Root Directory: (empty or `nitg-quickqueue` if needed)

### 4. Deploy
- [ ] Click "Deploy"
- [ ] Wait for build to complete
- [ ] Note your deployment URL

### 5. Update Firebase
- [ ] Go to Firebase Console → Authentication → Settings
- [ ] Add your Vercel domain to "Authorized domains"
- [ ] Domain: `your-project.vercel.app`

### 6. Test Deployment
- [ ] Site loads correctly
- [ ] Login/authentication works
- [ ] Can create orders
- [ ] Payment flow works (if using Razorpay)
- [ ] Live Queue updates in real-time
- [ ] Admin dashboard works

## 🔍 Where to Find Your Credentials

### Firebase
1. Go to Firebase Console: https://console.firebase.google.com
2. Select your project
3. Click ⚙️ Settings → Project settings
4. Scroll to "Your apps" section
5. Copy the config values

### Razorpay
1. Go to Razorpay Dashboard: https://dashboard.razorpay.com
2. Settings → API Keys
3. Copy your Key ID

## ⚠️ Important Notes

- All environment variables must start with `VITE_` to work with Vite
- Changes to environment variables require a new deployment
- Never commit `.env` files to GitHub
- Use the same values as your localhost `.env` file

## 🐛 Common Issues

**Build fails:**
- Check all environment variables are set
- Verify values are correct (no extra spaces)

**Firebase errors:**
- Verify authorized domains include Vercel URL
- Check Firebase console for errors

**Payment not working:**
- Verify Razorpay key is correct
- Check browser console for errors

**Real-time not working:**
- Check Firestore security rules
- Verify Firebase config is correct

## 📞 Need Help?

Refer to `VERCEL_DEPLOYMENT.md` for detailed instructions.

