# Vercel Deployment Troubleshooting

## 🎯 Quick Fix: Changes Not Reflecting

### Step 1: Check Root Directory in Vercel

**This is the #1 issue!**

1. Go to Vercel Dashboard → Your Project → **Settings** → **General**
2. Scroll to **"Root Directory"**
3. **Set it to:** `nitg-quickqueue` (the directory where your `package.json` is)
4. Click **Save**
5. Go to **Deployments** → Click **"Redeploy"** on the latest deployment

### Step 2: Clear Build Cache

1. Go to **Deployments**
2. Click the **three dots (⋯)** on your latest deployment
3. Click **"Redeploy"**
4. **UNCHECK** "Use existing Build Cache"
5. Click **"Redeploy"**

### Step 3: Verify Environment Variables

1. Go to **Settings** → **Environment Variables**
2. Make sure ALL these are set:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
   - `VITE_RAZORPAY_KEY_ID`
3. After updating, trigger a new deployment

### Step 4: Force New Deployment

```bash
# In your project root
cd nitg-quickqueue
git commit --allow-empty -m "Force Vercel rebuild"
git push origin main
```

## 🔍 How to Find Your Root Directory

Your project structure is:
```
nitg-quickqueue/
  └── nitg-quickqueue/
      └── package.json  ← This is where your project is
      └── src/
      └── vercel.json
```

So in Vercel, set **Root Directory** to: `nitg-quickqueue`

## 📋 Complete Checklist

- [ ] Root Directory is set to `nitg-quickqueue` in Vercel Settings
- [ ] Build Command is `npm run build`
- [ ] Output Directory is `dist`
- [ ] All environment variables are set (check Settings → Environment Variables)
- [ ] Build cache is cleared (Redeploy without cache)
- [ ] Latest code is pushed to GitHub
- [ ] Build logs show no errors (check Deployments → Latest → Build Logs)
- [ ] Browser cache is cleared (hard refresh: Cmd+Shift+R)

## 🐛 Still Not Working?

### Check Build Logs

1. Go to **Deployments** → Click on the latest deployment
2. Click **"Build Logs"**
3. Look for:
   - ❌ Errors (red text)
   - ⚠️ Warnings (yellow text)
   - ✅ "Build completed successfully"

### Common Build Errors

**Error: "Cannot find module"**
- Solution: Root directory is wrong, or `package.json` is in wrong location

**Error: "Environment variable not found"**
- Solution: Add missing environment variables in Vercel Settings

**Error: "Build command failed"**
- Solution: Check build logs for specific error, verify `npm run build` works locally

### Test Locally First

Before deploying, make sure it builds locally:

```bash
cd nitg-quickqueue
npm install
npm run build
npm run preview
```

If this fails, fix the local issues first.

## 🚀 Manual Vercel Configuration

If auto-detection isn't working, you can manually configure in Vercel Dashboard:

1. **Settings** → **General**
2. Set:
   - **Framework Preset:** Vite
   - **Root Directory:** `nitg-quickqueue`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`

## 📞 Still Need Help?

1. Check Vercel build logs for specific errors
2. Compare your local `.env` file with Vercel environment variables
3. Make sure you're pushing to the correct GitHub branch
4. Verify Vercel is connected to the right GitHub repository

