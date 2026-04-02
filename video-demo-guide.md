# EasyPoints — Video Demo Guide

> Step-by-step instructions to record a professional 5-minute demo video.

---

## Pre-Recording Setup

### 1. Environment Preparation
```bash
# Start the backend server
cd server && npm run build && NODE_TLS_REJECT_UNAUTHORIZED=0 node dist/main.js

# Start Metro bundler
cd mobile && npx --no-install react-native start --reset-cache

# Run on iOS Simulator (recommended for recording)
npx --no-install react-native run-ios
```

### 2. Seed Data Check
Make sure demo accounts exist:
- `youssef@demo.com` / `demo123` (member)
- `hafez@demo.com` / `demo123` (member)  
- `farag@demo.com` / `demo123` (staff)

Seed merchants: Café Beirut, Bloom Flowers, FreshMart

### 3. Simulator Settings (iOS)
- **Device:** iPhone 15 Pro (best aspect ratio)
- **Appearance:** Light Mode
- **Status bar:** Full signal, full battery (Simulator → Features → Status Bar → Override)
- **Keyboard:** Dismiss before screenshots
- **Time:** Set to a clean time like 9:41 (Apple's default)

### 4. Recording Tool
- **macOS:** QuickTime Player → File → New Screen Recording
- **Better option:** OBS Studio (free) — set canvas to 1080x1920 for vertical phone format
- **Best option:** Use Xcode → Simulator → File → Record Screen (saves as .mp4)

---

## Recording Sequence

### Scene 1: Opening (0:00–0:30)
**Record:** Voiceover + app splash screen
1. Have app closed initially
2. Open the app — show splash/onboarding
3. Pre-record voiceover: "Every person carries at least 5 loyalty cards..."

### Scene 2: Onboarding (0:30–1:00)
**Record:** Screen recording of swipe-through
1. Start from first onboarding slide
2. Swipe slowly left → second slide → third slide
3. Tap "Get Started"
4. Show Login screen appears

### Scene 3: Member Sign-In & Home (1:00–1:30)
**Record:** Login flow + Home screen tour
1. Type `youssef@demo.com` → `demo123` → Tap Sign In
2. Home screen loads — pause 2 seconds on it
3. Scroll down to show linked programs
4. Tap "Link Program" → show program list

### Scene 4: Merchant Directory (1:30–1:45)
**Record:** Merchants tab
1. Tap Merchants tab
2. Scroll through merchant cards
3. Tap category filter pills
4. Tap a merchant card → show profile

### Scene 5: QR Earn Flow (1:45–2:30)
**Record:** Full earn flow
1. Go back to Home → Tap "Earn Points"
2. Show QR code screen (pause 3 seconds)
3. **CUT** — Switch to staff account
4. Staff taps camera icon on home
5. Enter session ID / scan QR
6. Enter amount → Confirm
7. **CUT** — Back to member, show updated balance

### Scene 6: Redeem Flow (2:30–3:00)
**Record:** Redeem flow  
1. Member taps "Redeem"
2. Show redeem QR
3. Staff scans → enters points → Confirm
4. Member balance decreases

### Scene 7: Offers & History (3:00–3:30)
**Record:** Offers + Activity tabs
1. Tap Offers tab → scroll through offers
2. Tap Activity tab → show transactions
3. Use date filter pills

### Scene 8: Staff Dashboard (3:30–4:00)
**Record:** Staff view
1. Show Staff Home with today's stats
2. Tap Stats tab → show analytics charts
3. Show points issued vs redeemed

### Scene 9: Admin View (4:00–4:30)
**Record:** Admin features
1. Show Admin Dashboard
2. Show Merchant Setup form
3. Show Staff Management

### Scene 10: Closing (4:30–5:00)
**Record:** Voiceover + final screens
1. Show Home screen with full balance
2. Voiceover: "React Native, NestJS, MongoDB Atlas, deployed on Vercel"
3. End on the EasyPoints logo/splash

---

## Post-Production

### Editing Software (Free)
- **iMovie** (macOS) — Simple, built-in
- **DaVinci Resolve** (all platforms) — Professional, free
- **CapCut** (mobile/desktop) — Fast, modern

### Editing Checklist
- [ ] Add title card: "EasyPoints — Your Universal Loyalty Wallet"
- [ ] Add text overlays for each section heading
- [ ] Smooth transitions (cross-dissolve, 0.3s)
- [ ] Background music (royalty-free, low volume)
- [ ] Voiceover narration (record separately for better audio)
- [ ] End card with team name, tech stack, GitHub URL
- [ ] Export as 1080p MP4, 30fps

### Recommended Music
- YouTube Audio Library → Search "corporate" or "technology" → Filter: upbeat, background
- Pixabay.com/music → Free for any use

---

## Quick Recording Commands

```bash
# Record iOS Simulator screen (built-in)
xcrun simctl io booted recordVideo demo-recording.mp4

# Stop recording: Press Ctrl+C in the terminal

# Record with specific simulator
xcrun simctl io "iPhone 15 Pro" recordVideo demo-recording.mp4
```

---

## File Output
- **Raw recording:** `demo-recording.mp4`
- **Final video:** `EasyPoints-Demo-5min.mp4`
- **Format:** 1080x1920 (9:16 vertical) or 1920x1080 (16:9 landscape)
- **Duration:** 4:30–5:00
