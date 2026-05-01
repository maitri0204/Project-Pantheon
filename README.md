# Project Pantheon

Project Pantheon is the new unified whitelabel shell for all assessment products.

Current foundation includes:
- Node.js + TypeScript backend with MongoDB
- Next.js + TypeScript frontend
- OTP + captcha based signup/login
- Default superadmin bootstrap for `maitripatel2608@gmail.com`
- Whitelabel organization model
- Central assessment catalog
- Superadmin pricing and coupon management
- Invoice-ready data model

## Assessment sources linked in Pantheon

Pantheon currently registers these assessment sources without modifying their individual apps:
- Career Compass
- Litmus Test
- Career DNA Profiler
- Metacognition Test
- Johari Window

The platform seed stores the source project names, seed commands, and reference locations for evaluation/report/invoice parity.

## Environment setup

### Backend
Copy [backend/.env.example](backend/.env.example) to `backend/.env` and update values.

### Frontend
Copy [frontend/.env.local.example](frontend/.env.local.example) to `frontend/.env.local`.

## Run locally

### Backend
Run `npm run seed:platform` once, then `npm run dev` inside `backend`.

### Frontend
Run `npm run dev` inside `frontend`.

## Validation

- Backend: `npm run build`
- Frontend: `npm run lint`
- Frontend: `npm run build`

## Notes

- Default superadmin is created in the database by bootstrap logic, not through `.env`.
- Existing sibling assessment applications are treated as source references and remain untouched.
- The current Pantheon delivery establishes the unified auth, catalog, whitelabel, coupon, pricing, and dashboard foundation.
# Project-Pantheon
