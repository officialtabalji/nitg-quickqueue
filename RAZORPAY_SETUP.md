# How to Get Razorpay Key ID

## Step-by-Step Guide

### 1. Sign Up / Login to Razorpay

- Go to: https://razorpay.com
- Click **"Sign Up"** (if new) or **"Login"** (if you have an account)
- Complete the registration/login process

### 2. Access Your Dashboard

- After logging in, you'll be taken to the Razorpay Dashboard
- URL: https://dashboard.razorpay.com

### 3. Navigate to API Keys

1. In the left sidebar, click on **"Settings"** (⚙️ icon)
2. Click on **"API Keys"** from the settings menu
3. You'll see two sections:
   - **Test Mode** (for development/testing)
   - **Live Mode** (for production)

### 4. Get Your Key ID

#### For Testing/Development:
1. Make sure you're in **"Test Mode"** (toggle at top right)
2. You'll see:
   - **Key ID** (this is what you need - starts with `rzp_test_...`)
   - **Key Secret** (keep this secret, don't expose it)

#### For Production:
1. Switch to **"Live Mode"** (toggle at top right)
2. Click **"Generate API Key"** if you haven't already
3. Copy the **Key ID** (starts with `rzp_live_...`)

### 5. Add to Your Project

#### For Localhost (.env file):
```env
VITE_RAZORPAY_KEY_ID=rzp_test_xxxxxxxxxxxxx
```

#### For Vercel:
1. Go to Vercel Dashboard → Your Project → **Settings** → **Environment Variables**
2. Add:
   - **Name:** `VITE_RAZORPAY_KEY_ID`
   - **Value:** `rzp_test_xxxxxxxxxxxxx` (your actual key)
   - **Environment:** Production, Preview, Development (select all)
3. Click **Save**

## Important Notes

### ⚠️ Security
- **Never commit your Key Secret to GitHub**
- **Never expose your Key Secret in frontend code**
- Only the **Key ID** should be in your `.env` file
- The Key Secret should only be used on your backend/server

### 🔑 Key ID vs Key Secret

- **Key ID** (`rzp_test_...` or `rzp_live_...`):
  - Safe to use in frontend code
  - Used to initialize Razorpay checkout
  - This is what you need for `VITE_RAZORPAY_KEY_ID`

- **Key Secret**:
  - **NEVER** use in frontend
  - Only for backend/server-side operations
  - Used for payment verification, webhooks, etc.

### 🧪 Test Mode vs Live Mode

**Test Mode:**
- Use for development and testing
- Key ID starts with `rzp_test_`
- Payments don't charge real money
- Use test card numbers from Razorpay docs

**Live Mode:**
- Use for production
- Key ID starts with `rzp_live_`
- Real payments are processed
- Requires account verification

## Quick Reference

**Razorpay Dashboard:** https://dashboard.razorpay.com

**Path to API Keys:**
1. Settings (⚙️) → API Keys
2. Or direct link: https://dashboard.razorpay.com/app/keys

**What You Need:**
- Copy the **Key ID** (not the Key Secret)
- Add it as `VITE_RAZORPAY_KEY_ID` in your environment variables

## Example

If your Key ID is: `rzp_test_1DP5mmOlF5G5ag`

**In .env file:**
```env
VITE_RAZORPAY_KEY_ID=rzp_test_1DP5mmOlF5G5ag
```

**In Vercel:**
- Variable Name: `VITE_RAZORPAY_KEY_ID`
- Variable Value: `rzp_test_1DP5mmOlF5G5ag`

## Troubleshooting

**"Key ID not found"**
- Make sure you copied the Key ID, not the Key Secret
- Verify it starts with `rzp_test_` or `rzp_live_`
- Check for extra spaces when pasting

**"Invalid Key"**
- Make sure you're using the correct mode (test vs live)
- Verify the key is active in Razorpay dashboard
- Check if your account is verified (for live mode)

**"Payment not working"**
- Verify the Key ID is set correctly in environment variables
- Check browser console for errors
- Make sure you're using test cards in test mode

## Need Help?

- Razorpay Documentation: https://razorpay.com/docs/
- Razorpay Support: https://razorpay.com/support/

