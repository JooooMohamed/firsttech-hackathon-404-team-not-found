# EasyPoints — Screen Recording & Screenshots Guide

---

## 10 Required Screenshots

Take these in order on **iOS Simulator** (iPhone 15 Pro) for the best quality.

### How to Take Screenshots
```bash
# From terminal (saves to desktop):
xcrun simctl io booted screenshot ~/Desktop/screenshot-01-onboarding.png

# Or use: Cmd + S in the Simulator window
# Or use: Simulator → File → Save Screen
```

---

### Screenshot 1: Onboarding — First Slide
**Screen:** OnboardingScreen (slide 1)  
**What to show:** "Your Loyalty Wallet" title, illustration, "Get Started" button  
**Setup:** Sign out or clear AsyncStorage → reopen app  
```bash
xcrun simctl io booted screenshot ~/Desktop/EP-01-onboarding.png
```

---

### Screenshot 2: Sign In Screen
**Screen:** LoginScreen  
**What to show:** Email + password fields, "Sign In" button, "Fill Demo" option  
**Setup:** Tap "Get Started" from onboarding → arrive at login  
```bash
xcrun simctl io booted screenshot ~/Desktop/EP-02-signin.png
```

---

### Screenshot 3: Member Home — Wallet Dashboard
**Screen:** HomeScreen  
**What to show:** EasyPoints balance (e.g., 1,250 pts), linked programs, quick action buttons (Earn, Redeem), notification bell  
**Setup:** Sign in as `youssef@demo.com` / `demo123`  
```bash
xcrun simctl io booted screenshot ~/Desktop/EP-03-home-wallet.png
```

---

### Screenshot 4: Merchant Directory
**Screen:** MerchantDirectoryScreen  
**What to show:** Search bar, category filter pills, merchant cards (Café Beirut, Bloom Flowers, FreshMart)  
**Setup:** Tap Merchants tab  
```bash
xcrun simctl io booted screenshot ~/Desktop/EP-04-merchants.png
```

---

### Screenshot 5: QR Code — Earn Points
**Screen:** EarnQRScreen  
**What to show:** Large QR code in center, "Show this to staff" instruction, session info  
**Setup:** Home → Tap "Earn Points"  
```bash
xcrun simctl io booted screenshot ~/Desktop/EP-05-earn-qr.png
```

---

### Screenshot 6: Staff — Scan & Process Transaction
**Screen:** StaffHomeScreen or StaffTransactionScreen  
**What to show:** Camera/scan area, member name, amount input, "Complete" button  
**Setup:** Sign in as `farag@demo.com` / `demo123` → scan or enter a QR session  
```bash
xcrun simctl io booted screenshot ~/Desktop/EP-06-staff-scan.png
```

---

### Screenshot 7: Active Offers
**Screen:** OffersScreen  
**What to show:** Offer cards with merchant name, multiplier/discount, days remaining  
**Setup:** Tap Offers tab as member  
```bash
xcrun simctl io booted screenshot ~/Desktop/EP-07-offers.png
```

---

### Screenshot 8: Transaction History
**Screen:** TransactionHistoryScreen  
**What to show:** List of earn/redeem transactions, date filter pills, amounts  
**Setup:** Tap Activity tab as member  
```bash
xcrun simctl io booted screenshot ~/Desktop/EP-08-activity.png
```

---

### Screenshot 9: Staff Analytics Dashboard
**Screen:** StaffStatsScreen  
**What to show:** Points issued/redeemed totals, active member count, charts/trends  
**Setup:** Sign in as staff → Stats tab  
```bash
xcrun simctl io booted screenshot ~/Desktop/EP-09-staff-stats.png
```

---

### Screenshot 10: Settings & Consent
**Screen:** SettingsScreen  
**What to show:** User profile info, consent status (✓ Approved), sign out button  
**Setup:** Tap Settings tab  
```bash
xcrun simctl io booted screenshot ~/Desktop/EP-10-settings.png
```

---

## Batch Screenshot Script

Run this after manually navigating to each screen:
```bash
#!/bin/bash
# Save screenshots to Desktop
DIR=~/Desktop/EasyPoints-Screenshots
mkdir -p $DIR

echo "Navigate to each screen and press Enter to capture..."

screens=("01-onboarding" "02-signin" "03-home-wallet" "04-merchants" "05-earn-qr" "06-staff-scan" "07-offers" "08-activity" "09-staff-stats" "10-settings")

for screen in "${screens[@]}"; do
  echo "Ready for: $screen"
  read -p "Press Enter to capture..."
  xcrun simctl io booted screenshot "$DIR/EP-$screen.png"
  echo "✓ Captured $screen"
done

echo "All screenshots saved to $DIR"
```

---

## Screen Recording Commands

### Record Full Demo (iOS Simulator)
```bash
# Start recording
xcrun simctl io booted recordVideo ~/Desktop/EasyPoints-demo.mp4

# Stop: Ctrl+C

# Record with specific device
xcrun simctl io "iPhone 15 Pro" recordVideo ~/Desktop/EasyPoints-demo.mp4
```

### Record Android Emulator
```bash
# Start recording (max 3 min per file)
adb shell screenrecord /sdcard/demo.mp4

# Stop: Ctrl+C

# Pull file to computer
adb pull /sdcard/demo.mp4 ~/Desktop/EasyPoints-android-demo.mp4
```

### Record Entire macOS Screen (QuickTime)
1. Open **QuickTime Player**
2. File → **New Screen Recording**
3. Select the Simulator window area
4. Click Record → perform the demo → click Stop
5. Save as `EasyPoints-demo-raw.mov`

---

## Screenshot Specs for Presentation
- **Format:** PNG (lossless quality)
- **Resolution:** Native simulator (1179 × 2556 for iPhone 15 Pro)
- **Naming:** `EP-01-onboarding.png` through `EP-10-settings.png`
- **Usage:** Pitch deck, hackathon submission, README, social media
