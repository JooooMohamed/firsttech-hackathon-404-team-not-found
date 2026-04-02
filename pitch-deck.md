# EasyPoints — Pitch Deck Outline

> Use this as slides in Google Slides, Keynote, or PowerPoint.
> **Recommended:** 12 slides, 5–7 minutes presentation.

---

## Slide 1: Title
**EasyPoints**  
*Your Universal Loyalty Wallet*

- Team Name: 404 Team Not Found
- Hackathon: FirstTech Hackathon 2026
- Date: April 2026

> Use Screenshot: EP-03-home-wallet.png as background (blurred, with overlay)

---

## Slide 2: The Problem
**Loyalty Programs Are Broken**

- Average person is enrolled in **16.6 loyalty programs** but active in only **7.6**
- **$48 billion** in loyalty points go unredeemed every year
- Customers carry **5+ cards/apps** for different stores
- Small businesses **can't afford** their own loyalty system
- Points **expire, get forgotten**, or feel worthless

> Visual: Scattered loyalty cards (stock image) or EP-01-onboarding.png

---

## Slide 3: The Solution
**One Wallet. All Your Loyalty. Everywhere.**

EasyPoints is a **universal loyalty wallet** that:
- Aggregates all loyalty programs in **one app**
- Works with **any local merchant** via QR codes
- Provides a **unified points currency** (EasyPoints)
- Links to existing programs (Etihad, Emirates Skywards, Share)

> Visual: EP-03-home-wallet.png (showing unified balance)

---

## Slide 4: How It Works — Members
**For Customers: Earn & Redeem in 3 Taps**

1. **Open** the app → see your unified balance
2. **Show QR** at checkout → staff scans
3. **Points credited** instantly to your wallet

> Visual: EP-05-earn-qr.png (QR code screen)

---

## Slide 5: How It Works — Merchants
**For Businesses: Zero Setup, Instant Loyalty**

1. **Register** your business in the app
2. **Staff scans** customer QR codes
3. **Track analytics** — see points issued, active members, trends

> Visual: EP-06-staff-scan.png + EP-09-staff-stats.png (side by side)

---

## Slide 6: Key Features

| Feature | Description |
|---------|-------------|
| 🏠 Unified Wallet | All loyalty points in one dashboard |
| 📱 QR Earn/Redeem | Contactless, instant, fraud-resistant |
| 🏪 Merchant Directory | Browse & discover local partners |
| 🎁 Smart Offers | 2x points, discounts, freebie promotions |
| 🔗 Program Linking | Connect Etihad, Share, Emirates Skywards |
| 📊 Analytics | Real-time stats for merchants/staff |
| 👥 Staff Management | Add/remove staff by email |
| 🔐 GDPR Consent | Privacy-first with explicit consent gate |
| 🔔 Notifications | In-app alerts for offers and activity |
| 📋 Transaction History | Full audit trail with filtering |

---

## Slide 7: Live Demo
**[Show the 5-minute video or do a live walkthrough]**

Refer to `demo-script.md` for the sequence.

---

## Slide 8: Tech Stack

```
┌─────────────────────────────────────┐
│           MOBILE APP                │
│  React Native 0.73 + TypeScript    │
│  Zustand (state) + React Hook Form │
│  React Navigation + QR Code        │
├─────────────────────────────────────┤
│           BACKEND API               │
│  NestJS 10 + TypeScript             │
│  MongoDB Atlas + Mongoose 8         │
│  JWT Auth + Role Guards             │
├─────────────────────────────────────┤
│         DEPLOYMENT                  │
│  Vercel (API) + APK (Android)       │
│  iOS Simulator ready                │
└─────────────────────────────────────┘
```

---

## Slide 9: Architecture

```
Member App ←→ REST API (NestJS) ←→ MongoDB Atlas
                ↑
Staff App ──────┘
                ↑
Admin App ──────┘

All roles served from one React Native app
with role-based navigation switching.
```

- **28 screens** across 4 user journeys
- **30+ API endpoints** with JWT + role guards
- **Rate limiting** (60 req/min)
- **Auto-seeding** demo data on first boot

---

## Slide 10: Market Opportunity
**Why Now?**

- UAE loyalty market growing at **12% CAGR**
- 70% of small businesses **don't have a loyalty program**
- Customers prefer **digital wallets** over physical cards (87%)
- Post-COVID: contactless preference is **permanent**

**Target:** Local UAE businesses — cafés, salons, grocers, florists

---

## Slide 11: What's Next
**Roadmap**

- **Phase 1 (Now):** MVP — QR earn/redeem, merchant directory, unified wallet
- **Phase 2:** Real payment integration (Apple Pay, Google Pay at POS)
- **Phase 3:** AI-powered offers — personalized based on purchase history
- **Phase 4:** Partnership APIs — connect to real Etihad/Emirates programs
- **Phase 5:** Multi-currency/multi-country expansion

---

## Slide 12: Team & Contact

**404 Team Not Found**

| Member | Role |
|--------|------|
| Youssef El Ghzaly | Full-Stack Developer |
| [Team Member 2] | [Role] |
| [Team Member 3] | [Role] |

- **GitHub:** github.com/Youssef-ElGhazaly/firsttech-hackathon-404-team-not-found
- **API:** firsttech-hackathon-404-team-not-fo.vercel.app/api
- **APK:** Available in repo (`EasyPoints-release.apk`)

---

## Design Tips

- **Font:** Use Inter or SF Pro for a modern look
- **Colors:** Primary #6C63FF (purple), Background #F8F9FA, Success #10B981
- **Screenshots:** Full-bleed on slides with subtle shadows
- **Animations:** Minimal — slide-in for feature lists
- **Template:** Use Canva → Search "Tech Pitch Deck" for free templates
