# EasyPoints — Screen Recording Guide

> Use this to create a polished 3-minute video demo for the hackathon submission.

---

## Setup

1. **Resolution:** Record at 1080×1920 (iPhone portrait) or 1920×1080 if showing side-by-side with slides
2. **Tool:** QuickTime Player → File → New Screen Recording (capture simulator)  
   Or use `xcrun simctl io booted recordVideo demo.mp4`
3. **Reset DB first:** `bash demo-reset.sh`
4. **Close notifications/distractions** on your Mac

---

## Recording Script (3 minutes)

### 0:00–0:15 — Opening

- Show the app icon / splash screen
- Swipe through onboarding slides (don't skip — judges should see them)

### 0:15–0:30 — Login as youssef

- Type `youssef@demo.com` / `demo123`
- Accept consent → land on Home

### 0:30–1:00 — Unified Dashboard

- **Pause** briefly on the Total Loyalty Value card (let judges read)
- Slowly scroll through linked programs (Share, Etihad, Skywards, Aura)
- Pull-to-refresh (shows the haptic feedback animation)

### 1:00–1:30 — Earn Flow

- Tap "Browse Merchants" → show the 3 merchants
- Tap Café Beirut → expand About + Earn Rate cards
- Tap "Show QR to Earn" → show the QR + timer counting down
- Go back

### 1:30–1:50 — Offers

- Tap "Offers & Promotions"
- Scroll through the 4 offers
- Go back to Home

### 1:50–2:15 — Staff Earn (role switch)

- Go to Settings → Sign Out
- Login as Hafez → switch to Staff mode
- Tap "Issue Points" at Café Beirut
- Enter 50 AED → enter a member code → Confirm → show success animation

### 2:15–2:40 — Admin Dashboard

- Sign out → Login as Farag → switch to Admin mode
- Show the dashboard stats + daily chart
- Briefly show transaction list

### 2:40–3:00 — Closing

- Switch back to Member mode
- Show the unified wallet one final time
- End on the Home screen with the total balance visible

---

## Recording Tips

- **Move slowly** — judges scrub through videos quickly
- **Tap slightly below center** on buttons (looks more natural)
- **Don't type passwords live** — use iOS autofill or paste
- **No voiceover needed** if submitting with slides, but add captions if you want
- **File format:** MP4, under 100MB, 30fps minimum

---

## Terminal Recording (optional)

To show the test suite running:

```bash
# Record terminal with asciinema (or just screen record)
bash test-all.sh 2>&1 | head -50  # Show first 50 lines
# ... then jump to the end
bash test-all.sh 2>&1 | tail -15  # Show "146/146 PASSED"
```

---

## Post-Production

If combining with slides:

1. Record app demo (3 min)
2. Record slide narration (5 min)
3. Splice together: slides → live demo → slides
4. Add background music (optional, keep it subtle)
5. Export at 1080p, H.264, under 100MB
