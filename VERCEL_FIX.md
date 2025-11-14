# Fix: Changes Not Reflecting on Vercel

If your changes aren't showing up on Vercel after pushing, follow these steps:

## 🔍 Common Issues & Solutions

### 1. **Root Directory Not Set Correctly**

If your project is in a subdirectory (`nitg-quickqueue/nitg-quickqueue`), Vercel needs to know:

**Fix:**
1. Go to Vercel Dashboard → Your Project → Settings
2. Scroll to "Root Directory"
3. Set it to: `nitg-quickqueue` (or `nitg-quickqueue/nitg-quickqueue` if that's where package.json is)
4. Save and redeploy

### 2. **Build Cache Issues**

Vercel might be using cached builds.

**Fix:**
1. Go to Vercel Dashboard → Your Project → Deployments
2. Click the three dots (⋯) on the latest deployment
3. Click "Redeploy" → Check "Use existing Build Cache" → **UNCHECK IT**
4. Click "Redeploy"

Or via CLI:
```bash
vercel --force
```

### 3. **Environment Variables Not Updated**

If you changed environment variables, they need a new deployment.

**Fix:**
1. Go to Settings → Environment Variables
2. Verify all variables are set correctly
3. After updating, trigger a new deployment

### 4. **Build Command Issues**

**Fix:**
1. Go to Settings → General
2. Verify:
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install`
   - **Framework Preset:** Vite

### 5. **Browser Cache**

Your browser might be caching the old version.

**Fix:**
- Hard refresh: `Ctrl+Shift+R` (Windows/Linux) or `Cmd+Shift+R` (Mac)
- Or open in incognito/private mode

## 🚀 Quick Fix Steps (Do All)

1. **Verify Root Directory:**
   - Settings → General → Root Directory
   - Should be: `nitg-quickqueue` or empty (if package.json is in root)

2. **Clear Build Cache:**
   - Deployments → Latest → Redeploy → Uncheck "Use existing Build Cache"

3. **Verify Environment Variables:**
   - Settings → Environment Variables
   - All `VITE_*` variables should be set

4. **Check Build Logs:**
   - Deployments → Latest → Click on it → View build logs
   - Look for errors or warnings

5. **Force New Deployment:**
   ```bash
   # In your project directory
   git commit --allow-empty -m "Trigger Vercel rebuild"
   git push
   ```

## 🔧 Advanced: Manual Vercel Configuration

If auto-detection isn't working, manually set in `vercel.json`:

```json
{
  "buildCommand": "cd nitg-quickqueue && npm run build",
  "outputDirectory": "nitg-quickqueue/dist",
  "installCommand": "cd nitg-quickqueue && npm install",
  "framework": "vite"
}
```

Or if package.json is in root:
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "installCommand": "npm install",
  "framework": "vite"
}
```

## 📋 Checklist

- [ ] Root directory is set correctly in Vercel
- [ ] Build command is `npm run build`
- [ ] Output directory is `dist`
- [ ] All environment variables are set
- [ ] Build cache is cleared
- [ ] Browser cache is cleared
- [ ] Build logs show no errors
- [ ] Latest commit is pushed to GitHub

## 🐛 Still Not Working?

1. **Check Build Logs:**
   - Look for errors in the deployment logs
   - Check if dependencies are installing correctly
   - Verify build is completing successfully

2. **Verify Git Integration:**
   - Make sure Vercel is connected to the correct GitHub branch
   - Check if auto-deployments are enabled

3. **Test Locally:**
   ```bash
   npm run build
   npm run preview
   ```
   - If this doesn't work locally, fix those issues first

4. **Contact Support:**
   - Vercel Dashboard → Help → Contact Support
   - Include build logs and error messages

