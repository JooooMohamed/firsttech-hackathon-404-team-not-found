# EasyPoints

**The Unified Loyalty Platform for UAE SMEs**

EasyPoints is a full-stack mobile loyalty platform that lets UAE consumers see all their loyalty balances in one wallet and earn/redeem points at local SME merchants via QR codes — no hardware, no POS integration needed.

---

## Features

### For Customers (Member)

- **Unified Wallet** — View EasyPoints balance alongside linked programs (Share, Etihad Guest, Emirates Skywards, Aura)
- **QR Earn** — Show a QR code at any partner merchant to earn points after paying
- **QR Redeem** — Generate a redeem code, present to staff, spend points for discounts
- **Offers & Promotions** — Browse active deals from partner merchants (bonus multipliers, freebies)
- **Transaction History** — Full earn/redeem history with merchant details

### For Staff

- **Issue Points** — Enter member code + bill amount to credit EasyPoints
- **Validate Redemptions** — Look up redeem codes and process point deductions
- **Staff Management** — Add/remove staff members by email

### For Admins / Business Owners

- **Self-Service Onboarding** — Register a business in-app, set earn rates, go live in minutes
- **Analytics Dashboard** — Total points issued/redeemed, active members, daily trends
- **Offer Management** — Create bonus, discount, and freebie promotions
- **Merchant Configuration** — Earn rates, bonus multipliers, min spend, cross-SME redemption toggle

### Security & Quality

- JWT authentication with bcrypt password hashing
- Role-based access control (RBAC) — member, staff, admin
- Crypto-secure QR tokens (no Math.random)
- QR session replay prevention
- Rate limiting (60 req/min global)
- CORS origin restriction
- IDOR prevention on earn/redeem (userId from QR session, not request body)
- Joi validation on all endpoints
- Error boundaries + graceful degradation
- 170+ automated API tests

---

## Tech Stack

| Layer          | Technology                                                    |
| -------------- | ------------------------------------------------------------- |
| **Mobile**     | React Native 0.73 · TypeScript · Zustand · React Navigation 6 |
| **Backend**    | NestJS 10 · Mongoose 8 · Passport JWT · @nestjs/throttler     |
| **Database**   | MongoDB (local or Atlas)                                      |
| **Validation** | Joi (server) · Zod + React Hook Form (mobile)                 |
| **QR**         | react-native-qrcode-svg · crypto.randomBytes                  |

---

## Project Structure

```
EasyPoints/
├── server/                    # NestJS backend
│   ├── src/
│   │   ├── common/            # Guards (RBAC), validation pipes
│   │   ├── config/            # ConfigService (env validation)
│   │   ├── dto/               # Joi validation schemas
│   │   ├── modules/
│   │   │   ├── auth/          # Login, register, JWT strategy
│   │   │   ├── merchants/     # CRUD, staff management, onboarding
│   │   │   ├── offers/        # CRUD with role guards
│   │   │   ├── programs/      # Link/unlink loyalty programs
│   │   │   ├── qr/            # QR session create/lookup/complete
│   │   │   ├── seed/          # Auto-seed on first boot
│   │   │   ├── transactions/  # Earn, redeem, stats, history
│   │   │   ├── users/         # Profile, consent
│   │   │   └── wallets/       # Balance management
│   │   └── schemas/           # Mongoose schemas
│   └── .env                   # Environment config (not committed)
├── mobile/                    # React Native app
│   ├── src/
│   │   ├── components/        # Button, TextInput, BalanceCard, ErrorBoundary, etc.
│   │   ├── constants/         # Colors, spacing, API URL
│   │   ├── navigation/        # RootNavigator, Member/Staff/Admin stacks
│   │   ├── screens/           # 15+ screens organized by role
│   │   ├── services/          # Axios API client
│   │   ├── stores/            # Zustand stores (auth, wallet, QR, notifications)
│   │   └── types/             # TypeScript interfaces
│   └── ios/ android/          # Native projects
├── test-all.sh                # 170+ API integration tests
├── demo-reset.sh              # One-command DB reset for demos
├── DEMO_SCRIPT.md             # Live demo walkthrough
├── PITCH_DECK.md              # 12-slide pitch outline
└── SCREEN_RECORDING_GUIDE.md  # Video recording guide
```

---

## Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **MongoDB** running locally (or Atlas URI in `.env`)
- **Xcode** (for iOS) or **Android Studio** (for Android)
- **CocoaPods** (iOS only): `gem install cocoapods`

### 1. Clone & Install

```bash
# Server
cd server
cp .env.example .env     # Edit if needed
npm install
npm run build

# Mobile
cd ../mobile
npm install
cd ios && pod install && cd ..
```

### 2. Start the Server

```bash
cd server
node dist/main.js
# → EasyPoints API running on http://localhost:3000/api
# → Database auto-seeds on first boot (3 merchants, 3 users, offers)
```

### 3. Run the Mobile App

```bash
cd mobile

# iOS
npx react-native run-ios --simulator="iPhone 15 Pro"

# Android (use API 34 emulator — API 35 has 16KB page size issues with RN 0.73)
npx react-native run-android
```

### 4. Run Tests

```bash
# From project root (server must be running)
bash test-all.sh
```

---

## Demo Accounts

| Name          | Email            | Password | Roles                  |
| ------------- | ---------------- | -------- | ---------------------- |
| youssef Ahmed | youssef@demo.com | demo123  | Member                 |
| Hafez Hassan  | hafez@demo.com   | demo123  | Member + Staff         |
| Farag Ali     | farag@demo.com   | demo123  | Member + Staff + Admin |

---

## Seed Merchants

| Merchant      | Logo | Earn Rate           | Min Spend | Category        |
| ------------- | ---- | ------------------- | --------- | --------------- |
| Café Beirut   | ☕   | 10 EP/AED           | —         | Food & Beverage |
| Bloom Flowers | 🌸   | 15 EP/AED           | 50 AED    | Gifts & Flowers |
| FreshMart     | 🛒   | 5 EP/AED (2× bonus) | —         | Grocery         |

---

## API Endpoints

### Auth

| Method | Endpoint             | Auth |
| ------ | -------------------- | ---- |
| POST   | `/api/auth/register` | —    |
| POST   | `/api/auth/login`    | —    |

### Users

| Method | Endpoint                | Auth |
| ------ | ----------------------- | ---- |
| GET    | `/api/users/me`         | JWT  |
| PATCH  | `/api/users/me`         | JWT  |
| PATCH  | `/api/users/me/consent` | JWT  |

### Merchants

| Method | Endpoint                           | Auth              |
| ------ | ---------------------------------- | ----------------- |
| GET    | `/api/merchants`                   | —                 |
| GET    | `/api/merchants/:id`               | —                 |
| POST   | `/api/merchants`                   | JWT + staff/admin |
| PATCH  | `/api/merchants/:id`               | JWT + staff/admin |
| POST   | `/api/merchants/register`          | JWT               |
| GET    | `/api/merchants/:id/staff`         | JWT + staff/admin |
| POST   | `/api/merchants/:id/staff`         | JWT + staff/admin |
| DELETE | `/api/merchants/:id/staff/:userId` | JWT + staff/admin |

### Transactions

| Method | Endpoint                                     | Auth              |
| ------ | -------------------------------------------- | ----------------- |
| POST   | `/api/transactions/earn`                     | JWT + staff/admin |
| POST   | `/api/transactions/redeem`                   | JWT + staff/admin |
| GET    | `/api/transactions/my`                       | JWT               |
| GET    | `/api/transactions/merchant/:id`             | JWT + staff/admin |
| GET    | `/api/transactions/merchant/:id/stats`       | JWT + staff/admin |
| GET    | `/api/transactions/merchant/:id/stats/daily` | JWT + staff/admin |

### QR Sessions

| Method | Endpoint                  | Auth |
| ------ | ------------------------- | ---- |
| POST   | `/api/qr/create`          | JWT  |
| GET    | `/api/qr/:token`          | JWT  |
| PATCH  | `/api/qr/:token/complete` | JWT  |

### Programs

| Method | Endpoint                  | Auth |
| ------ | ------------------------- | ---- |
| GET    | `/api/programs/my`        | JWT  |
| GET    | `/api/programs/available` | JWT  |
| POST   | `/api/programs/link`      | JWT  |
| DELETE | `/api/programs/:id`       | JWT  |

### Offers

| Method | Endpoint                   | Auth              |
| ------ | -------------------------- | ----------------- |
| GET    | `/api/offers/active`       | JWT               |
| GET    | `/api/offers/merchant/:id` | JWT               |
| POST   | `/api/offers`              | JWT + staff/admin |
| PATCH  | `/api/offers/:id`          | JWT + staff/admin |
| DELETE | `/api/offers/:id`          | JWT + admin       |

---

## Environment Variables

```env
MONGODB_URI=mongodb://localhost:27017/easypoints
JWT_SECRET=your-secret-here
JWT_EXPIRES_IN=7d
PORT=3000
```

---

## License

Built for a hackathon — March 2026.
