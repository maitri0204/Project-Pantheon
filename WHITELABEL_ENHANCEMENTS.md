# Project Pantheon Whitelabel Registration Enhancements

## Overview
Implemented automated email notifications after organization registration and domain-based whitelabel routing, enabling organizations to access their portals via custom domains with organization-specific branding.

## Changes Implemented

### 1. Email Service Enhancement
**File**: `backend/src/services/email.ts`
- Added new function `sendRegistrationConfirmationEmail()` that sends a professional HTML email after successful registration
- Email includes:
  - Organization company name
  - Website link (portal URL)
  - Login email
  - Admin dashboard URL
- Email is styled with the organization's branding and has clear next-step instructions
- Graceful fallback if email service is not configured (logs to console for development)

### 2. Backend Registration Flow Update
**File**: `backend/src/controllers/authController.ts`
- Imported the new `sendRegistrationConfirmationEmail` function
- Updated `completeOrganizationRegistration()` to:
  - Store the generated slug in the `generatedSlug` field
  - Construct the frontend URL dynamically using `FRONTEND_URL` environment variable
  - Send confirmation email immediately after successful registration
  - Handle email sending errors gracefully (doesn't fail registration if email fails)

**File**: `backend/src/models/OrganizationRegistration.ts`
- Added `generatedSlug` field to store the internal slug generated during registration
- This allows the `website` field to be used for custom domain routing instead of being used as the slug

### 3. Domain-Based Routing Middleware
**File**: `frontend/middleware.ts` (NEW)
- Next.js middleware that intercepts all requests
- Detects if request is from a whitelabel domain (subdomain)
- For whitelabel domains (e.g., `acme.localhost:3000`), rewrites to `/whitelabel/{subdomain}`
- Main domains (localhost, 127.0.0.1, or configured main domain) pass through normally
- Enables accessing the same application on multiple domains without DNS changes

**How it works**:
```
Request to: acme.localhost:3000/login
Rewrites to: /whitelabel/acme/login
Routes to: Dynamic page that loads branding for "acme"
```

### 4. Updated Whitelabel Portal Page
**File**: `frontend/src/app/whitelabel/[slug]/page.tsx`
- Enhanced to support both slug-based and hostname-based access
- Added logic to extract slug from:
  1. URL parameters (traditional `/whitelabel/[slug]`)
  2. Subdomain/hostname if accessed via custom domain
- Added "Login" button that directs to organization-specific login
- Improved layout with better spacing and footer
- Uses organization's primary color for the login button

### 5. Organization-Specific Login Page
**File**: `frontend/src/app/login/page.tsx`
- Detects if accessed from whitelabel domain and loads organization branding
- Dynamically applies organization branding:
  - Background gradient uses organization's primary and accent colors
  - Logo displayed if organization has one
  - Company name shown as subtitle
  - Login button uses organization colors
  - Links use organization's primary color
  - Footer displays organization name
- Falls back to default Project Pantheon branding if not accessed from whitelabel domain
- Seamless experience for both main platform and whitelabel instances

## Architecture

### Domain-Based Access Flow
```
User registers organization with website: "acme"
↓
System generates internal slug: "acme-org-1" (stored in generatedSlug)
↓
Organization slug used for: /whitelabel/acme-org-1
↓
User can access via:
  1. http://localhost:3000/whitelabel/acme-org-1 (traditional)
  2. http://acme.localhost:3000 (custom domain - requires local hosts entry)
↓
Email sent with:
  - Portal Website: http://localhost:3000/whitelabel/acme-org-1
  - Login URL: http://localhost:3000/login
  - Login Email: organization@example.com
```

### For Production
Organizations can set their custom domains:
```
Example: acme.pantheon-app.com
↓
Middleware detects "acme" subdomain
↓
Routes to /whitelabel/acme-org-1
↓
Shows ACME organization portal with their branding
↓
Login page displays ACME branding automatically
```

## Environment Variables
Add to `.env.local` (frontend) and `.env` (backend):

```env
# Frontend
NEXT_PUBLIC_MAIN_DOMAIN=pantheon.local
NEXT_PUBLIC_API_URL=http://localhost:5000/api

# Backend
FRONTEND_URL=http://localhost:3000
```

## Testing on Localhost

### For Subdomain Routing (Optional)
1. Add to `/etc/hosts`:
```
127.0.0.1 localhost
127.0.0.1 acme.localhost
127.0.0.1 xyz.localhost
```

2. Access organization portals via:
   - `http://acme.localhost:3000` → Shows ACME portal with login button
   - `http://acme.localhost:3000/login` → Shows ACME-branded login page
   - `http://localhost:3000/register` → Traditional registration (shows generated slug in email)

### Testing Registration Email
1. Register a new organization
2. Check backend logs for OTP (development mode logs to console)
3. Complete registration
4. Backend logs will show:
   ```
   [REGISTRATION_CONFIRMATION] org@example.com => Website: http://localhost:3000/whitelabel/acme-org-1, Login URL: http://localhost:3000/login
   ```
5. (In production with SMTP configured) Email sent to organization with all details

## Key Features

✅ Automated email notification after registration  
✅ Professional, branded confirmation emails  
✅ Domain-based organization routing (subdomains)  
✅ Organization-specific portal branding  
✅ Organization-specific login page styling  
✅ Support for custom domains (production-ready)  
✅ Backward compatible with slug-based access  
✅ Graceful error handling  
✅ No breaking changes to existing functionality  

## File Structure Changes
```
frontend/
├── middleware.ts (NEW) - Domain-based routing
├── src/app/
│   ├── login/page.tsx (UPDATED) - Dynamic organization branding
│   └── whitelabel/[slug]/page.tsx (UPDATED) - Hostname detection

backend/
├── src/
│   ├── services/email.ts (UPDATED) - New confirmation email function
│   ├── controllers/authController.ts (UPDATED) - Email sending logic
│   └── models/OrganizationRegistration.ts (UPDATED) - generatedSlug field
```

## Next Steps (Optional Enhancements)

1. **DNS Management**: Implement automatic DNS management for custom domains
2. **Email Customization**: Allow organizations to customize email templates
3. **Domain Verification**: Add domain ownership verification step
4. **SSL/TLS**: Ensure custom domains have proper SSL certificates
5. **Analytics**: Track organization portal access and login metrics

## Notes

- The `website` field in registration is no longer used as the slug internally
- Organizations can still store their website URL in the `website` field without affecting routing
- All email errors are logged but don't prevent registration completion
- The middleware uses Next.js rewrite (not redirect) to keep clean URLs
- Organization branding is fetched client-side from the whitelabel portal API
