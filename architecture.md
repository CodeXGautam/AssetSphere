# AssetSphere — Architecture & Design

## 1. Overview

AssetSphere is a **multi-tenant, single-deployment SaaS application** built entirely on Next.js 15 (App Router). There is no separate backend process — the same Next.js server handles SSR, client-side navigation, and all REST API endpoints via Route Handlers. The database is MongoDB (Mongoose), hosted externally (MongoDB Atlas in production).

```
Browser ──► Next.js Server (Vercel Serverless / Node.js)
                ├── App Router Pages (SSR / RSC / Client Components)
                ├── Route Handlers  (REST API, /api/*)
                └── Edge Middleware (auth guards, redirects)
                        │
                        ├── MongoDB Atlas  (via Mongoose)
                        ├── Cloudinary     (image CDN)
                        └── SendGrid       (transactional email)
```

---

## 2. High-Level Architecture

### 2.1 Request Lifecycle

```
Request
  │
  ├─ Edge Middleware (src/middleware.ts)
  │     • JWT session check (NextAuth edge-safe config)
  │     • Route guards: public / protected / org-admin / superadmin
  │     • Redirects unauthenticated users to /login
  │
  ├─ Next.js App Router
  │     • Page components (RSC or Client Components)
  │     • Layouts (auth group, dashboard shell, landing shell)
  │
  └─ API Route Handlers (/api/*)
        • Auth session check (server-side, via auth())
        • Zod schema validation
        • Service layer call
        • Mongoose / MongoDB query
        • Response
```

### 2.2 Layer Diagram

```
┌─────────────────────────────────────┐
│           UI (React / TSX)          │  Client Components, Framer Motion,
│   Pages · Layouts · Components      │  Tailwind CSS, Recharts, Lucide
└────────────────┬────────────────────┘
                 │  fetch / React Query
┌────────────────▼────────────────────┐
│         API Route Handlers          │  /api/** — Next.js Route Handlers
│   Auth check · Zod validation       │  Edge-compatible where needed
└────────────────┬────────────────────┘
                 │  service calls
┌────────────────▼────────────────────┐
│           Service Layer             │  src/services/*
│  Business logic, orchestration,     │  Calls models, sends emails,
│  audit logging, notifications       │  writes audit logs
└────────────────┬────────────────────┘
                 │  Mongoose models
┌────────────────▼────────────────────┐
│           Data Models               │  src/models/*  (Mongoose schemas)
│  User · Org · Asset · Booking       │
│  Category · Invite · Notification   │
│  AuditLog                           │
└────────────────┬────────────────────┘
                 │
┌────────────────▼────────────────────┐
│           MongoDB Atlas             │  Persistent data store
└─────────────────────────────────────┘
```

---

## 3. Domain Model

### 3.1 Entities & Relationships

```
Organisation ─── (1:N) ──► User          (orgId FK on User)
Organisation ─── (1:N) ──► Asset
Organisation ─── (1:N) ──► Category
Organisation ─── (1:N) ──► Invite

Asset ──── (N:1) ──► Category
Asset ──── (1:N) ──► Booking

Booking ─── (N:1) ──► User
Booking ─── (N:1) ──► Asset

User ──── (1:N) ──► Notification
User ──── (1:N) ──► AuditLog  (as actor)
```

### 3.2 Schema Summary

**User**
```
name, email (unique), passwordHash
orgId       → Organisation (nullable — superadmin has no org)
orgRole     → "ORG_ADMIN" | "MEMBER" | null
isSuperAdmin → Boolean
```

**Organisation**
```
name, slug (unique), email
founderId   → User
status      → "PENDING" | "ACTIVE" | "REJECTED"
rejectedReason (optional)
```

**Asset**
```
name (text-indexed), description (text-indexed)
category    → Category
orgId       → Organisation
imageUrl    (Cloudinary URL)
totalQuantity, availableQuantity
condition   → "EXCELLENT" | "GOOD" | "FAIR" | "NEEDS_REPAIR"
status      → "ACTIVE" | "MAINTENANCE" | "RETIRED"
```

**Booking**
```
userId      → User
assetId     → Asset
quantity, purpose
startDate, endDate
status      → "PENDING" | "APPROVED" | "REJECTED" | "ISSUED" | "RETURNED" | "OVERDUE"
```

**Category** — `name` (unique per org), `orgId`, `description`

**Invite** — `email`, `orgId`, `invitedBy`, `token` (unique), `expiresAt`, `acceptedAt`

**Notification** — `userId`, `type`, `subject`, `message`, `readAt`

**AuditLog** — `actorId`, `action`, `entity`, `entityId`, `metadata`

---

## 4. Authentication & Authorization

### 4.1 Authentication

- **Provider:** NextAuth v5, Credentials strategy (email + bcrypt password hash)
- **Session:** JWT (stored in an httpOnly cookie), 24-hour TTL
- **JWT payload:** `id`, `orgId`, `orgRole`, `isSuperAdmin`
- **Edge-safe config** (`auth.config.ts`) is imported by the Edge Middleware; the full NextAuth init (`auth.ts`) is Node-only and imports Mongoose/bcrypt

### 4.2 Role Hierarchy

```
SUPERADMIN > ORG_ADMIN > MEMBER
```

| Principal | Guard location | What they can do |
|---|---|---|
| Unauthenticated | Middleware | Public pages only (/login, /register, /onboard, /invite/*, landing) |
| MEMBER | Middleware + API | /dashboard, /assets, /bookings, /notifications |
| ORG_ADMIN | Middleware + API | All member pages + /admin/* |
| SUPERADMIN | Middleware + API | Everything + /superadmin/* |

### 4.3 Permission Helpers (`src/lib/permissions.ts`)

Thin, side-effect-free helpers imported by API route handlers:
- `isSuperAdmin(flag)` — platform-level check
- `isOrgAdmin(orgRole)` — org-level admin check
- `canManageAssets(flag, orgRole)` — superadmin OR org admin

---

## 5. API Design

All API routes follow REST conventions and live under `/api/`.

### 5.1 Conventions

- Every handler calls `auth()` to retrieve the session; returns `401` if no session, `403` if insufficient role
- Request bodies are validated with **Zod** (`src/validators/`) before hitting the service layer
- Errors are returned as `{ error: string }` JSON with the appropriate HTTP status code
- Service functions throw typed `AppError` (from `src/lib/errors.ts`) which handlers catch and translate

### 5.2 Multi-tenancy Isolation

Every MongoDB query that touches org-scoped data includes `orgId` from the session JWT. This prevents cross-org data access without relying solely on application-level checks.

### 5.3 Booking State Machine

```
           ┌────────────────────────────┐
           │                            │
  [create] │    PENDING                 │
           │       │                    │
           │   ┌───┴──────┐             │
           │   ▼          ▼             │
           │ APPROVED   REJECTED        │
           │   │                        │
           │   ▼                        │
           │ ISSUED                     │
           │   │                        │
           │   ├──► RETURNED            │
           │   └──► OVERDUE             │
           └────────────────────────────┘
```

`availableQuantity` on the asset is decremented on `APPROVED` (or `ISSUED`) and restored on `RETURNED` or `REJECTED`.

---

## 6. Data Flow — Key Features

### 6.1 Organisation Onboarding

```
User fills /onboard form
  → POST /api/orgs
  → Creates Organisation (status=PENDING) + User (ORG_ADMIN)
  → Sends email to SUPERADMIN_EMAIL via SendGrid
  → Superadmin visits /superadmin/orgs
  → PATCH /api/superadmin/orgs/[id]  { action: "approve" | "reject" }
  → Organisation status updated
  → Approval/rejection email sent to founder
```

### 6.2 Member Invite Flow

```
Org admin enters email in /admin/members
  → POST /api/orgs/invite
  → Invite record created (token, 48h TTL)
  → Invite email sent with /invite/<token> link
  → Invitee visits link → GET /api/invite/[token] (validates)
  → Invitee fills register form → POST /api/auth/register
  → User created, orgId + orgRole="MEMBER" set
  → Invite.acceptedAt stamped
```

### 6.3 Asset Booking

```
Member visits /assets
  → GET /api/assets  (filtered by orgId, status=ACTIVE)
  → Selects asset, fills booking form (dates, quantity, purpose)
  → POST /api/bookings
  → Booking created (status=PENDING)
  → In-app notification created for org admins
  → Admin visits /admin/bookings
  → PATCH /api/bookings/[id]  { status: "APPROVED" }
  → availableQuantity decremented
  → Member receives in-app notification
```

### 6.4 Image Upload

```
Admin attaches image in asset form
  → POST /api/assets/upload  (multipart/form-data)
  → Server streams to Cloudinary SDK (server-side, no browser SDK)
  → Returns { url } — stored as asset.imageUrl
  → next.config.ts allowlists res.cloudinary.com for next/image optimisation
```

---

## 7. Frontend Architecture

### 7.1 Rendering Strategy

| Route type | Strategy | Reason |
|---|---|---|
| Landing page | Static / RSC | No auth needed, SEO |
| Dashboard / admin pages | Client Component | Live data via fetch + React Query |
| Auth pages | Client Component | Form state |
| API routes | Server (Route Handler) | Data access, auth |

### 7.2 Component Organisation

```
src/components/
├── ui/           Pure design-system primitives (no business logic)
├── dashboard/    Layout shell, sidebar, topbar, stat cards
├── assets/       Asset card, filters, condition badge
├── bookings/     Booking table, status badge
├── charts/       Thin wrappers around Recharts
├── forms/        Business forms (booking request, auth, QR scanner)
├── landing/      All marketing-page sections
├── magic/        Visual effect components (glow, gradient text)
├── aceternity/   Decorative background effects (spotlight, orbs)
└── providers/    AppProviders — wraps SessionProvider + QueryClientProvider
```

### 7.3 Styling

- **Tailwind CSS v4** with `@tailwindcss/postcss`
- CSS custom properties for theming (`--primary`, `--border`, `--card`, `--muted-fg`, etc.)
- `clsx` + `tailwind-merge` via `cn()` utility for conditional class composition
- `class-variance-authority` for component variants (buttons, badges)
- Animations: `framer-motion` for page transitions and list animations; `tailwindcss-animate` for simple CSS animations

---

## 8. Infrastructure & Deployment

### 8.1 Production (Vercel)

```
GitHub push → Vercel CI
  → next build (static analysis + route compilation)
  → Deploy to Vercel Edge Network
  → Serverless functions per route
  → MongoDB Atlas (separate, managed)
  → Cloudinary (CDN for images)
  → SendGrid (email delivery)
```

- **No separate backend server** — all API logic runs as Vercel Serverless Functions
- **Edge Middleware** (`src/middleware.ts`) runs on Vercel's Edge Runtime for auth guards with minimal latency
- **Static assets** served from Vercel's CDN (`public/`)
- **next/image** optimisation enabled for `res.cloudinary.com`

### 8.2 Local / Docker

```
docker compose up
  → assetsphere container  (next build + next start, port 3000)
  → mongodb container       (port 27017, volume: mongo_data)
```

Both services are on a shared `assetsphere_net` bridge network. The app container waits for MongoDB to be healthy before starting.

---

## 9. Security Considerations

| Concern | Mitigation |
|---|---|
| Password storage | `bcryptjs` with default cost factor (10) |
| Session forgery | NextAuth JWT signed with `AUTH_SECRET` |
| Cross-org data access | Every query scoped by `orgId` from JWT |
| Invite token brute-force | Cryptographically random token (`crypto.randomBytes`), 48h TTL |
| Input validation | Zod schemas on every API route before any DB call |
| Route access | Edge Middleware + per-handler role checks (defence in depth) |
| Image uploads | Server-side Cloudinary SDK — API secret never exposed to browser |
| Superadmin seed | One-time endpoint gated by `SEED_SECRET` env variable |
| Cookie security | NextAuth sets `httpOnly`, `sameSite=lax` cookies by default |

---

## 10. Assumptions & Design Decisions

1. **Single codebase, no microservices.** The scope is a startup/team-sized asset tracker. A monolith is simpler to deploy, debug, and reason about at this scale.

2. **MongoDB over a relational DB.** Asset and booking documents have flexible metadata fields and the schema evolves frequently during development. Mongoose provides enough structure while allowing flexibility.

3. **JWT sessions (not database sessions).** Reduces DB round-trips on every request. The trade-off is that tokens cannot be individually invalidated before expiry — acceptable given the 24-hour TTL and non-critical data sensitivity.

4. **No separate admin frontend.** Superadmin and org-admin UIs are part of the same Next.js app, gated by role. This keeps deployment simple.

5. **SendGrid and Cloudinary are optional.** The app degrades gracefully (logs a warning and continues) when their keys are absent. This allows the app to run in a bare-bones local environment without external accounts.

6. **Quantity accounting is optimistic.** `availableQuantity` is updated synchronously inside the booking service. A concurrent booking for the last unit could occasionally over-commit. For the expected load (internal org use), this is an acceptable trade-off over introducing distributed locking.

7. **Soft retirement for assets.** Assets are never hard-deleted — they are set to `RETIRED` status. Booking history referencing them remains intact.

8. **Organisations are manually approved.** Self-service onboarding with a superadmin approval gate prevents spam and gives control over who gets access to the platform.

9. **In-app notifications are DB-backed.** Polling via React Query on the notification centre. Real-time delivery (WebSockets/SSE) is intentionally out of scope for v1.

10. **Audit logs are append-only.** No update or delete API exists for audit logs. They are written by the service layer and surfaced read-only to org admins.
