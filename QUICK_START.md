# Quick Start Guide

Get your NITG QuickQueue app running in 5 minutes!

## Prerequisites Check

- [ ] Node.js 18+ installed (`node --version`)
- [ ] npm installed (`npm --version`)
- [ ] Firebase account created
- [ ] Razorpay account created (for test keys)

## Step 1: Install Dependencies

**For Bash/Git Bash:**
```bash
npm install
cd functions && npm install && cd ..
```

**For PowerShell:**
```powershell
npm install
cd functions; npm install; cd ..
```

**Or run separately:**
```powershell
npm install
cd functions
npm install
cd ..
```

## Step 2: Firebase Setup

> 📖 **For detailed step-by-step instructions, see [FIREBASE_SETUP_GUIDE.md](./FIREBASE_SETUP_GUIDE.md)**

**Quick Overview:**
1. **Create Firebase Project** at https://console.firebase.google.com/
2. **Enable Services**:
   - Authentication (Email/Password + Google)
   - Firestore Database (production mode)
   - Cloud Functions (requires billing)
   - Cloud Messaging (get VAPID key)
3. **Get Config** from Project Settings > General > Your apps > Web
4. **Initialize Firebase CLI**:
   ```powershell
   npm install -g firebase-tools
   firebase login
   firebase init
   # Select: Firestore, Functions, Hosting
   ```

## Step 3: Environment Variables

Create `.env` file:

```env
VITE_FIREBASE_API_KEY=your-key-here
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_VAPID_KEY=your-vapid-key
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxx
```

## Step 4: Deploy Firestore Rules

```bash
firebase deploy --only firestore:rules
```

## Step 5: Run the App

```bash
npm run dev
```

Visit: http://localhost:3000

## Step 6: Create Admin User

1. Sign up through the app
2. Go to Firebase Console > Firestore
3. Find your user in `users` collection
4. Edit document, set `role: "admin"`

## Step 7: Add Menu Items

1. Login as admin
2. Go to Menu Management
3. Add your first menu item!

## 🎉 You're Done!

### Test Payment
- Use Razorpay test card: `4111 1111 1111 1111`
- Any future expiry date
- Any CVV

### Next Steps
- Customize colors in `tailwind.config.js`
- Add your menu items
- Deploy: 
  - **Bash**: `npm run build && firebase deploy`
  - **PowerShell**: `npm run build; firebase deploy`

## Troubleshooting

**"Firebase config error"**
→ Check `.env` file has all variables

**"Permission denied"**
→ Deploy rules: `firebase deploy --only firestore:rules`

**"Functions not working"**
→ Enable billing in Firebase Console

**"Razorpay not loading"**
→ Check internet connection and key in `.env`

---

For detailed setup, see `SETUP_GUIDE.md`

