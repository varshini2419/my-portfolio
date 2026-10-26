# Maddala Varshini — Personal Portfolio & Data Analytics Platform

A personal portfolio website and case study showcase for **Maddala Varshini**, a 3rd-year B.Tech Computer Science & Information Technology student at **SRKR Engineering College, Bhimavaram, India**, aspiring to work as a **Data Analyst** in product-based and fintech companies.

Built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS**, and **Supabase (PostgreSQL, Auth, RLS, Storage)**.

---

## 🎨 Visual Identity & Design System

The user interface adheres to a clean, minimal light theme designed specifically for a modern data analyst:
- **Palette**: White (`#FFFFFF`) and warm canvas off-whites (`#FBFBF9`, `#F9F8F5`), soft professional blue accents (`#2563EB`, `#EFF6FF`), and subtle slate typography (`#0F172A`, `#475569`, `#64748B`).
- **Cards & Depth**: White cards with refined borders (`border-slate-200/80`) and restrained soft shadows (`shadow-subtle`).
- **Whitespace**: Generous breathing room, accessible contrast, clean typography, responsive layouts.
- **Authenticity**: Dedicated space for Maddala Varshini's real profile photograph and official PDF resume with honest, transparent placeholders. No fictional past employment or fake ratings.

---

## 📁 Project Architecture & Routes

```text
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # Root layout with SEO metadata & light theme
│   │   ├── globals.css                 # Design tokens, variables & focus styles
│   │   ├── not-found.tsx               # Custom 404 page for missing or unpublished routes
│   │   ├── page.tsx                    # Route 1: Home (Hero, About, Projects, Skills)
│   │   ├── about/page.tsx              # Route 2: About Me (Education, Goals, Strengths)
│   │   ├── projects/page.tsx           # Route 3: Projects gallery (Search, category filter, sorting)
│   │   ├── projects/[slug]/page.tsx    # Route 4: Individual project details (17 fields, dual video)
│   │   ├── skills/page.tsx             # Route 5: Skills & technologies (Categorized, no fake %)
│   │   ├── certifications/page.tsx     # Route 6: Certifications & in-progress coursework
│   │   ├── experience/page.tsx         # Route 7: Lab work, academic research & internships
│   │   ├── resume/page.tsx             # Route 8: Resume preview & honest PDF download handler
│   │   ├── vlogs/page.tsx              # Route 9: Personal videos & accessible video modal
│   │   ├── contact/page.tsx            # Route 10: Verified contact channels & secure form
│   │   └── admin/
│   │       ├── layout.tsx              # Admin shell layout with responsive mobile drawer
│   │       ├── page.tsx                # Admin Dashboard overview & real counts
│   │       ├── login/page.tsx          # Secure login portal (Show/hide password, error handling)
│   │       ├── unauthorized/page.tsx   # 403 Forbidden screen for non-owner authenticated users
│   │       ├── profile/page.tsx        # Profile management & portrait placeholder
│   │       ├── projects/page.tsx       # Projects management foundation
│   │       ├── skills/page.tsx         # Skills management foundation
│   │       ├── certifications/page.tsx # Certifications management foundation
│   │       ├── experience/page.tsx     # Experience management foundation
│   │       ├── resume/page.tsx         # Resume PDF management foundation
│   │       ├── media/page.tsx          # Media library storage foundation
│   │       ├── vlogs/page.tsx          # Personal vlogs management foundation
│   │       ├── content-blocks/page.tsx # Reusable content blocks foundation
│   │       └── settings/page.tsx       # System preferences & security audits
│   ├── components/
│   │   ├── ui/                         # Reusable UI primitives (Button, Card, Badge, EmptyState, SectionHeader)
│   │   ├── public/                     # Public Header, Footer, ProjectCard, VlogCard, VlogModal
│   │   └── admin/                      # AdminSidebar, AdminHeader
│   ├── lib/
│   │   ├── auth/adminAuth.ts           # Server-side owner allowlist & open-redirect sanitization
│   │   ├── data/portfolioData.ts       # Structured authentic profile store & initial records
│   │   ├── services/portfolioService.ts# Data access layer strictly filtering published records
│   │   └── supabase/                   # Supabase browser, server, and middleware session helpers
│   ├── types/index.ts                  # TypeScript interfaces and data models
│   └── middleware.ts                   # Route protection boundary for /admin/*
├── supabase/
│   └── schema.sql                      # Complete PostgreSQL schema with Row Level Security (RLS) & Storage
├── .env.example                        # Template for Supabase credentials & ADMIN_EMAIL
├── tailwind.config.ts                  # Custom color tokens & shadows
└── tsconfig.json                       # TypeScript compiler options
```

---

## 🔒 Security Architecture & Authorization Flow

### Two User Roles
1. **Public Visitors**:
   - Strictly restricted to `SELECT` operations on published records (`status = 'published'`).
   - Draft projects and unlisted videos are **never rendered** on public routes.
   - Any attempt to access `/admin/*` redirects to `/admin/login`.
2. **Portfolio Owner (Maddala Varshini)**:
   - Authenticated through Supabase Auth.
   - Validated against the server-side environment allowlist: `ADMIN_EMAIL`.
   - If an authenticated account does not match `ADMIN_EMAIL`, access is terminated with a **403 Forbidden** screen at `/admin/unauthorized`.
   - Full `INSERT`, `UPDATE`, and `DELETE` privileges enforced by database Row Level Security.

### Open-Redirect Defense
- Redirect query parameters (e.g. `/admin/login?redirect=...`) are sanitized using `sanitizeAdminRedirect()`.
- Protocol-relative URLs (`//evil.com`), external URIs, and loop redirects are immediately stripped and defaulted to `/admin`.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.17+ or v20+ (Tested on v24.11.1)
- **npm**: v9+ (Tested on v11.6.2)

### 2. Installation
```bash
npm install
```

### 3. Environment Configuration
Copy `.env.example` to create your local environment file:
```bash
cp .env.example .env.local
```
Fill in your Supabase project keys and administrator email:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-supabase-service-role-key
NEXT_PUBLIC_SITE_URL=http://localhost:3000
ADMIN_EMAIL=maddalavarshini@example.com
```

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🛡️ Database & Administrator Setup Guide

### 1. Database Migration
1. Go to your [Supabase Dashboard](https://supabase.com).
2. Open the **SQL Editor** tab.
3. Open `supabase/schema.sql` from this repository.
4. Run the script. This sets up:
   - 12 core tables (`profiles`, `projects`, `project_media`, `skills`, `certifications`, `experience`, `education`, `resume_records`, `vlogs`, `contact_messages`, `site_settings`, `admin_users`).
   - **Row Level Security (RLS)** on all tables.
   - Storage RLS policies for `portfolio-assets`, `resumes`, and `vlog-media`.

### 2. Establish the Owner Account
1. In your Supabase Dashboard, go to **Authentication** > **Users**.
2. Click **Add User** > **Create User**.
3. Enter your administrator email (matching `ADMIN_EMAIL` in `.env.local`) and a secure password.
4. Sign in at [http://localhost:3000/admin/login](http://localhost:3000/admin/login).
5. Only this account can access the admin dashboard. Any other account will receive an Unauthorized message.

---

## 🧪 Verification & Build Checks

To verify code quality and build stability:

```bash
# Run linting (0 errors, 0 warnings)
npm run lint

# Type check & production build (21 static pages generated)
npm run build
```

---

## 🚢 Deploying to Vercel

1. Push your code to a GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "feat: portfolio foundation, public pages, and secure admin authentication"
   git remote add origin https://github.com/maddalavarshini/maddala-varshini-portfolio.git
   git push -u origin main
   ```
2. Import the repository in [Vercel](https://vercel.com).
3. Under **Environment Variables**, add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL`
   - `ADMIN_EMAIL` (your owner email)
4. Click **Deploy**.
