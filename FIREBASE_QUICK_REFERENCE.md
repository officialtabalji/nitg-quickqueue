# Firebase Quick Reference

Quick commands and common tasks for Firebase setup.

## 🔑 Getting Your Firebase Config

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click ⚙️ **Project Settings**
4. Scroll to **Your apps** → Click **Web icon** (`</>`)
5. Copy config values to `.env`:

```env
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=project-id
VITE_FIREBASE_STORAGE_BUCKET=project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
```

## 🔐 Getting VAPID Key (for Notifications)

1. Firebase Console → ⚙️ **Project Settings**
2. **Cloud Messaging** tab
3. Scroll to **Web configuration**
4. Click **Generate key pair** (if not exists)
5. Copy the key → `VITE_FIREBASE_VAPID_KEY`

## 📋 Common Firebase CLI Commands

```powershell
# Login
firebase login

# Initialize project
firebase init

# Deploy Firestore rules
firebase deploy --only firestore:rules

# Deploy Functions
firebase deploy --only functions

# Deploy Hosting
firebase deploy --only hosting

# Deploy everything
firebase deploy

# View logs
firebase functions:log

# List projects
firebase projects:list

# Use specific project
firebase use project-id
```

## 🗄️ Firestore Collections Structure

### `users` Collection
```javascript
{
  uid: "user123",
  name: "John Doe",
  email: "john@example.com",
  role: "student" | "admin",
  createdAt: Timestamp
}
```

### `menu` Collection
```javascript
{
  id: "item123",
  name: "Burger",
  price: 150,
  category: "Fast Food",
  available: true,
  imageUrl: "https://...",
  createdAt: Timestamp
}
```

### `orders` Collection
```javascript
{
  id: "order123",
  userId: "user123",
  items: [
    { name: "Burger", quantity: 2, price: 150 }
  ],
  totalAmount: 300,
  paymentStatus: "paid" | "pending",
  orderStatus: "placed" | "preparing" | "ready",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

### `favorites` Collection
```javascript
{
  userId: "user123",
  items: ["item1", "item2"],
  createdAt: Timestamp
}
```

## 👤 Creating Admin User

**Method 1: Via Firebase Console**
1. Go to Firestore Database
2. Navigate to `users` collection
3. Find user document
4. Edit → Add field: `role` = `"admin"`

**Method 2: Via Code (one-time)**
```javascript
// Run in browser console after login
import { doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase/config';
import { getCurrentUser } from './firebase/auth';

const user = getCurrentUser();
if (user) {
  await updateDoc(doc(db, 'users', user.uid), {
    role: 'admin'
  });
}
```

## 🔒 Security Rules Quick Check

Deploy rules:
```powershell
firebase deploy --only firestore:rules
```

Test rules in Firebase Console:
1. Firestore Database → **Rules** tab
2. Use **Rules Playground** to test

## 🚨 Troubleshooting

### "Permission denied"
```powershell
# Redeploy rules
firebase deploy --only firestore:rules
```

### "Billing required"
- Go to Firebase Console → Usage and billing
- Enable Blaze Plan (pay-as-you-go)

### "Functions not working"
```powershell
# Check logs
firebase functions:log

# Redeploy
firebase deploy --only functions
```

### "Authentication not working"
- Check Authentication is enabled in Console
- Verify Email/Password provider is ON
- Check `.env` has correct API key

## 📊 Firebase Console URLs

- **Dashboard**: https://console.firebase.google.com/project/YOUR_PROJECT
- **Authentication**: `/authentication/users`
- **Firestore**: `/firestore/data`
- **Functions**: `/functions`
- **Hosting**: `/hosting`

## 🎯 Testing Checklist

- [ ] Can sign up with email
- [ ] Can login
- [ ] Can create menu item (as admin)
- [ ] Can create order
- [ ] Can see orders in Firestore
- [ ] Security rules working
- [ ] Functions deployed

---

**For detailed setup, see [FIREBASE_SETUP_GUIDE.md](./FIREBASE_SETUP_GUIDE.md)**

