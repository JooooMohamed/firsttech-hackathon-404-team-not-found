# EasyPoints — 5-Minute Video Demo Guide

## Demo Accounts

| User     | Email            | Password | Roles                |
| -------- | ---------------- | -------- | -------------------- |
| Youssef  | youssef@demo.com | demo123  | Member               |
| Hafez    | hafez@demo.com   | demo123  | Member, Staff        |
| Mo Farag | farag@demo.com   | demo123  | Member, Staff, Admin |

---

## VIDEO SCRIPT (5:00 total)

### PART 1 — ONBOARDING & LOGIN (0:00 – 0:40)

**📸 Screenshot 1: Login Screen**

- Open the app → Login screen with EasyPoints logo
- Show the clean login form with email + password
- Type `youssef@demo.com` / `demo123`
- Tap **Sign In**

**📸 Screenshot 2: Consent Screen** _(first login only)_

- Show the data consent screen: "EasyPoints aggregates your loyalty program balances from participating UAE programs…"
- Tap **"I Agree — Let's Go"**

> 🎤 _"EasyPoints starts with a privacy-first approach. Before accessing any features, users must consent to data aggregation — full GDPR compliance built in. Consent can be revoked later in Settings."_

---

### PART 2 — MEMBER / CUSTOMER FLOW (0:40 – 2:30)

**📸 Screenshot 3: Home Screen (Wallet Dashboard)**

- Show the unified wallet: EasyPoints balance with animated counter, AED equivalent
- Show **Estimated Total Value** card ("across 9 programs")
- Show the **donut chart** — wallet breakdown by AED value (EasyPoints + 8 external programs)
- Show **Linked Programs** — all 8 UAE programs: Share, Etihad Guest, Emirates Skywards, Aura, ADNOC Rewards, Smiles, FAB Rewards, Blue Rewards (all from DB)
- Scroll down to show **Your Month** insights (EP earned/redeemed, tx count, top merchant)
- Show **Earn Points Nearby** — horizontal merchant carousel with earn rates
- Show **Recent Activity** — last 3 transactions

> 🎤 _"The home screen gives members a single dashboard for all their loyalty value. EasyPoints balance plus 8 linked UAE programs — Share, Etihad Guest, Emirates Skywards, Aura, ADNOC Rewards, Smiles, FAB Rewards, and Blue Rewards — all pulled from the database with real-time AED value estimation. The donut chart visualizes the breakdown. Monthly insights show earning and spending patterns."_

**📸 Screenshot 4: Link Program Screen**

- Tap **"Manage Programs"** (or "Link Programs" quick action)
- Show already-linked programs with brand colors and tiers
- Show available programs to connect
- Demonstrate linking a new program
- Go back

> 🎤 _"Users can link and unlink external loyalty programs from a catalog stored in MongoDB Atlas. EasyPoints becomes the one wallet for all your UAE loyalty points — all data served from the live database."_

**📸 Screenshot 5: Merchant Directory**

- Tap **Merchants** tab
- Show searchable merchant list with category filter pills (Food & Beverage, Grocery, etc.)
- Type a search term to filter
- Show 6 merchants: Café Beirut, Bloom Flowers, FreshMart, FitZone Gym, Glamour Salon, WellCare Pharmacy
- Tap on **Café Beirut**

> 🎤 _"The merchant directory shows all participating SMEs from the database. Users can search, filter by category, and see earn rates at a glance. All 6 merchants have descriptions, earn rates, and configurations stored in MongoDB Atlas."_

**📸 Screenshot 6: Merchant Profile + QR Actions**

- Show merchant profile: About section (expandable), Earn Rate with examples table, Redemption status, Cross-SME badge
- Show **3 action buttons**:
  1. **📷 Scan QR to Earn** — camera-based QR scanner
  2. **📱 Show QR to Earn** — display your code for staff
  3. **🎁 Redeem Points Here** — spend EP
- Tap **"Scan QR to Earn"** → show camera scanner with overlay + corner markers
- Or tap **"Show QR to Earn"** → show QR code + 6-char token with 5-minute countdown

> 🎤 _"At a merchant, customers have two ways to earn — scan the cashier's QR with their camera, or display their own QR code for the staff to enter. This dual-mode approach handles any point-of-sale scenario. The redeem button lets customers spend their balance."_

**Quick Tour (no screenshots needed):**

- Tap **Offers** tab → show 7 active promotions with time-remaining badges (bonus multipliers, freebies, discounts)
- Tap **Activity** tab → show transaction history with filter pills (All / Earned / Redeemed)
- Tap **Settings** tab → show profile editing, roles, consent status, **📊 Export Transactions (CSV)** button, Revoke Data Consent

> 🎤 _"The Offers tab shows live promotions from the database — double points, free items, discounts. Activity shows full transaction history with filters. Settings includes profile editing and CSV export of all transactions."_

---

### PART 3 — STAFF / MERCHANT FLOW (2:30 – 3:45)

> 🎤 _"Now let's switch to the merchant staff perspective."_

**📸 Screenshot 7: Staff Home**

- On Home screen, tap the **role switcher** → select **Staff**
- Show Staff Home: assigned merchant name, earn rate, recent activity feed
- Show the two main action buttons: **Issue Points** and **Validate Redemption**
- Show **Manage Staff** option

> 🎤 _"Staff members — like Hafez who works at Café Beirut — see their assigned merchant dashboard. The two core actions are always front and center: issue points when customers pay, or validate redemption codes."_

**📸 Screenshot 8: Staff — Issue Points (Earn Flow)**

- Tap **Issue Points**
- Enter bill amount (e.g., 50 AED)
- Enter the customer's 6-character earn code
- Show the confirmation: "50 AED × 10 EP/AED = 500 EasyPoints"
- Confirm → show success with **confetti animation**

> 🎤 _"The staff enters the bill amount and the customer's earn code. Points are calculated automatically based on the merchant's earn rate. Active offers like 'Double Points Friday' are applied automatically. Confirmation is instant with a celebratory animation."_

**Redeem Validation (describe briefly):**

- Mention: _"Similarly, staff can scan or enter the customer's redeem code and confirm the point deduction — the customer's global wallet balance is debited in real time."_

---

### PART 4 — ADMIN FLOW (3:45 – 4:45)

> 🎤 _"Finally, the admin dashboard for business owners and platform admins."_

**📸 Screenshot 9: Admin Dashboard**

- Tap role switcher → select **Admin**
- Show **Global Summary Card** (purple) with 5 metrics:
  - Merchants count, Total Issued, Total Redeemed, **Net Outstanding**, Total Transactions
- Show expandable merchant cards — tap one to reveal:
  - **5-stat grid**: Issued, Redeemed, Txns, **Outstanding** (Issued − Redeemed), Members
  - **Line chart** — 7-day activity with green (earned) and red (redeemed) lines with gradient fills
  - Status badges (Redeem ON, Cross-SME ON)
  - Action chips: Edit, Settings, Transactions

> 🎤 _"The admin dashboard provides a real-time overview across all 6 merchants. The key metric is Net Outstanding — total points issued minus redeemed — representing the platform's liability. Each merchant has an interactive line chart showing 7-day earn and redeem trends. All data comes from MongoDB Atlas aggregation pipelines."_

**📸 Screenshot 10: Merchant Settings**

- Tap **⚙️ Settings** on a merchant card
- Show toggle switches:
  - **Redemption Enabled** (on/off)
  - **Cross-SME Redemption** (accept points earned at other merchants)
- Toggle one switch to demonstrate

> 🎤 _"Admins have granular control per merchant. They can enable or disable redemption, and toggle cross-SME acceptance — a key innovation that lets small businesses collaborate through a shared loyalty network."_

---

### PART 5 — CLOSING / KEY HIGHLIGHTS (4:45 – 5:00)

> 🎤 _"To summarize — EasyPoints is a unified loyalty wallet that:"_
>
> - _"Aggregates 8 UAE loyalty programs into one dashboard — all from the database"_
> - _"Gives SMEs instant, zero-cost loyalty infrastructure with QR-based earn and redeem"_
> - _"Supports camera-based QR scanning AND code display for maximum flexibility"_
> - _"Enables cross-merchant point redemption — a first for UAE SMEs"_
> - _"Includes CSV export, offer management, Net Outstanding analytics, and line chart trends"_
> - _"Built-in GDPR compliance with revocable data consent"_
> - _"100% live data — MongoDB Atlas cloud, no hardcoded values"_

---

## 10 SCREENSHOTS SUMMARY

| #   | Screen                    | What to Capture                                                      | Role   |
| --- | ------------------------- | -------------------------------------------------------------------- | ------ |
| 1   | **Login**                 | Clean login form with EasyPoints branding                            | All    |
| 2   | **Consent**               | Privacy consent screen with dynamic program description              | All    |
| 3   | **Home Dashboard**        | Wallet balance + donut chart + 8 linked programs + insights          | Member |
| 4   | **Link Programs**         | Full catalog — 8 connected programs with brand colors & tiers        | Member |
| 5   | **Merchant Directory**    | 6 merchants with search + category pills                             | Member |
| 6   | **Merchant Profile + QR** | Profile details + 3 actions (📷 Scan QR, 📱 Show QR, 🎁 Redeem)      | Member |
| 7   | **Staff Home**            | Staff dashboard with Issue Points + Validate Redemption buttons      | Staff  |
| 8   | **Issue Points**          | Earn flow: amount → code → confirm → confetti success                | Staff  |
| 9   | **Admin Dashboard**       | Global summary (incl. Outstanding) + line chart + per-merchant stats | Admin  |
| 10  | **Merchant Settings**     | Redemption toggle + cross-SME toggle                                 | Admin  |

---

## KEY FEATURES TO HIGHLIGHT

| Feature                     | Where to Show                                         |
| --------------------------- | ----------------------------------------------------- |
| 8 Linked Programs (from DB) | Home screen donut chart + cards                       |
| Camera QR Scanner           | Merchant Profile → "Scan QR to Earn"                  |
| CSV Export                  | Settings → "Export Transactions (CSV)"                |
| Line Chart                  | Admin Dashboard → 7-day activity per merchant         |
| Net Outstanding             | Admin Dashboard → global summary + per-merchant cards |
| Offers System               | Offers tab → 7 live promotions                        |
| Cross-SME Redemption        | Merchant Profile badges + Admin Settings toggles      |
| GDPR Consent                | Consent screen + Settings → Revoke                    |

---

## TIPS FOR RECORDING

1. **Use iPhone simulator** (cleaner, no notifications/status bar clutter)
2. **Start the server first**: `cd server && npm run build && node dist/main.js`
3. **Pre-login as Youssef** so you skip the login animation on re-recording
4. **Role switching is live** — no need to logout/login to show different roles
5. **Pull-to-refresh** on Home to re-fetch all data from the database (real API calls, no fake nudge)
6. **Generate a QR code** before recording the staff section so you have a valid code ready
7. **Use Cmd+S** in simulator to take screenshots
8. **Record at 2x speed** for navigation transitions, then slow down for important screens
9. **CSV Export** — tap in Settings to show the Share sheet (proof of real data export)
10. **Emphasize "all from DB"** — linked programs, merchants, offers, transactions are all from MongoDB Atlas
