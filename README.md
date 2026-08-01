# My Resources — Secure Resource Sharing, Borrowing & Marketplace Platform

Full-stack implementation: Spring Boot + MySQL backend, React + Tailwind frontend.
Covers auth (register/login/forgot-password/email verification), three roles
(Admin/Owner/Borrower), resource listings, the full borrow workflow (request →
approval → OTP → QR pickup → return), the purchase workflow (buy → pay →
approve → deliver), wishlists, complaints, admin console, and email
notifications for every major event.

```
my-resources-app/
├── backend/     Spring Boot 3 / Java 21 REST API
└── frontend/    React 19 + Vite + Tailwind CSS 4
```

## This copy is pre-configured

`backend/src/main/resources/application.properties` already has:
- MySQL connection (root / your password) on port 3306
- Backend server on port **8081**
- Gmail SMTP for outgoing email (registration, login, password reset, borrow/purchase notifications, admin actions)

You shouldn't need to edit this file for local use. If you ever need to
change the DB password or email credentials, they're plain `key=value` lines
near the top of that file — no YAML, no quoting needed.

## Running the backend

Requires JDK 21, Maven, and a running MySQL 8+ server.

```bash
cd backend
mvn spring-boot:run
```

Wait for `Started MyResourcesApplication`. API on `http://localhost:8081`,
Swagger docs at `http://localhost:8081/swagger-ui.html`.

### First-time database setup

```bash
mysql -u root -p -e "CREATE DATABASE my_resources"
mysql -u root -p my_resources < backend/src/main/resources/db/seed_admin.sql
```

This creates a default admin — check the comments at the top of
`seed_admin.sql` for the exact login/password baked into that file. Hibernate
(`ddl-auto=update`) creates and updates all other tables automatically on
startup, no manual `CREATE TABLE` needed.

## Running the frontend

Requires Node 18+.

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173`. In dev, `/api/*` is proxied to
`http://localhost:8081` (see `vite.config.js`).

## Feature map

- **Auth** — email OR phone registration, JWT, BCrypt, forgot/reset password
  via emailed OTP, email verification link, self-service profile & password
  change while logged in (`/me/settings`).
- **Resources** — CRUD for owners, search/filter by category/location/price/type,
  inventory tracking, discounts, admin verification badge.
- **Borrow workflow** — Search → View → Request → Owner Approval → OTP →
  QR Generation → Pickup → Active → Return Requested → Return Confirmed →
  Complete, with late-fee calculation.
- **Purchase workflow** — Buy → Payment (simulated gateway) → Owner Approval
  → Delivery → Complete.
- **Notifications** — every workflow event (registration, login, borrow
  request/approve/reject/pickup/return-requested/return-complete, purchase/
  approve/deliver, complaint filed/status-changed, user blocked/unblocked/
  verified, resource verified/removed) sends an in-app + email notification.
- **Admin console** — dashboard stats, user block/unblock/verify, resource
  verify/remove, complaint triage.

## What's still stubbed (not wired to a real provider)

- **SMS** — logs to console instead of sending a real text. Wire in
  Twilio/Fast2SMS/MSG91 via `app.sms.*` properties and implement the HTTP
  call in `NotificationService.sendSms`.
- **Payments** — `PurchaseService.confirmPayment` simulates a successful
  payment. Swap in Razorpay/Stripe/UPI and call it from their webhook instead.
- **Image storage** — accepts image URLs directly; no real file upload to
  Cloudinary/S3 yet.
- **No automated test suite.**

## Trying it out

1. Start MySQL, then the backend, then the frontend.
2. Log in as the seeded admin (see `seed_admin.sql`), or register two new
   accounts — one "Share & sell" (Owner), one "Borrow & buy" (Borrower).
3. As Owner: **My Resources → Add resource**, set type to "Borrow & sell".
4. As Borrower: find it on Browse, send a borrow request or buy it.
5. As Owner: **Requests** → Approve → generates an OTP, emailed to the borrower
   (also visible in backend logs as a fallback).
6. As Borrower: **My Borrows** → enter the OTP → get a pickup QR code.
7. As Owner: confirm pickup, then confirm return once requested.
8. As Admin: check dashboard stats, verify users/resources, triage complaints.
