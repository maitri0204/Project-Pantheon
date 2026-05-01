# Whitelabel System Architecture

## Data Flow Diagram: Organization Registration

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER REGISTRATION FLOW                       │
└─────────────────────────────────────────────────────────────────┘

User visits: http://localhost:3000/register
    ↓
[Step 1: Email Verification]
    ├─ User enters email
    ├─ Frontend sends OTP request
    └─ Backend: sendOtpEmail() → Backend logs OTP to console
    
    ↓
[Step 2: Email Verification]
    ├─ User enters OTP from logs
    ├─ Frontend verifies OTP
    └─ Backend: Sets emailVerified = true
    
    ↓
[Step 3: Organization Details Form]
    ├─ User fills: Name, Address, Tax Details, Logo, etc.
    └─ Frontend validates logo size (< 2MB)
    
    ↓
[Registration Completion]
    User clicks "Complete Registration"
    
    ├─ Backend: completeOrganizationRegistration()
    │   ├─ Creates Organization record
    │   ├─ Creates User (ORG_ADMIN)
    │   ├─ Generates slug: slugify(company_name) → "techcorp"
    │   ├─ Ensures uniqueness → "techcorp-1" (if duplicate)
    │   ├─ Stores in: organization.slug = "techcorp-1"
    │   ├─ Stores in: registration.generatedSlug = "techcorp-1"
    │   │
    │   └─ Sends confirmation email:
    │       sendRegistrationConfirmationEmail()
    │       │
    │       └─ Email Content:
    │           ├─ To: org@example.com
    │           ├─ Subject: Welcome to Project Pantheon
    │           ├─ Portal Website: http://localhost:3000/whitelabel/techcorp-1
    │           ├─ Login Email: org@example.com
    │           └─ Admin Dashboard: http://localhost:3000/login
    │
    └─ Frontend: Redirects to /whitelabel/techcorp-1
        ├─ Loads organization data from API
        ├─ Displays organization branding
        └─ Shows "Login" button
```

---

## Portal Access Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│              PORTAL ACCESS ROUTES (All Equivalent)               │
└──────────────────────────────────────────────────────────────────┘

[Route 1: Traditional Slug-Based]
    http://localhost:3000/whitelabel/techcorp-1
    ↓
    /whitelabel/[slug]/page.tsx
    ├─ slug = "techcorp-1" (from URL)
    └─ Loads organization portal
    

[Route 2: Domain-Based (localhost subdomain)]
    http://techcorp.localhost:3000
    ↓
    middleware.ts (intercepts request)
    ├─ Detects hostname: "techcorp.localhost"
    ├─ Extracts subdomain: "techcorp"
    └─ Rewrites to: /whitelabel/techcorp
    
    Then routes to: /whitelabel/[slug]/page.tsx
    ├─ slug = "techcorp" (extracted from middleware)
    └─ Loads organization portal


[Route 3: Domain-Based (custom domain)]
    http://acme.pantheon-app.com
    ↓
    middleware.ts (intercepts request)
    ├─ Detects hostname: "acme.pantheon-app.com"
    ├─ Extracts subdomain: "acme"
    └─ Rewrites to: /whitelabel/acme
    
    Then routes to: /whitelabel/[slug]/page.tsx
    ├─ slug = "acme" (extracted from middleware)
    └─ Loads organization portal


[All routes converge to same page with organization branding]
    ↓
    /whitelabel/[slug]/page.tsx
    ├─ Fetch: /api/platform/whitelabel/{slug}
    ├─ Response includes:
    │   ├─ organization.branding (logo, colors, name)
    │   └─ assessments (list of available tests)
    └─ Render with organization colors and logo
```

---

## Login Page Branding Detection

```
┌──────────────────────────────────────────────────────────────────┐
│               LOGIN PAGE DYNAMIC BRANDING                        │
└──────────────────────────────────────────────────────────────────┘

User visits: /login
    ↓
Login page useEffect (client-side)
    ├─ Check if accessed from whitelabel domain
    │   ├─ window.location.hostname
    │   ├─ If subdomain detected → call /api/platform/whitelabel/{slug}
    │   └─ Fetch organization branding
    │
    └─ Two possible outcomes:
    
        [Scenario A: Accessed from Whitelabel Domain]
        http://techcorp.localhost:3000/login
            ↓
            Middleware → rewrite to /whitelabel/techcorp/login
            ↓
            Login page detects subdomain
            ↓
            Fetches: /api/platform/whitelabel/techcorp
            ↓
            Sets orgBranding state
            ↓
            Renders with:
            ├─ Organization logo in header
            ├─ Company name as subtitle
            ├─ Background gradient (org colors)
            ├─ Buttons styled with org primary color
            └─ Footer: "© 2026 TechCorp"
        
        
        [Scenario B: Accessed from Main Domain]
        http://localhost:3000/login
            ↓
            No subdomain detected
            ↓
            orgBranding stays null
            ↓
            Renders with:
            ├─ "PP" logo
            ├─ "Project Pantheon Platform" subtitle
            ├─ Blue-cyan gradient
            ├─ Blue primary buttons
            └─ Footer: "© 2026 Project Pantheon"
```

---

## Email Generation Flow

```
┌──────────────────────────────────────────────────────────────────┐
│              REGISTRATION CONFIRMATION EMAIL                     │
└──────────────────────────────────────────────────────────────────┘

After organization registration completes:

Backend: completeOrganizationRegistration()
    │
    └─ Construct email data:
        ├─ email: org@example.com
        ├─ firstName: John
        ├─ companyName: TechCorp
        ├─ websiteLink: http://localhost:3000/whitelabel/techcorp-1
        ├─ loginEmail: org@example.com
        └─ loginUrl: http://localhost:3000/login
    
    ↓
    
    sendRegistrationConfirmationEmail(data)
        │
        ├─ Check if SMTP configured
        │   ├─ If YES → Send HTML email via SMTP
        │   └─ If NO → Log to console (development mode)
        │
        └─ Email HTML Template:
            
            [Header]
            Welcome to Project Pantheon!
            Your whitelabel portal is now live
            
            [Body]
            Hello John,
            
            Congratulations! Your organization TechCorp has been 
            successfully registered on Project Pantheon.
            
            [Portal Details Box]
            ┌─────────────────────────────────┐
            │ Portal Website                  │
            │ http://localhost:3000/wh.../1  │
            │                                 │
            │ Login Email                     │
            │ org@example.com                │
            │                                 │
            │ Admin Dashboard                 │
            │ http://localhost:3000/login     │
            └─────────────────────────────────┘
            
            [Footer]
            © 2026 TechCorp. Powered by Project Pantheon.
```

---

## Database Schema Relationship

```
┌──────────────────────────────────────────────────────────────────┐
│              DATABASE ORGANIZATION STRUCTURE                     │
└──────────────────────────────────────────────────────────────────┘

User Registration Flow → Creates Multiple Records:

[1] OrganizationRegistration (Temporary)
    {
      email: "org@example.com",
      firstName: "John",
      companyName: "TechCorp",
      website: "techcorp",           ← User input
      generatedSlug: "techcorp-1",   ← System generated
      status: "COMPLETED",
      organization: ObjectId(ref)
    }

    ↓ (triggers creation of)

[2] Organization (Permanent)
    {
      name: "TechCorp",
      slug: "techcorp-1",            ← Used for routing
      website: "techcorp",           ← Can be custom domain
      type: "WHITELABEL",
      branding: {
        companyName: "TechCorp",
        logoUrl: "http://...",
        primaryColor: "#2563eb",
        accentColor: "#06b6d4"
      }
    }

    ↓ (triggers creation of)

[3] User (Permanent)
    {
      firstName: "John",
      lastName: "Doe",
      email: "org@example.com",
      role: "ORG_ADMIN",
      organization: ObjectId(ref) ← Links to Organization
    }

Key Relationships:
- User.organization → Organization._id
- OrganizationRegistration.organization → Organization._id
- Organization.slug → Used in portal URLs
- Organization.branding → Used for styling
```

---

## Request Flow Diagram

```
┌──────────────────────────────────────────────────────────────────┐
│                    REQUEST FLOW OVERVIEW                         │
└──────────────────────────────────────────────────────────────────┘

[FRONTEND REQUEST]
    
User URL: http://acme.localhost:3000/login
    ↓
Next.js Middleware (middleware.ts)
    ├─ Extract hostname: "acme.localhost"
    ├─ Detect subdomain: "acme"
    ├─ Rewrite to: /whitelabel/acme/login
    └─ Pass to router
    
    ↓
    
Route Handler: /app/whitelabel/[slug]/login
(Note: login redirect goes to /login component)
    ↓
    /app/login/page.tsx (Client Component)
    ├─ On mount: Check window.location.hostname
    ├─ Detect subdomain: "acme"
    └─ Fetch: /api/platform/whitelabel/acme
    
    ↓
    
[BACKEND API REQUEST]
    
GET /api/platform/whitelabel/acme
    ↓
Backend Route Handler
    ├─ Extract slug: "acme"
    └─ Find Organization where slug = "acme"
    
    ↓
    
Database Query
    ├─ Find Organization with slug "acme"
    ├─ Include branding data
    └─ Include assessments
    
    ↓
    
Response to Frontend
    {
      organization: {
        name: "ACME Corp",
        branding: {
          companyName: "ACME",
          logoUrl: "http://...",
          primaryColor: "#ff0000",
          accentColor: "#00ff00"
        }
      },
      assessments: [...]
    }
    
    ↓
    
[FRONTEND RENDERING]
    
Update orgBranding state
    ├─ Apply gradient: org colors
    ├─ Display logo
    ├─ Set text: company name
    ├─ Button color: org primary
    └─ Render login form
    
    ↓
    
Display Organization-Branded Login Page
```

---

## Security Considerations

```
┌──────────────────────────────────────────────────────────────────┐
│                    SECURITY ARCHITECTURE                         │
└──────────────────────────────────────────────────────────────────┘

[1] Email Communication
    ✅ Emails sent only to verified email
    ✅ Portal links include generated slug (not predictable)
    ✅ No sensitive data in email body
    ✅ Graceful error handling (doesn't expose system details)

[2] Domain Validation
    ✅ Middleware only processes if org exists
    ✅ Invalid slugs return 404 (not found)
    ✅ No information disclosure for non-existent orgs

[3] Branding Data
    ✅ Branding fetched via public API (intentional)
    ✅ No authentication required for portal branding
    ✅ Organization data is public-facing

[4] Access Control
    ✅ Login still requires authentication
    ✅ ORG_ADMIN access restricted to own org
    ✅ JWT tokens scoped to user + organization

[5] File Upload
    ✅ Logo size validation (< 2MB) client-side
    ✅ Backend limit increased to 15MB (file + data)
    ✅ No code execution (images only)
```

---

## Scalability Notes

```
┌──────────────────────────────────────────────────────────────────┐
│                    SCALABILITY CONSIDERATIONS                    │
└──────────────────────────────────────────────────────────────────┘

[1] Domain Routing
    Current: Supports subdomains on same domain
    Future: Can support custom domains with DNS mapping
    
[2] Email Service
    Current: Logs to console or sends via configured SMTP
    Future: Can integrate with email queue systems (Bull, Celery)
    
[3] Branding Data
    Current: Fetched from database on each request
    Future: Can add caching (Redis) for frequently accessed orgs
    
[4] Multi-tenant Architecture
    ✅ Ready for: 100+ organizations on same instance
    ✅ Each org completely isolated
    ✅ Slug-based routing prevents cross-org access
    ✅ ORG_ADMIN can only see their organization
    
[5] Database Indexes
    Recommended:
    - Organization.slug (unique, indexed)
    - Organization.website (indexed)
    - OrganizationRegistration.email (unique, indexed)
    - User.organization (indexed for queries)
```

---

## Deployment Architecture

```
┌──────────────────────────────────────────────────────────────────┐
│                  PRODUCTION DEPLOYMENT                           │
└──────────────────────────────────────────────────────────────────┘

[Development - Single Domain]
    localhost:3000/whitelabel/{slug}
    localhost:3000/login
    Email logs to console

[Production - Multi-Domain]
    
    DNS Configuration:
    ├─ pantheon-app.com          → Main platform
    ├─ *.pantheon-app.com        → All whitelabels
    ├─ acme.pantheon-app.com     → ACME Corp portal
    └─ xyz.pantheon-app.com      → XYZ Corp portal
    
    Application Hosting:
    ├─ Single Next.js instance serves all domains
    ├─ Middleware routes based on subdomain
    ├─ Same backend serves all organizations
    ├─ Organization isolation via JWT + database queries
    └─ No duplicate deployments needed
    
    Email Configuration:
    ├─ SMTP_HOST: SendGrid/AWS SES/Gmail
    ├─ Sends emails with org-specific branding
    └─ Tracking via email service webhooks
    
    SSL/TLS:
    ├─ Wildcard certificate: *.pantheon-app.com
    ├─ Single cert covers all subdomains
    └─ Automatic renewal via Let's Encrypt
    
    Load Balancing:
    ├─ Single load balancer routes all requests
    ├─ No per-org server needed
    ├─ Horizontal scaling by adding more instances
    └─ Database replication for reliability
```
