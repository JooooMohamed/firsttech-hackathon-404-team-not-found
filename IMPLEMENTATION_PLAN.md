# EasyPoints — 18-Feature Implementation Plan

## Context

The business plan describes 6 phases of features. Phase 1 (MVP) is mostly complete but the codebase diverges from the plan's tech stack (MongoDB/React Native vs planned PostgreSQL/web). The user wants to implement 18 features spanning infrastructure, backend, mobile, and architecture. These are organized into 4 phases by dependency order.

---

## Phase A: Foundation (No Dependencies — Do First)

### A1. Monorepo with pnpm workspaces [M]
Create root `pnpm-workspace.yaml`, `package.json`, `.npmrc` (shamefully-hoist=true for RN).  
Create `packages/shared/` with extracted TypeScript types from `mobile/src/types/index.ts`.  
Update `mobile/metro.config.js` (watchFolders), `mobile/babel.config.js` (module resolver).  
Update `server/Dockerfile` and `render.yaml` for monorepo context.  
Delete `package-lock.json` files, run `pnpm import` then `pnpm install`.

### A2. Restrict CORS [S]
Modify `server/src/main.ts`: replace `origin: true` with whitelist from `CORS_ORIGINS` env var.  
Add `corsOrigins` getter to `server/src/config/config.service.ts`.  
Allow requests with no Origin header (mobile/curl).  
Update `.env.example` and `render.yaml`.

### A3. Add merchant status field [S]
Add `status: 'ACTIVE' | 'PAUSED' | 'ONBOARDING'` to merchant schema (default: ACTIVE).  
Filter `findAll()` to ACTIVE by default. Set ONBOARDING in `registerMerchant()`.  
Check status in `earn()`/`redeem()` — reject if PAUSED.  

### A4. Unit tests foundation [M]
Add `@nestjs/testing`, `jest`, `ts-jest` to server devDeps.  
Create `server/jest.config.ts`. Uses live MongoDB database.  
Write spec files for: wallets, transactions, auth, merchants, qr, roles guard.  

---

## Phase B: Core Infrastructure (Depends on A)

### B1. HMAC QR signing [M] → depends on A4
Replace random tokens with HMAC-SHA256 signed payloads.  
QR payload: `{ userId, merchantId, type, amount, nonce (nanoid), exp, sig }`.  
Server verifies HMAC without DB lookup, then checks nonce in DB for replay.  

### B2. Cursor-based pagination [M] → depends on A1, A4
Response shape: `{ items: T[], nextCursor: string | null, hasMore: boolean }`.  
Apply to: transactions, merchants, offers, programs.  
Keep `page/limit` as deprecated fallback.

### B3. Magic link email [L] → depends on A4
New modules: EmailModule (nodemailer), MagicLink schema.  
Endpoints: `POST /auth/magic-link`, `POST /auth/magic-link/verify`.  
Keep password auth as fallback.

### B4. Real-time WebSocket events [L] → depends on A4
Socket.IO gateway (conditional for Vercel). Rooms: user/merchant.  
Emit after earn/redeem. Mobile: socket.io-client + socketStore.

### B5. Admin-configurable rates + audit trail [M] → depends on A3, A4
New collection: audit_logs. Admin endpoints for rate changes.

### B6. Merchant switcher [M] → depends on A3, A4
New collection: staff_assignments. Multi-merchant support.  
Endpoints: `GET /merchants/my-assignments`, `POST /merchants/switch/:merchantId`.

---

## Phase C: Business Features (Depends on B)

### C1. Tier system [L] → depends on B5
Bronze/Silver/Gold/Platinum. Lifetime EP tracking, auto-upgrade, earn multipliers.

### C2. EPU exchange engine [XL] → depends on B5, C1
Double-entry ledger, 3-5% conversion fee, MongoDB transactions.  
Endpoints: quote, execute, history.

### C3. Dual earning [L] → depends on C2, B4
Partner points + EasyPoints simultaneously at partner merchants.

### C4. Campaigns engine [L] → depends on B5, B4
Supersedes Offers. Targeting rules, geofence, time-limited events.

### C5. Push notifications [L] → depends on B3, B4
Firebase FCM + APNs. Device token management.

### C6. A/B testing [M] → depends on B5
Feature flags with sticky variant assignment.

---

## Phase D: Advanced / Native Features (Depends on C)

### D1. NFC tap-to-earn [XL] → depends on B1, B4, C1
Reuses HMAC payload. HCE on Android, Core NFC on iOS.

### D2. Arabic RTL / KSA expansion [XL] → depends on all screens
i18next, RTL layout, SAR currency support. Done last.

---

## Dependency Graph

```
A1 Monorepo ──────┐
A2 CORS ──────────┤ (all independent, do in parallel)
A3 Merchant status┤
A4 Unit tests ────┘
        │
        ▼
B1 HMAC QR ────────── A4
B2 Cursor pagination── A1, A4
B3 Magic link ──────── A4
B4 WebSocket ───────── A4
B5 Admin rates ─────── A3, A4
B6 Merchant switcher── A3, A4
        │
        ▼
C1 Tiers ──────────── B5
C2 EPU exchange ───── B5, C1
C3 Dual earning ───── C2, B4
C4 Campaigns ──────── B5, B4
C5 Push notifs ────── B3, B4
C6 A/B testing ────── B5
        │
        ▼
D1 NFC ────────────── B1, B4, C1
D2 Arabic RTL ─────── all screens done
```

## New MongoDB Collections (10 total)
magic_links, audit_logs, staff_assignments, tier_configs, ledger_entries, exchange_transactions, campaigns, device_tokens, feature_flags, flag_assignments
