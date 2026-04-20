# EasyPoints Maestro E2E Test Suite

## Prerequisites

- Install Maestro: `curl -Ls "https://get.maestro.mobile.dev" | bash`
- Have the EasyPoints app running on an emulator/simulator or device
- Android package: `com.easypoints` (update if different)

## Run All Tests

```bash
maestro test .maestro/
```

## Run by Category

```bash
# Auth tests
maestro test .maestro/auth/

# Member flow tests
maestro test .maestro/member/

# Staff flow tests
maestro test .maestro/staff/

# Admin flow tests
maestro test .maestro/admin/
```

## Run a Single Test

```bash
maestro test .maestro/auth/01_login_valid.yaml
```

## Test Structure

```
.maestro/
├── helpers/
│   ├── login_member.yaml    # Reusable: login as farag@demo.com (member)
│   ├── login_staff.yaml     # Reusable: login as hafez@demo.com (staff+member)
│   └── login_admin.yaml     # Reusable: login as youssef@demo.com (admin+staff+member)
├── auth/
│   ├── 01_login_valid.yaml          # Valid demo login
│   ├── 02_login_invalid.yaml        # Invalid credentials error
│   ├── 03_login_validation.yaml     # Empty form validation
│   ├── 04_register_screen.yaml      # Register screen navigation & fields
│   ├── 05_consent_flow.yaml         # Consent screen accept
│   └── 06_demo_accounts_visible.yaml # Demo shortcuts displayed
├── member/
│   ├── 01_home_screen.yaml          # Home screen elements
│   ├── 02_home_pull_refresh.yaml    # Pull to refresh
│   ├── 03_tab_navigation.yaml       # All tab navigation
│   ├── 04_merchant_directory.yaml   # Merchant search
│   ├── 05_offers_screen.yaml        # Offers tab
│   ├── 06_transaction_history.yaml  # Transaction filters
│   ├── 07_transaction_date_filters.yaml # Date range filters
│   ├── 08_transaction_export.yaml   # CSV export
│   ├── 09_settings_screen.yaml      # Settings screen
│   └── 10_sign_out.yaml             # Sign out flow
├── staff/
│   ├── 01_staff_home.yaml           # Staff home screen
│   ├── 02_staff_code_lookup.yaml    # Member code lookup
│   ├── 03_staff_stats.yaml          # Stats screen
│   ├── 04_staff_tab_navigation.yaml # Tab navigation
│   ├── 05_staff_role_switch.yaml    # Role switching
│   └── 06_staff_export.yaml         # Export analytics
└── admin/
    ├── 01_admin_dashboard.yaml      # Admin dashboard
    ├── 02_admin_merchant_stats.yaml # Merchant stats view
    └── 03_admin_role_switch.yaml    # Role switching

Total: 25 test flows (3 helpers + 22 tests)
```

## Notes

- Tests use `clearState` + `launchApp` for isolation
- Demo accounts: youssef@demo.com / hafez@demo.com / farag@demo.com (password: demo123)
- Consent screen is handled conditionally (may already be accepted)
- Role switching tests depend on multi-role demo accounts
