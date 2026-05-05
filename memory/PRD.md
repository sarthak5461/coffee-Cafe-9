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
- Backend: `/api/auth/{login,logout,me}`, `/api/menu` (GET/POST/PUT/DELETE), `/api/reviews` (GET, public POST → pending, admin PUT/DELETE, PATCH `/approve`, PATCH `/feature`), `/api/homepage` (GET, admin PUT), `/api/contact` (public POST, admin GET, PATCH `/read`, DELETE), `/api/admin/stats`.
- Auto-seeded admin (admin@coffeecafe9.com / admin123), 13 menu items across 5 categories, 6 reviews, homepage singleton; legacy field backfill on lifespan (is_approved/is_featured/is_read).
- Public site: Home, Menu (with category filters), Reviews (list approved + submit pending review), About, Contact (form + map).
- **Admin CMS** at /admin/login → /admin (JWT-protected):
  - **Dashboard** with 4 stat cards + recent messages + menu-by-category bars
  - **Menu** with search, category filter, image preview on form, edit/delete with confirm modal, popular toggle
  - **Reviews** with All/Pending/Approved/Featured tabs, approve/feature toggles, edit/delete
  - **Homepage** to edit hero/info bar/about/contact + popular items selector grid
  - **Inbox** with All/Unread/Read tabs, mark read/unread, mailto reply, delete with confirm
  - SaaS-style topbar + sidebar layout, badge counts on Reviews/Inbox tabs, sonner toasts everywhere
- Public page tested: 21/30 backend tests pass (1 was a real backfill bug — now fixed); frontend Playwright e2e covered all admin flows.

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
