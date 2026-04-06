# 🚀 Production Deployment Guide

## 📋 Overview

To deploy your changes to production, you need to:
1. Push code to GitHub
2. Update environment variables in production
3. Verify Supabase configuration
4. Deploy and test

---

## ✅ Step-by-Step Deployment

### **Step 1: Push Code to GitHub**

```bash
# Check what files changed
git status

# Add all changes
git add .

# Commit with descriptive message
git commit -m "Update password reset flow and favicon

- Migrate to Supabase Auth
- Remove email sending (direct redirect)
- Update forgot password to check email instantly
- Replace Vercel favicon with custom AI icon
- Simplify password reset flow"

# Push to GitHub
git push origin main
```

**What happens:**
- Code uploaded to GitHub
- If you have auto-deployment (Vercel/Netlify), it will trigger automatically
- Build process starts

---

### **Step 2: Update Production Environment Variables**

Your production platform needs these environment variables:

#### **Required Variables:**

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_production_service_role_key
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key

# NextAuth Configuration
NEXTAUTH_SECRET=your_production_secret_key
NEXTAUTH_URL=https://yourdomain.com  # ⚠️ IMPORTANT: Change to production URL

# Groq API Keys
GROQ_API_KEY=your_groq_key
GROQ_TEXT_API_KEY=your_groq_key
GROQ_PROMPT_API_KEY=your_groq_key
```

#### **Where to Update:**

**If using Vercel:**
1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your project
3. Go to **Settings → Environment Variables**
4. Update `NEXTAUTH_URL` to your production domain
5. Verify all other variables are set
6. Click **Save**

**If using Netlify:**
1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Select your site
3. Go to **Site settings → Environment variables**
4. Update `NEXTAUTH_URL` to your production domain
5. Verify all other variables are set
6. Click **Save**

**If using other platforms:**
- Check your platform's documentation for environment variables
- Update `NEXTAUTH_URL` to match your production domain

---

### **Step 3: Verify Supabase Configuration**

#### **A. Check Supabase Auth Settings**

Go to [Supabase Dashboard](https://supabase.com/dashboard):

1. **Site URL:**
   - Navigate to: **Settings → Auth**
   - Set **Site URL** to: `https://yourdomain.com`
   - Click **Save**

2. **Redirect URLs:**
   - Navigate to: **Settings → Auth**
   - Add these URLs to **Redirect URLs**:
     ```
     https://yourdomain.com/reset-password
     https://yourdomain.com/**
     https://yourdomain.com/api/auth/callback/credentials
     ```
   - Click **Save**

3. **Email Provider:**
   - Navigate to: **Authentication → Providers**
   - Ensure **Email** is enabled
   - Click **Save**

#### **B. Verify Users Exist**

1. Navigate to: **Authentication → Users**
2. Check that your users are in Supabase Auth
3. If migrating from custom table, see migration section below

---

### **Step 4: Deploy**

#### **Automatic Deployment (Vercel/Netlify):**

If you have auto-deployment enabled:
1. ✅ Push to GitHub (already done in Step 1)
2. ✅ Platform automatically detects changes
3. ✅ Build starts automatically
4. ✅ Deployment happens automatically

**Monitor deployment:**
- Vercel: Check deployment status in dashboard
- Netlify: Check deploy log in dashboard

#### **Manual Deployment:**

If auto-deployment is not enabled:

**Vercel:**
```bash
# Install Vercel CLI (if not installed)
npm install -g vercel

# Deploy to production
vercel --prod
```

**Netlify:**
```bash
# Install Netlify CLI (if not installed)
npm install -g netlify-cli

# Deploy to production
netlify deploy --prod
```

---

### **Step 5: Test in Production**

After deployment completes:

#### **Test 1: Check Deployment**
```
1. Visit: https://yourdomain.com
2. Verify site loads correctly
3. Check favicon (should be custom AI icon)
```

#### **Test 2: Test Password Reset**
```
1. Go to: https://yourdomain.com/forgot-password
2. Enter existing user email
3. Click "Check Email"
4. Should redirect to /reset-password instantly
5. Enter new password
6. Submit
7. Should redirect to /login
8. Login with new password
9. ✅ Success!
```

#### **Test 3: Test Invalid Email**
```
1. Go to: https://yourdomain.com/forgot-password
2. Enter non-existent email
3. Click "Check Email"
4. Should show error: "Email does not exist"
5. ✅ Error handling works!
```

#### **Test 4: Test Login**
```
1. Go to: https://yourdomain.com/login
2. Enter credentials
3. Click "Sign In"
4. Should login successfully
5. ✅ Authentication works!
```

---

## ⚠️ Important Production Considerations

### **1. NEXTAUTH_URL Must Match Domain**

**Critical:** `NEXTAUTH_URL` must exactly match your production domain:

```bash
# ❌ Wrong
NEXTAUTH_URL=http://localhost:3000

# ✅ Correct
NEXTAUTH_URL=https://yourdomain.com

# ✅ Also correct (with subdomain)
NEXTAUTH_URL=https://app.yourdomain.com
```

### **2. Supabase URLs Must Match**

Ensure Supabase Site URL and Redirect URLs match your production domain.

### **3. HTTPS Required**

Production must use HTTPS (not HTTP) for security.

### **4. Environment Variables**

Never commit `.env.local` to GitHub. Production variables are set in your hosting platform.

---

## 🔄 Deployment Workflow

### **Typical Workflow:**

```
Local Development
    ↓
Test locally (npm run dev)
    ↓
Commit changes (git commit)
    ↓
Push to GitHub (git push)
    ↓
Auto-deployment triggers
    ↓
Build process runs
    ↓
Deploy to production
    ↓
Test in production
    ↓
✅ Done!
```

### **Time Estimate:**

- Push to GitHub: 10 seconds
- Build process: 2-5 minutes
- Deployment: 30 seconds
- Testing: 2-3 minutes

**Total:** ~5-10 minutes

---

## 🐛 Troubleshooting Production Issues

### **Issue: Build Fails**

**Check:**
1. Build logs in Vercel/Netlify dashboard
2. TypeScript errors
3. Missing dependencies
4. Environment variables

**Solution:**
```bash
# Test build locally first
npm run build

# If successful, push again
git push origin main
```

---

### **Issue: Password Reset Not Working**

**Check:**
1. `NEXTAUTH_URL` is set to production domain
2. Supabase Site URL matches production domain
3. Supabase Redirect URLs include production domain
4. Environment variables are set correctly

**Solution:**
- Update environment variables in hosting platform
- Redeploy after updating variables

---

### **Issue: "Email does not exist" for valid emails**

**Check:**
1. Users exist in Supabase Auth (not just custom table)
2. Email matches exactly (case-insensitive)
3. Supabase connection working

**Solution:**
- Check Supabase Dashboard → Authentication → Users
- Verify users are in Supabase Auth
- See migration section if needed

---

### **Issue: Login Not Working**

**Check:**
1. Supabase Auth credentials
2. `NEXTAUTH_SECRET` is set
3. `NEXTAUTH_URL` matches domain
4. Session cookies working

**Solution:**
- Clear browser cookies
- Check environment variables
- Verify Supabase connection

---

## 📊 Deployment Checklist

Before deploying to production:

### **Code:**
- [ ] All changes committed
- [ ] Code tested locally
- [ ] No console errors
- [ ] Build succeeds (`npm run build`)
- [ ] TypeScript compiles without errors

### **Environment Variables:**
- [ ] `NEXTAUTH_URL` set to production domain
- [ ] `NEXT_PUBLIC_SUPABASE_URL` set
- [ ] `SUPABASE_SERVICE_ROLE_KEY` set
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` set
- [ ] `NEXTAUTH_SECRET` set (different from dev)
- [ ] `GROQ_API_KEY` set

### **Supabase Configuration:**
- [ ] Site URL set to production domain
- [ ] Redirect URLs include production domain
- [ ] Email provider enabled
- [ ] Users exist in Supabase Auth

### **Testing:**
- [ ] Password reset flow tested
- [ ] Login tested
- [ ] Signup tested (if applicable)
- [ ] Error handling tested
- [ ] Favicon updated

---

## 🔐 Security Best Practices

### **1. Use Different Secrets for Production**

```bash
# ❌ Don't use same secret as development
NEXTAUTH_SECRET=dev_secret_123

# ✅ Generate new secret for production
NEXTAUTH_SECRET=prod_secret_xyz_different_from_dev
```

**Generate new secret:**
```bash
openssl rand -base64 32
```

### **2. Rotate API Keys**

If you accidentally committed API keys:
1. Revoke old keys in Supabase/Groq dashboard
2. Generate new keys
3. Update in production environment variables
4. Redeploy

### **3. Enable Rate Limiting**

Consider adding rate limiting to prevent abuse:
- Forgot password endpoint
- Login endpoint
- Signup endpoint

### **4. Monitor Logs**

Check logs regularly for:
- Failed login attempts
- Password reset requests
- API errors
- Suspicious activity

---

## 📈 Post-Deployment Monitoring

### **What to Monitor:**

1. **Deployment Status**
   - Check hosting platform dashboard
   - Verify deployment succeeded
   - Check build logs for warnings

2. **Application Health**
   - Test critical flows (login, password reset)
   - Check for JavaScript errors
   - Verify API responses

3. **User Experience**
   - Test from different devices
   - Check mobile responsiveness
   - Verify loading times

4. **Supabase Metrics**
   - Go to Supabase Dashboard → Reports
   - Check API usage
   - Monitor authentication events
   - Check for errors

---

## 🚀 Quick Deployment Commands

### **Full Deployment (Recommended):**

```bash
# 1. Check status
git status

# 2. Add all changes
git add .

# 3. Commit
git commit -m "Update password reset and favicon"

# 4. Push to GitHub (triggers auto-deploy)
git push origin main

# 5. Monitor deployment in your hosting dashboard
# Vercel: https://vercel.com/dashboard
# Netlify: https://app.netlify.com
```

### **After Deployment:**

```bash
# Test production
1. Visit your production URL
2. Test password reset flow
3. Test login
4. Verify favicon changed
5. ✅ Done!
```

---

## 📝 Summary

### **To Deploy to Production:**

1. ✅ **Push code to GitHub**
   ```bash
   git add .
   git commit -m "Update password reset and favicon"
   git push origin main
   ```

2. ✅ **Update environment variables**
   - Set `NEXTAUTH_URL` to production domain
   - Verify all other variables

3. ✅ **Update Supabase settings**
   - Site URL to production domain
   - Add production redirect URLs

4. ✅ **Auto-deployment happens**
   - Platform detects GitHub push
   - Builds and deploys automatically

5. ✅ **Test in production**
   - Test password reset
   - Test login
   - Verify everything works

**That's it!** Your changes will be live in production! 🎉

---

## 🆘 Need Help?

If you encounter issues:

1. Check build logs in hosting platform
2. Verify environment variables
3. Check Supabase configuration
4. Test locally first (`npm run build`)
5. Check browser console for errors

Your deployment should be smooth! The code is production-ready. 🚀
