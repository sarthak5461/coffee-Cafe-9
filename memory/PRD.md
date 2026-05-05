# Coffee Cafe 9 — PRD

## Original Problem Statement
Full-stack web app for "Coffee Cafe 9 (कॉफी कैफे नाईन)". Pages: Home (hero, quick info bar, popular items, services, reviews preview, location with embedded Google Map), Menu (categories: Burgers, Pasta, Coffee, Drinks, Desserts), Reviews, About, Contact (Phone 099116 84545, Address 143, Khirki Extension, Malviya Nagar, New Delhi 110017, contact form). Warm cozy cafe aesthetic (browns, beige, cream, coffee tones), responsive mobile-first, sticky navbar, smooth scrolling, hover animations, loading & error states. CMS-style admin panel with JWT to manage menu/reviews/homepage; bilingual EN+HI hero copy.

## Architecture (final)
- Frontend: React (CRA) + Tailwind + shadcn primitives + lucide-react + sonner
- Backend: FastAPI + Motor (MongoDB), JWT (PyJWT), bcrypt
- Database: MongoDB (UUID string ids, _id always excluded from responses)
- Note: User originally requested Express + Strapi; replaced with FastAPI + custom admin panel because the managed environment runs FastAPI/CRA/Mongo under supervisor.

## User Personas
1. **Customer** — browses menu, reads reviews, submits a review, sends a contact message, finds location.
2. **Admin (cafe owner)** — signs in, manages menu items (CRUD), curates reviews (edit / feature / delete), edits homepage copy, reads contact submissions.

## What's Implemented (2026-02)
- Backend: `/api/auth/{login,logout,me}`, `/api/menu` (GET/POST/PUT/DELETE), `/api/reviews` (GET, public POST, admin PUT/DELETE), `/api/homepage` (GET, admin PUT), `/api/contact` (public POST, admin GET).
- Auto-seeded admin (admin@coffeecafe9.com / admin123), 13 menu items across 5 categories, 6 reviews, homepage singleton.
- Frontend pages: Home, Menu (with category filters), Reviews (list + submit form with star rating), About, Contact (form + map), Admin Login, Admin Dashboard (Menu / Reviews / Homepage / Contacts tabs).
- Navbar with sticky glassmorphism, mobile menu, footer with hours and address.
- Embedded Google Map on home + contact pages.
- JWT auth via httpOnly cookie + Bearer token fallback (token also stored in localStorage).
- Tested end-to-end: 21/21 backend pytest pass, full frontend Playwright pass.

## Backlog (P1 / P2)
- P1: Image upload for menu items (object storage) instead of URL input.
- P1: Admin "create review" / customer-named submissions filter & moderation queue.
- P2: Online reservation system / table booking.
- P2: Loyalty program — earn points per visit/order.
- P2: Brute-force lockout on `/api/auth/login` (5 fail / 15 min) per playbook.
- P2: Rich-text editor for About / homepage long copy.
- P2: SEO meta tags per route + sitemap + Open Graph cards for sharing.

## Test Credentials
See `/app/memory/test_credentials.md`.
