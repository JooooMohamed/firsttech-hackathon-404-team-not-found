# EasyPoints — Live Demo Script

> **Estimated demo time:** 8–10 minutes
> **Prerequisites:** Server running on port 3000, iOS Simulator open, DB seeded

---

## Pre-Demo Setup

```bash
# 1. Start the server (from project root)
cd server && node dist/main.js

# 2. Start Metro & run the app
cd mobile && npx react-native start
# In another terminal:
npx react-native run-ios --simulator="iPhone 15 Pro"
```

If the DB needs resetting, run the demo-reset script:

```bash
bash demo-reset.sh
```

---

## Act 1 — The Problem (30 seconds)

> **Talking point:**
> "In the UAE, loyalty programs are fragmented across airlines, retailers, and SMEs. A customer might have points in Share, Etihad Guest, Emirates Skywards, Aura — but can't see or use them together. Meanwhile, small businesses can't afford to build their own loyalty system."

---

## Act 2 — Meet EasyPoints (7 minutes)

### Scene 1: Onboarding & Login (45 sec)

1. **App launches → Onboarding slides appear**
   - Swipe through 3 slides:
     - 💳 "Your Unified Wallet"
     - 🔗 "Link Programs"
     - ⚡ "Earn & Redeem at SMEs"
   - Tap **"Get Started"**

2. **Login as youssef** (pure member experience)
   - Email: `youssef@demo.com`
   - Password: `demo123`
   - ✅ Accept data consent
   - → Lands on **Home Screen**

### Scene 2: Unified Wallet Dashboard (60 sec)

3. **Show the Home Screen — key highlights:**
   - **Total Loyalty Value** card — aggregated across all programs
   - **EasyPoints Balance** hero card with animated counter
   - **"Points don't expire"** badge
   - Pull down to refresh with haptic feedback

4. **Scroll down to Linked Programs:**
   - 🟣 Share — 2,450 Points (Gold)
   - ✈️ Etihad Guest — 18,300 Miles (Silver)
   - 🔴 Emirates Skywards — 5,120 Miles (Blue)
   - 🟡 Aura — 1,800 Points

   > "youssef sees ALL her loyalty balances — from airlines to retail — in one unified dashboard."

### Scene 3: Browse Merchants & Earn (90 sec)

5. **Tap "Browse Merchants"**
   - Show 3 merchant cards: ☕ Café Beirut, 🌸 Bloom Flowers, 🛒 FreshMart
6. **Tap Café Beirut → Merchant Profile**
   - Expand **About** card (tap to toggle)
   - Show **Earn Rate**: 10 EP/AED with spend-to-points examples
   - Show **Redemption**: ✓ Available, accepts cross-SME points
   - Show **Your Balance** context bar
7. **Tap "Show QR to Earn"**
   - QR code + 6-character code appears with countdown timer
   - > "youssef just paid for her coffee. She shows this code to the cashier, and points are credited automatically."

### Scene 4: Offers & Promotions (30 sec)

8. **Go back to Home → tap "Offers & Promotions"**
   - Show active deals with color-coded cards:
     - 🔥 Double Points Friday! (2x at Café Beirut)
     - 🔥 50 Bonus EP (Bloom Flowers)
     - 🔥 Weekend Grocery Deal (3x at FreshMart)
     - 🎁 Free Coffee at 200 EP

### Scene 5: Staff View — Process a Transaction (90 sec)

9. **Go to Settings → Sign Out**

10. **Login as Hafez** (`hafez@demo.com` / `demo123`)
    - → Lands on Home
11. **Tap role switcher bar → Switch to Staff mode**
    - UI transforms to Staff dashboard
12. **Tap "Issue Points" (Café Beirut)**
    - Enter bill amount: **50 AED**
    - Tap "Next — Enter Member Code"
    - Enter the code from youssef's QR (or type a code)
    - See **Confirm** card: Member name, bill, estimated points
    - Tap **"Confirm & Issue Points"**
    - ✅ Success animation: **+500 EP** with haptic feedback

    > "The staff member simply enters the member's code and the bill amount. Points are calculated and issued in seconds."

### Scene 6: Admin Dashboard (60 sec)

13. **Sign out → Login as Farag** (`farag@demo.com` / `demo123`)
    - Switch to **Admin mode**
14. **Show Admin Dashboard:**
    - Merchant stats — total points issued, redeemed, active members
    - Daily stats bar chart
    - Transaction list
15. **Tap "Manage Staff"**
    - Show current staff list
    - Demonstrate adding a staff member by email

### Scene 7: Merchant Self-Onboarding (30 sec)

16. **Switch to Member mode → Tap "Register Your Business"**
    > "Any small business owner can onboard themselves — no integration needed. They set their name, earn rate, and they're live on the platform."

---

## Act 3 — Technical Highlights (90 sec)

> **Talking points to weave into the demo or mention at the end:**

- **Security-first:** JWT auth, RBAC roles, crypto-secure QR tokens, rate limiting, CORS protection, IDOR prevention
- **Real-time QR flow:** Member generates QR → Staff scans/enters code → Points issued instantly
- **Cross-SME redemption:** Earn at Café Beirut, redeem at Bloom Flowers — configurable per merchant
- **Multi-program aggregation:** See Share, Etihad, Skywards, Aura balances alongside EasyPoints
- **Production-quality UX:** Skeleton loaders, animated counters, haptic feedback, confetti celebrations, error boundaries
- **Fully tested:** 146 API tests covering auth, CRUD, edge cases, and E2E flows
- **Clean architecture:** NestJS modular backend, Zustand state management, Joi validation on both ends

---

## Key Demo Accounts

| User    | Email            | Password | Roles                  | Use For                      |
| ------- | ---------------- | -------- | ---------------------- | ---------------------------- |
| youssef | youssef@demo.com | demo123  | Member                 | Customer experience          |
| Hafez   | hafez@demo.com   | demo123  | Member + Staff         | Staff earn/redeem flow       |
| Farag   | farag@demo.com   | demo123  | Member + Staff + Admin | Admin dashboard, full access |

---

## Troubleshooting

| Issue                 | Fix                                                                 |
| --------------------- | ------------------------------------------------------------------- |
| Server not responding | `cd server && node dist/main.js`                                    |
| DB appears empty      | Restart server (auto-seeds on boot)                                 |
| Metro bundler crashed | `cd mobile && npx react-native start --reset-cache`                 |
| iOS build fails       | `cd mobile/ios && pod install && cd .. && npx react-native run-ios` |
| Points not updating   | Pull-to-refresh on Home screen                                      |
