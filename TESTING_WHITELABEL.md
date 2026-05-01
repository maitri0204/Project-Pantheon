# Testing Whitelabel Enhancements

## Prerequisites
- Backend running on `http://localhost:5000`
- Frontend running on `http://localhost:3000`
- SMTP service configured or ready to log to console

## Test Scenario 1: Registration with Email Confirmation

### Steps:
1. Navigate to `http://localhost:3000/register`
2. Enter email: `test.org@example.com`
3. Click "Send OTP"
   - **Check backend logs** for: `[OTP:registration] test.org@example.com => 123456`
4. Copy OTP from logs and enter in form
5. Fill in complete organization details:
   - First Name: `John`
   - Last Name: `Doe`
   - Company Name: `TechCorp`
   - Designation: `CEO`
   - All required fields
   - **Important**: Upload a logo (< 2MB)
6. Click "Complete Registration"

### Expected Results:
- ✅ Registration succeeds
- ✅ JWT token returned in response
- ✅ New organization created with generated slug (e.g., `techcorp-1`)
- ✅ Backend logs show:
  ```
  [REGISTRATION_CONFIRMATION] test.org@example.com => Website: http://localhost:3000/whitelabel/techcorp-1, Login URL: http://localhost:3000/login
  ```
- ✅ Redirected to whitelabel portal showing TechCorp branding

---

## Test Scenario 2: Organization Portal Access via Slug

### Steps:
1. From registration confirmation, you're auto-redirected to portal
2. OR manually navigate to: `http://localhost:3000/whitelabel/techcorp-1`

### Expected Results:
- ✅ Portal loads with organization branding
- ✅ Organization logo displayed (if uploaded)
- ✅ "Available Assessments" section shows assessments
- ✅ "Login" button visible in top-right
- ✅ Button uses organization's primary color (blue-600)

---

## Test Scenario 3: Organization-Specific Login

### Steps:
1. From whitelabel portal, click "Login" button
2. OR directly visit: `http://localhost:3000/login?org=techcorp-1`

### Expected Results:
- ✅ Login page loads
- ✅ Header shows: "Welcome" and "TechCorp" (organization name)
- ✅ Logo displays (if organization has one)
- ✅ Background gradient uses organization colors
- ✅ Buttons use organization's primary color
- ✅ Footer shows: "© 2026 TechCorp"

### Additional Test:
1. Log in with organization email: `test.org@example.com`
2. Enter OTP from backend logs
3. Should redirect to organization dashboard (ORG_ADMIN role)

---

## Test Scenario 4: Domain-Based Routing (Optional)

### Prerequisites:
Add to `/etc/hosts` (macOS/Linux):
```bash
sudo nano /etc/hosts
# Add lines:
127.0.0.1 techcorp.localhost
127.0.0.1 acme.localhost
```

Or on Windows (`C:\Windows\System32\drivers\etc\hosts`):
```
127.0.0.1 techcorp.localhost
127.0.0.1 acme.localhost
```

### Steps:
1. Visit: `http://techcorp.localhost:3000`
2. (Middleware rewrites to `/whitelabel/techcorp`)

### Expected Results:
- ✅ Portal loads (same as slug-based access)
- ✅ Organization branding applied
- ✅ Login page shows organization branding when accessing login

### Test Multiple Organizations:
1. Register another organization with website field: `acme`
2. Access: `http://acme.localhost:3000`
3. Should show ACME portal with ACME branding

---

## Test Scenario 5: Default Branding (Non-Whitelabel)

### Steps:
1. Visit: `http://localhost:3000/login` (direct, not from subdomain)
2. Visit: `http://localhost:3000/register`

### Expected Results:
- ✅ Default Project Pantheon branding used
- ✅ "PP" logo shown
- ✅ Blue-cyan gradient used
- ✅ "Project Pantheon Platform" subtitle shown
- ✅ Footer shows: "© 2026 Project Pantheon"

---

## Test Scenario 6: Email Sending

### For Development (Console Logging):
1. Complete registration
2. Check backend console output:
```
[REGISTRATION_CONFIRMATION] org@example.com => Website: http://localhost:3000/whitelabel/techcorp-1, Login URL: http://localhost:3000/login
```

### For Production (With SMTP):
1. Configure in `.env`:
```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
```

2. Complete registration
3. Check organization's email inbox for confirmation email with:
   - Portal Website link
   - Login Email
   - Admin Dashboard link

---

## Edge Cases to Test

### 1. Invalid Organization Slug
```
Visit: http://localhost:3000/whitelabel/nonexistent-org
Expected: Error message "Portal not found"
```

### 2. Missing Logo
```
Register organization WITHOUT uploading logo
Expected: 
  - Portal shows placeholder (gray box)
  - Login page shows "TechCorp" initials in colored box
  - Email still sent successfully
```

### 3. Large Logo File
```
Try to upload logo > 2MB
Expected:
  - Error: "Logo file is too large. Please upload an image up to 2MB."
  - Form not submitted
```

### 4. Concurrent Registration
```
Register two organizations with different names
Expected:
  - Each gets unique slug (e.g., acme-1, acme-2)
  - Portal loads correctly for each
  - Branding correct for each
```

### 5. Organization Name with Special Characters
```
Register: "Tech & Co!"
Expected:
  - Slug becomes: "tech-co"
  - Portal accessible via slug
  - Email sent successfully
```

---

## Debugging Tips

### Check Email Logs
```bash
# In backend directory, watch for console output
npm run dev | grep REGISTRATION_CONFIRMATION
```

### Verify Organization Created
```bash
# Check MongoDB
db.organizations.findOne({ name: "TechCorp" })
# Should show: { slug: "techcorp-1", website: "techcorp", ... }
```

### Test Middleware Routing
```bash
# Check network tab in browser DevTools
# Request to: http://acme.localhost:3000/login
# Should rewrite to: /whitelabel/acme/login
```

### View Organization Data
```bash
# In browser console at portal page
# The page loads organization data via API
fetch('http://localhost:5000/api/platform/whitelabel/techcorp-1')
  .then(r => r.json())
  .then(data => console.log(data))
```

---

## Success Criteria Checklist

- [ ] Registration email sent automatically
- [ ] Email contains correct portal link
- [ ] Email contains correct login email
- [ ] Portal loads with organization branding
- [ ] Login page styled with organization colors
- [ ] Organization logo displayed on both portal and login
- [ ] Slug-based access works (`/whitelabel/[slug]`)
- [ ] Domain-based access works (if hosts configured)
- [ ] Default branding used when not on subdomain
- [ ] All fields validated properly
- [ ] No console errors
- [ ] Database shows correct organization structure
