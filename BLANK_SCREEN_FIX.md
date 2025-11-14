# Fix: Blank Screen on Website

If you're seeing a blank screen, follow these steps:

## 🔍 Quick Diagnosis

### Step 1: Check Browser Console
1. Open your website
2. Press `F12` or right-click → "Inspect"
3. Go to the **Console** tab
4. Look for **red error messages**

**Common errors you might see:**
- `Firebase configuration is missing or invalid!`
- `Failed to initialize Firebase`
- `Cannot find module`
- `Uncaught Error`

### Step 2: Check Network Tab
1. In DevTools, go to **Network** tab
2. Refresh the page
3. Look for **failed requests** (red status codes)
4. Check if JavaScript files are loading (should see `.js` files with 200 status)

## 🛠️ Common Fixes

### Fix 1: Missing Firebase Environment Variables

**Symptoms:**
- Console shows: `Firebase configuration is missing or invalid!`
- Blank screen

**Solution:**
1. **For Vercel:**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add all Firebase variables:
     - `VITE_FIREBASE_API_KEY`
     - `VITE_FIREBASE_AUTH_DOMAIN`
     - `VITE_FIREBASE_PROJECT_ID`
     - `VITE_FIREBASE_STORAGE_BUCKET`
     - `VITE_FIREBASE_MESSAGING_SENDER_ID`
     - `VITE_FIREBASE_APP_ID`
   - **Redeploy** after adding variables

2. **For Localhost:**
   - Create `.env` file in project root
   - Add all variables (see `.env.example`)
   - Restart dev server: `npm run dev`

### Fix 2: Build Errors

**Symptoms:**
- Console shows build errors
- Files not loading

**Solution:**
1. Check Vercel build logs:
   - Vercel Dashboard → Deployments → Latest → Build Logs
2. Fix any errors shown
3. Redeploy

### Fix 3: JavaScript Errors

**Symptoms:**
- Console shows JavaScript errors
- Error boundary might show error message

**Solution:**
1. Check the error message in console
2. Look for the file and line number
3. Common issues:
   - Missing imports
   - Undefined variables
   - Firebase initialization errors

### Fix 4: Browser Cache

**Symptoms:**
- Old version showing
- Changes not reflecting

**Solution:**
1. Hard refresh: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
2. Or clear browser cache:
   - Chrome: Settings → Privacy → Clear browsing data
   - Firefox: Settings → Privacy → Clear Data

### Fix 5: Root Directory Issue (Vercel)

**Symptoms:**
- Build succeeds but blank screen
- Wrong files being served

**Solution:**
1. Vercel Dashboard → Settings → General
2. Check **Root Directory** is set correctly
3. Should be: `nitg-quickqueue` (where your `package.json` is)
4. Redeploy

## 🔧 Debug Steps

### 1. Check if React is Loading
Open browser console and type:
```javascript
window.React
```
If it returns `undefined`, React isn't loading.

### 2. Check if Root Element Exists
In console:
```javascript
document.getElementById('root')
```
Should return the root div element.

### 3. Check Environment Variables
In console:
```javascript
import.meta.env
```
Should show your environment variables (in dev mode).

### 4. Check Firebase Initialization
Look for in console:
- ✅ `Firebase initialized successfully` = Good
- ❌ `Firebase initialization failed` = Bad (check config)

## 📋 Checklist

- [ ] Browser console checked for errors
- [ ] Network tab checked for failed requests
- [ ] All Firebase environment variables set (Vercel/localhost)
- [ ] Build logs checked (Vercel)
- [ ] Root directory set correctly (Vercel)
- [ ] Browser cache cleared
- [ ] Hard refresh tried
- [ ] Error boundary showing error message (if any)

## 🚨 Still Not Working?

### Get More Info:
1. **Screenshot the console errors**
2. **Check Vercel build logs** (if deployed)
3. **Check Network tab** for failed requests
4. **Try in incognito mode** (rules out extensions)

### Common Issues:

**"Cannot find module"**
- Dependencies not installed
- Run `npm install` locally
- Check Vercel build logs

**"Firebase error"**
- Environment variables missing or wrong
- Check Firebase console for project settings

**"CORS error"**
- Firebase authorized domains not set
- Add your domain to Firebase Console → Authentication → Settings

**"404 on assets"**
- Build output directory wrong
- Check `vercel.json` outputDirectory is `dist`

## 💡 Prevention

1. **Always check console** before deploying
2. **Test locally first**: `npm run build && npm run preview`
3. **Set all environment variables** before deploying
4. **Check build logs** after deployment
5. **Use error boundaries** (already added in code)

## 📞 Need More Help?

Share:
1. Console error messages (screenshot)
2. Vercel build logs (if deployed)
3. Network tab errors
4. What you see (blank screen, error message, etc.)

