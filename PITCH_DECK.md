# EasyPoints — Pitch Deck

> **Format:** 12 slides, ~8 minute presentation
> **Audience:** Hackathon judges, investors, accelerator reviewers

---

## Slide 1 — Title

**EasyPoints**
_The Unified Loyalty Platform for UAE SMEs_

- Logo / app icon
- Team name & members
- Hackathon name & date

---

## Slide 2 — The Problem

**Loyalty in the UAE is broken.**

- 🇦🇪 UAE consumers juggle **5+ loyalty programs** (Share, Etihad Guest, Skywards, Aura…)
- 📊 **68% of loyalty points expire unused** — billions in value lost
- 🏪 **SMEs can't compete** — building a loyalty program costs $50K+
- 🔒 Balances are **siloed** — you can't see or combine them

_Visual: scattered logos of UAE loyalty programs → unified EasyPoints wallet_

---

## Slide 3 — The Solution

**EasyPoints: One wallet. Every program. Every SME.**

Three core pillars:

1. **Unified Dashboard** — See Share, Etihad Guest, Skywards, Aura + EasyPoints in one view
2. **Instant SME Loyalty** — Any small business goes live in minutes with QR-based earn/redeem
3. **Cross-SME Points** — Earn at a café, redeem at a florist. One currency, many merchants

_Visual: app screenshot showing the unified balance dashboard_

---

## Slide 4 — How It Works (Customer)

**youssef's Experience:**

```
1️⃣  Open EasyPoints → See all balances (EasyPoints + linked programs)
2️⃣  Visit Café Beirut → Tap "Earn" → Show QR to cashier
3️⃣  Cashier enters code + bill amount → 500 EP credited instantly
4️⃣  Later at Bloom Flowers → Redeem 200 EP for a discount
```

_Visual: 4-step flow diagram with app screenshots_

---

## Slide 5 — How It Works (Merchant)

**Hafez's Experience (Staff):**

```
1️⃣  Customer shows QR code
2️⃣  Hafez enters the 6-digit code + bill amount
3️⃣  Points calculated automatically (earn rate × amount)
4️⃣  Confirm → Points issued, both parties notified
```

**No hardware needed.** No POS integration. No SDK. Just the app.

_Visual: staff screen flow screenshots_

---

## Slide 6 — How It Works (Business Owner)

**Farag's Experience (Admin):**

```
1️⃣  Register business in-app (name, category, earn rate)
2️⃣  Invite staff by email
3️⃣  Monitor: points issued, redeemed, active members, daily trends
4️⃣  Create offers & promotions to drive traffic
```

**Zero-to-live in under 5 minutes.**

_Visual: admin dashboard with stats and bar chart_

---

## Slide 7 — Key Differentiators

| Feature               | Traditional Loyalty | EasyPoints                           |
| --------------------- | ------------------- | ------------------------------------ |
| Setup cost            | $50K+               | Free (self-service)                  |
| Integration time      | Months              | 5 minutes                            |
| Hardware required     | POS terminals       | Just a phone                         |
| Cross-merchant        | No                  | Yes — earn anywhere, redeem anywhere |
| Program aggregation   | No                  | Yes — see all balances unified       |
| Minimum business size | Enterprise          | Any SME                              |

---

## Slide 8 — Product Demo

> **[LIVE DEMO — see DEMO_SCRIPT.md]**
>
> Walk through: Onboarding → Login → Dashboard → Browse merchants →
> Earn QR → Staff earn → Admin dashboard → Offers

---

## Slide 9 — Technical Architecture

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────┐
│  React Native    │────▶│  NestJS API      │────▶│ MongoDB  │
│  iOS/Android     │ JWT │  REST + Guards   │     │ Atlas    │
│  Zustand State   │◀────│  Throttler       │◀────│          │
└─────────────────┘     └──────────────────┘     └──────────┘
```

**Tech stack:**

- **Mobile:** React Native 0.73 + TypeScript + Zustand + React Navigation
- **Backend:** NestJS 10 + Mongoose + JWT + Passport
- **Database:** MongoDB (document model, compound indexes)
- **Security:** bcrypt, crypto QR tokens, RBAC, rate limiting, CORS

**Quality:**

- 146 automated API tests
- Joi validation on all endpoints
- Error boundaries + graceful degradation
- Skeleton loaders + animated transitions

---

## Slide 10 — Market Opportunity

- 🇦🇪 **350,000+ SMEs** in the UAE (2025, Ministry of Economy)
- 💰 **$2.8B** loyalty market in GCC (projected 2026)
- 📈 **43%** of UAE consumers say they'd shop more at businesses with loyalty programs
- 🏪 **<5%** of UAE SMEs have any loyalty program today

**TAM:** 350K SMEs × $200/mo subscription = **$840M/year**

---

## Slide 11 — Business Model

**Freemium SaaS:**

| Tier           | Price      | Features                                        |
| -------------- | ---------- | ----------------------------------------------- |
| **Starter**    | Free       | 1 merchant, 100 members, basic earn/redeem      |
| **Growth**     | 99 AED/mo  | Unlimited members, offers, cross-SME, analytics |
| **Enterprise** | 499 AED/mo | API access, white-label, dedicated support      |

**Additional revenue:**

- Transaction fees (0.5% on redemptions)
- Featured placement in merchant directory
- Program integration partnerships (Share, Etihad, etc.)

---

## Slide 12 — Ask & Next Steps

**What we've built:**
✅ Full-stack MVP — iOS app + API + database
✅ 3 user roles (member, staff, admin) with live role switching
✅ Real QR-based earn/redeem flow
✅ Multi-program wallet aggregation
✅ Merchant self-onboarding
✅ 146 passing tests

**What's next:**

- 🤖 AI-powered personalized offers
- 📲 Android launch
- 🔌 POS integration partnerships
- 🏦 Bank/fintech partnerships for point-to-cash conversion
- 🌍 GCC expansion (KSA, Bahrain, Qatar)

**The ask:** Seed funding, pilot partnerships with 10 UAE SME merchants

---

## Appendix — Team

| Name            | Role                | Background   |
| --------------- | ------------------- | ------------ |
| [Team Member 1] | Full-Stack / Mobile | [Background] |
| [Team Member 2] | Backend / DevOps    | [Background] |
| [Team Member 3] | Product / Design    | [Background] |

---

_Built with ❤️ at [Hackathon Name] — March 2026_
