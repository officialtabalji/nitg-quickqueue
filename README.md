# NITG QuickQueue – Smart Canteen Ordering and Pickup System

A full-stack web application for campus canteen ordering with real-time queue management, payment integration, and analytics dashboard.

## 🚀 Features

### Student Portal
- 🔐 Firebase Authentication (Email/Password + Google Sign-in)
- 📱 Responsive menu browsing with search and filters
- 🛒 Shopping cart with quantity management
- 💳 Secure payment via Razorpay
- 📊 Real-time order status tracking
- ⭐ Favorites system for quick reordering
- 📜 Order history

### Admin Portal
- 📋 Menu management (add/edit/delete items, toggle availability)
- 📦 Real-time order tracking and status updates
- 📈 Analytics dashboard with Chart.js:
  - Orders per day
  - Revenue trends
  - Most popular items
- 🔔 Push notifications for order updates

### Additional Features
- 🌙 Dark mode toggle
- 📱 PWA support (installable web app)
- ⚡ Real-time updates using Firestore listeners
- 🎨 Modern UI with Tailwind CSS

## 🛠️ Tech Stack

- **Frontend**: React 18 + Vite
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Firestore, Auth, Cloud Functions)
- **Payments**: Razorpay
- **Charts**: Chart.js + react-chartjs-2
- **Notifications**: Firebase Cloud Messaging (FCM)
- **Hosting**: Firebase Hosting

## 📋 Prerequisites

- Node.js 18+ and npm
- Firebase account
- Razorpay account (for test/production keys)

## 🔧 Setup Instructions

### 1. Clone and Install Dependencies

**For Bash/Git Bash:**
```bash
# Install frontend dependencies
npm install

# Install Firebase Functions dependencies
cd functions && npm install && cd ..
```

**For PowerShell:**
```powershell
# Install frontend dependencies
npm install

# Install Firebase Functions dependencies
cd functions; npm install; cd ..
```

**Or run separately:**
```powershell
npm install
cd functions
npm install
cd ..
```

### 2. Firebase Setup

1. Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)

2. Enable the following services:
   - **Authentication**: Enable Email/Password and Google Sign-in
   - **Firestore Database**: Create database in production mode
   - **Cloud Functions**: Enable billing (required for Cloud Functions)
   - **Cloud Messaging**: Get your VAPID key from Project Settings > Cloud Messaging

3. Get your Firebase configuration:
   - Go to Project Settings > General
   - Scroll to "Your apps" and add a web app
   - Copy the Firebase configuration object

### 3. Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Fill in your Firebase and Razorpay credentials:

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
VITE_FIREBASE_VAPID_KEY=your-vapid-key

VITE_RAZORPAY_KEY_ID=rzp_test_your_key_id
```

### 4. Initialize Firebase

```bash
# Install Firebase CLI globally (if not already installed)
npm install -g firebase-tools

# Login to Firebase
firebase login

# Initialize Firebase in your project
firebase init

# Select:
# - Firestore (for database)
# - Functions (for Cloud Functions)
# - Hosting (for deployment)
```

### 5. Firestore Security Rules

The project includes `firestore.rules` with appropriate security rules. Deploy them:

```bash
firebase deploy --only firestore:rules
```

### 6. Create Admin User

After setting up authentication, manually create an admin user in Firestore:

1. Sign up as a regular user through the app
2. Go to Firestore Console
3. Find the user document in the `users` collection
4. Update the `role` field to `"admin"`

### 7. Razorpay Setup

1. Sign up at [Razorpay](https://razorpay.com/)
2. Get your test API keys from Dashboard > Settings > API Keys
3. Add the Key ID to your `.env` file

**Note**: For production, you'll need to create orders on your backend. The current implementation uses a simplified approach for testing.

## 🚀 Running the Application

### Development Mode

```bash
# Start the development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Build for Production

```bash
# Build the app
npm run build
```

### Firebase Emulators (Optional)

```bash
# Start Firebase emulators for local testing
firebase emulators:start
```

## 📦 Deployment

### Deploy to Firebase Hosting

```bash
# Build the app first
npm run build

# Deploy to Firebase
firebase deploy
```

### Deploy Cloud Functions

```bash
# Deploy only functions
firebase deploy --only functions
```

## 📁 Project Structure

```
nitg-quickqueue/
├── src/
│   ├── components/          # Reusable components
│   │   ├── Auth/            # Authentication components
│   │   ├── Layout/          # Layout components (Sidebar, Header)
│   │   ├── Menu/            # Menu-related components
│   │   └── Payment/         # Payment components
│   ├── context/             # React Context providers
│   ├── firebase/            # Firebase configuration and utilities
│   ├── pages/               # Page components
│   │   └── admin/           # Admin pages
│   ├── utils/               # Utility functions
│   ├── App.jsx              # Main app component
│   └── main.jsx             # Entry point
├── functions/               # Firebase Cloud Functions
├── public/                  # Static assets
├── firebase.json            # Firebase configuration
├── firestore.rules          # Firestore security rules
└── package.json
```

## 🔐 Security Rules

The Firestore security rules ensure:
- Users can only read/write their own data
- Menu items are publicly readable but only admins can write
- Orders are readable by the owner and admins
- Admin routes are protected in the frontend

## 🎨 Customization

### Colors

Edit `tailwind.config.js` to customize the color scheme:

```js
colors: {
  primary: {
    // Your custom colors
  }
}
```

### Menu Categories

Categories are dynamically generated from menu items. Add items with any category name.

## 📱 PWA Features

The app is configured as a PWA. To customize:
- Edit `vite.config.js` for PWA settings
- Add app icons in `public/` directory
- Icons should be named: `pwa-192x192.png` and `pwa-512x512.png`

## 🐛 Troubleshooting

### Firebase Authentication Issues
- Ensure Authentication is enabled in Firebase Console
- Check that Email/Password and Google providers are enabled

### Firestore Permission Errors
- Verify security rules are deployed: `firebase deploy --only firestore:rules`
- Check that user documents have the correct structure

### Razorpay Payment Issues
- Ensure you're using test keys for development
- For production, implement proper order creation on backend
- Check browser console for Razorpay script loading errors

### Cloud Functions Not Working
- Ensure billing is enabled on your Firebase project
- Check function logs: `firebase functions:log`
- Verify Node.js version matches (18)

## 📝 Data Models

### User Document
```javascript
{
  uid: string,
  name: string,
  email: string,
  role: 'student' | 'admin',
  createdAt: timestamp
}
```

### Menu Item Document
```javascript
{
  id: string,
  name: string,
  price: number,
  imageUrl: string,
  available: boolean,
  category: string,
  createdAt: timestamp
}
```

### Order Document
```javascript
{
  id: string,
  userId: string,
  items: [{ name: string, qty: number, price: number }],
  totalAmount: number,
  paymentStatus: 'paid' | 'pending',
  orderStatus: 'placed' | 'preparing' | 'ready',
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.

## 🙏 Acknowledgments

- Firebase for backend infrastructure
- Razorpay for payment processing
- Chart.js for analytics visualization
- Tailwind CSS for styling

## 📞 Support

For issues and questions, please open an issue on the repository.

---

**Built with ❤️ for NITG Campus**

