#!/bin/bash
# ============================================================
#  EasyPoints — Comprehensive API Test Suite
#  Covers: Auth, Users, Merchants, Wallets, Transactions,
#          QR sessions, Programs, and Edge Cases
# ============================================================

BASE="http://localhost:3000/api"
PASS=0
FAIL=0
TOTAL=0

green='\033[0;32m'
red='\033[0;31m'
yellow='\033[1;33m'
cyan='\033[0;36m'
bold='\033[1m'
nc='\033[0m'

assert() {
  local test_name="$1"
  local expected="$2"
  local actual="$3"
  TOTAL=$((TOTAL + 1))
  if echo "$actual" | grep -q "$expected"; then
    PASS=$((PASS + 1))
    echo -e "  ${green}✓ PASS${nc} — $test_name"
  else
    FAIL=$((FAIL + 1))
    echo -e "  ${red}✗ FAIL${nc} — $test_name"
    echo -e "    Expected to contain: ${yellow}$expected${nc}"
    echo -e "    Got: $(echo "$actual" | head -c 200)"
  fi
}

assert_status() {
  local test_name="$1"
  local expected_code="$2"
  local actual_code="$3"
  local body="$4"
  TOTAL=$((TOTAL + 1))
  if [ "$actual_code" = "$expected_code" ]; then
    PASS=$((PASS + 1))
    echo -e "  ${green}✓ PASS${nc} — $test_name (HTTP $actual_code)"
  else
    FAIL=$((FAIL + 1))
    echo -e "  ${red}✗ FAIL${nc} — $test_name (expected HTTP $expected_code, got $actual_code)"
    echo -e "    Body: $(echo "$body" | head -c 200)"
  fi
}

section() {
  echo ""
  echo -e "${cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${nc}"
  echo -e "${bold}  $1${nc}"
  echo -e "${cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${nc}"
}

# Helper to do curl and capture both status-code and body
call() {
  local method="$1" url="$2" token="$3" data="$4"
  local args=(-s -w "\n%{http_code}")
  [ "$token" != "" ] && args+=(-H "Authorization: Bearer $token")
  args+=(-H "Content-Type: application/json")
  [ "$method" = "POST" ] && args+=(-X POST)
  [ "$method" = "PATCH" ] && args+=(-X PATCH)
  [ "$method" = "DELETE" ] && args+=(-X DELETE)
  [ "$data" != "" ] && args+=(-d "$data")
  curl "${args[@]}" "$url"
}

parse_body() { echo "$1" | sed '$d'; }
parse_code() { echo "$1" | tail -1; }

echo ""
echo -e "${bold}🚀 EasyPoints — Full API Test Suite${nc}"
echo "   Server: $BASE"
echo "   Date:   $(date)"

# ============================================================
#  1. AUTH — Login
# ============================================================
section "1. AUTHENTICATION"

# 1.1 Login youssef (member only)
RES=$(call POST "$BASE/auth/login" "" '{"email":"youssef@demo.com","password":"demo123"}')
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "Login youssef (member)" "201" "$CODE" "$BODY"
youssef_TOKEN=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])" 2>/dev/null)
assert "youssef token returned" "token" "$BODY"

# 1.2 Login Hafez (member+staff)
RES=$(call POST "$BASE/auth/login" "" '{"email":"hafez@demo.com","password":"demo123"}')
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "Login Hafez (member+staff)" "201" "$CODE" "$BODY"
Hafez_TOKEN=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])" 2>/dev/null)
assert "Hafez token returned" "token" "$BODY"

# 1.3 Login Farag (member+staff+admin)
RES=$(call POST "$BASE/auth/login" "" '{"email":"farag@demo.com","password":"demo123"}')
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "Login Farag (admin)" "201" "$CODE" "$BODY"
Farag_TOKEN=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])" 2>/dev/null)
assert "Farag token returned" "token" "$BODY"

# 1.4 Login with wrong password
RES=$(call POST "$BASE/auth/login" "" '{"email":"youssef@demo.com","password":"wrong"}')
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "Login wrong password → 401" "401" "$CODE" "$BODY"

# 1.5 Login with non-existent email
RES=$(call POST "$BASE/auth/login" "" '{"email":"nobody@x.com","password":"demo123"}')
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "Login non-existent email → 401" "401" "$CODE" "$BODY"

# 1.6 Login with missing fields
RES=$(call POST "$BASE/auth/login" "" '{"email":"youssef@demo.com"}')
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "Login missing password → 400" "400" "$CODE" "$BODY"

# 1.7 Login with invalid email format
RES=$(call POST "$BASE/auth/login" "" '{"email":"notanemail","password":"demo123"}')
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "Login invalid email format → 400" "400" "$CODE" "$BODY"

# ============================================================
#  2. AUTH — Registration
# ============================================================
section "2. REGISTRATION"

# 2.1 Register new user
RES=$(call POST "$BASE/auth/register" "" '{"name":"Test User","email":"test_'$RANDOM'@demo.com","password":"test123"}')
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "Register new user" "201" "$CODE" "$BODY"
assert "New user has token" "token" "$BODY"
NEW_TOKEN=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])" 2>/dev/null)

# 2.2 Register duplicate email
RES=$(call POST "$BASE/auth/register" "" '{"name":"Dup","email":"youssef@demo.com","password":"test123"}')
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "Register duplicate email → 409" "409" "$CODE" "$BODY"

# 2.3 Register with short password
RES=$(call POST "$BASE/auth/register" "" '{"name":"Short","email":"short@x.com","password":"ab"}')
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "Register short password → 400" "400" "$CODE" "$BODY"

# 2.4 Register missing name
RES=$(call POST "$BASE/auth/register" "" '{"email":"noname@x.com","password":"test123"}')
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "Register missing name → 400" "400" "$CODE" "$BODY"

# 2.5 Register missing email
RES=$(call POST "$BASE/auth/register" "" '{"name":"NoEmail","password":"test123"}')
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "Register missing email → 400" "400" "$CODE" "$BODY"

# ============================================================
#  3. USERS — Profile
# ============================================================
section "3. USER PROFILE"

# 3.1 Get youssef profile
RES=$(call GET "$BASE/users/me" "$youssef_TOKEN")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "GET /users/me youssef" "200" "$CODE" "$BODY"
assert "youssef name correct" "youssef" "$BODY"
assert "youssef email correct" "youssef@demo.com" "$BODY"
assert "youssef is member role" "member" "$BODY"
youssef_ID=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['_id'])" 2>/dev/null)

# 3.2 Get Hafez profile
RES=$(call GET "$BASE/users/me" "$Hafez_TOKEN")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "GET /users/me Hafez" "200" "$CODE" "$BODY"
assert "Hafez has staff role" "staff" "$BODY"
Hafez_ID=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['_id'])" 2>/dev/null)

# 3.3 Get Farag profile
RES=$(call GET "$BASE/users/me" "$Farag_TOKEN")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "GET /users/me Farag" "200" "$CODE" "$BODY"
assert "Farag has admin role" "admin" "$BODY"
Farag_ID=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['_id'])" 2>/dev/null)

# 3.4 Access profile without auth token
RES=$(call GET "$BASE/users/me" "")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "GET /users/me no auth → 401" "401" "$CODE" "$BODY"

# 3.5 Access profile with invalid token
RES=$(call GET "$BASE/users/me" "invalid.jwt.token")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "GET /users/me bad token → 401" "401" "$CODE" "$BODY"

# 3.6 Update consent
RES=$(call PATCH "$BASE/users/me/consent" "$youssef_TOKEN" '{"consentGiven":true}')
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "PATCH consent → 200" "200" "$CODE" "$BODY"
assert "Consent set to true" "true" "$BODY"

# 3.7 Revoke consent (consentGiven=false)
RES=$(call PATCH "$BASE/users/me/consent" "$youssef_TOKEN" '{"consentGiven":false}')
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "PATCH consent revoke → 200" "200" "$CODE" "$BODY"

# Re-enable consent and restore name for subsequent tests
call PATCH "$BASE/users/me/consent" "$youssef_TOKEN" '{"consentGiven":true}' > /dev/null
call PATCH "$BASE/users/me" "$youssef_TOKEN" '{"name":"youssef Al Maktoum"}' > /dev/null

# ============================================================
#  4. MERCHANTS — CRUD & Stats
# ============================================================
section "4. MERCHANTS"

# 4.1 List all merchants (no auth required)
RES=$(call GET "$BASE/merchants" "")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "GET /merchants (public)" "200" "$CODE" "$BODY"
assert "Contains Café Beirut" "Caf" "$BODY"
assert "Contains Bloom Flowers" "Bloom" "$BODY"
assert "Contains FreshMart" "FreshMart" "$BODY"

# Extract merchant IDs
CAFE_ID=$(echo "$BODY" | python3 -c "
import sys,json
ms = json.load(sys.stdin)
for m in ms:
    if 'Caf' in m['name']: print(m['_id']); break
" 2>/dev/null)
BLOOM_ID=$(echo "$BODY" | python3 -c "
import sys,json
ms = json.load(sys.stdin)
for m in ms:
    if 'Bloom' in m['name']: print(m['_id']); break
" 2>/dev/null)
FRESH_ID=$(echo "$BODY" | python3 -c "
import sys,json
ms = json.load(sys.stdin)
for m in ms:
    if 'Fresh' in m['name']: print(m['_id']); break
" 2>/dev/null)

echo -e "  ${yellow}Café Beirut ID: $CAFE_ID${nc}"
echo -e "  ${yellow}Bloom Flowers ID: $BLOOM_ID${nc}"
echo -e "  ${yellow}FreshMart ID: $FRESH_ID${nc}"

# 4.2 Get single merchant
RES=$(call GET "$BASE/merchants/$CAFE_ID" "")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "GET /merchants/:id Café Beirut" "200" "$CODE" "$BODY"
assert "Café earnRate is 10" '"earnRate":10' "$BODY"

# 4.3 Get merchant with invalid ID
RES=$(call GET "$BASE/merchants/invalidid123" "")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "GET /merchants/:invalidId → error" "500" "$CODE" "$BODY"

# 4.4 Create new merchant (authenticated)
RES=$(call POST "$BASE/merchants" "$Farag_TOKEN" '{"name":"Test Bakery","earnRate":8,"category":"Food","description":"Fresh pastries"}')
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "POST /merchants create" "201" "$CODE" "$BODY"
assert "New merchant name" "Test Bakery" "$BODY"
NEW_MERCHANT_ID=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['_id'])" 2>/dev/null)

# 4.5 Create merchant without auth
RES=$(call POST "$BASE/merchants" "" '{"name":"No Auth Shop","earnRate":5}')
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "POST /merchants no auth → 401" "401" "$CODE" "$BODY"

# 4.6 Create merchant missing required fields
RES=$(call POST "$BASE/merchants" "$Farag_TOKEN" '{"name":"No Rate"}')
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "POST /merchants missing earnRate → 400" "400" "$CODE" "$BODY"

# 4.7 Create merchant with earnRate < 1
RES=$(call POST "$BASE/merchants" "$Farag_TOKEN" '{"name":"BadRate","earnRate":0}')
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "POST /merchants earnRate 0 → 400" "400" "$CODE" "$BODY"

# 4.8 Update merchant
RES=$(call PATCH "$BASE/merchants/$CAFE_ID" "$Farag_TOKEN" '{"earnRate":12}')
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "PATCH /merchants/:id update earnRate" "200" "$CODE" "$BODY"
assert "Updated earnRate is 12" '"earnRate":12' "$BODY"

# 4.9 Update merchant — toggle redemption
RES=$(call PATCH "$BASE/merchants/$CAFE_ID" "$Farag_TOKEN" '{"redemptionEnabled":false}')
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "PATCH disable redemption" "200" "$CODE" "$BODY"
assert "Redemption disabled" '"redemptionEnabled":false' "$BODY"

# 4.10 Re-enable redemption for later tests
RES=$(call PATCH "$BASE/merchants/$CAFE_ID" "$Farag_TOKEN" '{"redemptionEnabled":true}')
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "PATCH re-enable redemption" "200" "$CODE" "$BODY"

# Restore earnRate to 10 so point calculations are predictable
RES=$(call PATCH "$BASE/merchants/$CAFE_ID" "$Farag_TOKEN" '{"earnRate":10}')
parse_body "$RES" > /dev/null

# 4.11 Update merchant without auth
RES=$(call PATCH "$BASE/merchants/$CAFE_ID" "" '{"earnRate":5}')
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "PATCH merchant no auth → 401" "401" "$CODE" "$BODY"

# 4.12 Get merchant stats (via transactions endpoint)
RES=$(call GET "$BASE/transactions/merchant/$CAFE_ID/stats" "$Farag_TOKEN")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "GET /transactions/merchant/:id/stats" "200" "$CODE" "$BODY"

# ============================================================
#  5. WALLETS
# ============================================================
section "5. WALLETS"

# 5.1 youssef's wallets
RES=$(call GET "$BASE/wallets/my" "$youssef_TOKEN")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "GET /wallets/my youssef" "200" "$CODE" "$BODY"
youssef_BALANCE=$(echo "$BODY" | python3 -c "
import sys,json
ws=json.load(sys.stdin)
for w in ws:
    if w.get('merchantId') is None: print(w['balance']); break
" 2>/dev/null)
echo -e "  ${yellow}youssef current balance: ${youssef_BALANCE} EP${nc}"

# 5.2 Hafez's wallets
RES=$(call GET "$BASE/wallets/my" "$Hafez_TOKEN")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "GET /wallets/my Hafez" "200" "$CODE" "$BODY"

# 5.3 Farag's wallets
RES=$(call GET "$BASE/wallets/my" "$Farag_TOKEN")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "GET /wallets/my Farag" "200" "$CODE" "$BODY"

# 5.4 Wallet for specific merchant
RES=$(call GET "$BASE/wallets/my/$CAFE_ID" "$youssef_TOKEN")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
# Could be 200 or 200 with null if no merchant-specific wallet
assert_status "GET /wallets/my/:merchantId" "200" "$CODE" "$BODY"

# 5.5 Wallets without auth
RES=$(call GET "$BASE/wallets/my" "")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "GET /wallets/my no auth → 401" "401" "$CODE" "$BODY"

# ============================================================
#  6. TRANSACTIONS — Earn Points
# ============================================================
section "6. EARN TRANSACTIONS"

# Record youssef's balance before earn
BALANCE_BEFORE=$youssef_BALANCE

# 6.1 Earn points for youssef at Café Beirut (earnRate=10, amount=50 AED → 500 base pts, 2x offer = 1000 wallet)
RES=$(call POST "$BASE/transactions/earn" "$Hafez_TOKEN" "{\"merchantId\":\"$CAFE_ID\",\"userId\":\"$youssef_ID\",\"amountAed\":50}")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "Earn 50 AED at Café (=500 base pts)" "201" "$CODE" "$BODY"
assert "Transaction type is earn" '"type":"earn"' "$BODY"
assert "Points earned = 500" '"pointsEarned":500' "$BODY"

# 6.2 Verify youssef's balance increased
RES=$(call GET "$BASE/wallets/my" "$youssef_TOKEN")
BODY=$(parse_body "$RES")
NEW_BALANCE=$(echo "$BODY" | python3 -c "
import sys,json
ws=json.load(sys.stdin)
for w in ws:
    if w.get('merchantId') is None: print(w['balance']); break
" 2>/dev/null)
EXPECTED=$((BALANCE_BEFORE + 1000))
TOTAL=$((TOTAL + 1))
if [ "$NEW_BALANCE" = "$EXPECTED" ]; then
  PASS=$((PASS + 1))
  echo -e "  ${green}✓ PASS${nc} — youssef balance: $BALANCE_BEFORE → $NEW_BALANCE (expected $EXPECTED)"
else
  FAIL=$((FAIL + 1))
  echo -e "  ${red}✗ FAIL${nc} — youssef balance: expected $EXPECTED, got $NEW_BALANCE"
fi
youssef_BALANCE=$NEW_BALANCE

# 6.3 Earn with small amount (1 AED × 10 = 10 base pts, 2x offer = 20 wallet)
RES=$(call POST "$BASE/transactions/earn" "$Hafez_TOKEN" "{\"merchantId\":\"$CAFE_ID\",\"userId\":\"$youssef_ID\",\"amountAed\":1}")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "Earn 1 AED (10 pts)" "201" "$CODE" "$BODY"
assert "Points earned = 10" '"pointsEarned":10' "$BODY"
youssef_BALANCE=$((youssef_BALANCE + 20))

# 6.4 Earn with decimal amount (7.50 AED × 10 = 75 base pts, 2x offer = 150 wallet)
RES=$(call POST "$BASE/transactions/earn" "$Hafez_TOKEN" "{\"merchantId\":\"$CAFE_ID\",\"userId\":\"$youssef_ID\",\"amountAed\":7.5}")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "Earn 7.50 AED (75 pts)" "201" "$CODE" "$BODY"
assert "Points earned = 75" '"pointsEarned":75' "$BODY"
youssef_BALANCE=$((youssef_BALANCE + 150))

# 6.5 Earn at different merchant (Bloom: earnRate 15, minSpend 50, amount 50 AED → 750 pts)
RES=$(call POST "$BASE/transactions/earn" "$Hafez_TOKEN" "{\"merchantId\":\"$BLOOM_ID\",\"userId\":\"$youssef_ID\",\"amountAed\":50}")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "Earn 50 AED at Bloom (750 pts)" "201" "$CODE" "$BODY"
assert "Points earned = 750" '"pointsEarned":750' "$BODY"
youssef_BALANCE=$((youssef_BALANCE + 750))

# 6.6 Earn with 0 amount (should fail, min 0.01)
RES=$(call POST "$BASE/transactions/earn" "$Hafez_TOKEN" "{\"merchantId\":\"$CAFE_ID\",\"userId\":\"$youssef_ID\",\"amountAed\":0}")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "Earn 0 AED → 400" "400" "$CODE" "$BODY"

# 6.7 Earn with negative amount
RES=$(call POST "$BASE/transactions/earn" "$Hafez_TOKEN" "{\"merchantId\":\"$CAFE_ID\",\"userId\":\"$youssef_ID\",\"amountAed\":-10}")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "Earn negative amount → 400" "400" "$CODE" "$BODY"

# 6.8 Earn missing merchantId
RES=$(call POST "$BASE/transactions/earn" "$Hafez_TOKEN" "{\"userId\":\"$youssef_ID\",\"amountAed\":50}")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "Earn missing merchantId → 400" "400" "$CODE" "$BODY"

# 6.9 Earn missing userId
RES=$(call POST "$BASE/transactions/earn" "$Hafez_TOKEN" "{\"merchantId\":\"$CAFE_ID\",\"amountAed\":50}")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "Earn missing userId → 400" "400" "$CODE" "$BODY"

# 6.10 Earn missing amountAed
RES=$(call POST "$BASE/transactions/earn" "$Hafez_TOKEN" "{\"merchantId\":\"$CAFE_ID\",\"userId\":\"$youssef_ID\"}")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "Earn missing amountAed → 400" "400" "$CODE" "$BODY"

# 6.11 Earn without auth
RES=$(call POST "$BASE/transactions/earn" "" "{\"merchantId\":\"$CAFE_ID\",\"userId\":\"$youssef_ID\",\"amountAed\":50}")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "Earn no auth → 401" "401" "$CODE" "$BODY"

# ============================================================
#  7. TRANSACTIONS — Redeem Points
# ============================================================
section "7. REDEEM TRANSACTIONS"

echo -e "  ${yellow}youssef balance before redeem: ${youssef_BALANCE} EP${nc}"

# 7.1 Redeem 100 points at Café Beirut
RES=$(call POST "$BASE/transactions/redeem" "$Hafez_TOKEN" "{\"merchantId\":\"$CAFE_ID\",\"userId\":\"$youssef_ID\",\"points\":100}")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "Redeem 100 pts from youssef" "201" "$CODE" "$BODY"
assert "Transaction type is redeem" '"type":"redeem"' "$BODY"
youssef_BALANCE=$((youssef_BALANCE - 100))

# 7.2 Verify balance decreased
RES=$(call GET "$BASE/wallets/my" "$youssef_TOKEN")
BODY=$(parse_body "$RES")
NEW_BALANCE=$(echo "$BODY" | python3 -c "
import sys,json
ws=json.load(sys.stdin)
for w in ws:
    if w.get('merchantId') is None: print(w['balance']); break
" 2>/dev/null)
TOTAL=$((TOTAL + 1))
if [ "$NEW_BALANCE" = "$youssef_BALANCE" ]; then
  PASS=$((PASS + 1))
  echo -e "  ${green}✓ PASS${nc} — youssef balance after redeem: $NEW_BALANCE (expected $youssef_BALANCE)"
else
  FAIL=$((FAIL + 1))
  echo -e "  ${red}✗ FAIL${nc} — Expected $youssef_BALANCE, got $NEW_BALANCE"
fi

# 7.3 Redeem more than balance (should fail)
HUGE_POINTS=$((youssef_BALANCE + 99999))
RES=$(call POST "$BASE/transactions/redeem" "$Hafez_TOKEN" "{\"merchantId\":\"$CAFE_ID\",\"userId\":\"$youssef_ID\",\"points\":$HUGE_POINTS}")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "Redeem > balance → 400" "400" "$CODE" "$BODY"
assert "Insufficient balance msg" "Insufficient" "$BODY"

# 7.4 Redeem 0 points (min is 1)
RES=$(call POST "$BASE/transactions/redeem" "$Hafez_TOKEN" "{\"merchantId\":\"$CAFE_ID\",\"userId\":\"$youssef_ID\",\"points\":0}")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "Redeem 0 points → 400" "400" "$CODE" "$BODY"

# 7.5 Redeem negative points
RES=$(call POST "$BASE/transactions/redeem" "$Hafez_TOKEN" "{\"merchantId\":\"$CAFE_ID\",\"userId\":\"$youssef_ID\",\"points\":-50}")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "Redeem negative pts → 400" "400" "$CODE" "$BODY"

# 7.6 Redeem fractional points (should fail, must be integer)
RES=$(call POST "$BASE/transactions/redeem" "$Hafez_TOKEN" "{\"merchantId\":\"$CAFE_ID\",\"userId\":\"$youssef_ID\",\"points\":10.5}")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "Redeem fractional pts → 400" "400" "$CODE" "$BODY"

# 7.7 Redeem missing required fields
RES=$(call POST "$BASE/transactions/redeem" "$Hafez_TOKEN" "{\"merchantId\":\"$CAFE_ID\",\"userId\":\"$youssef_ID\"}")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "Redeem missing points → 400" "400" "$CODE" "$BODY"

# 7.8 Redeem at disabled merchant
# Disable redemption first
call PATCH "$BASE/merchants/$FRESH_ID" "$Farag_TOKEN" '{"redemptionEnabled":false}' > /dev/null

RES=$(call POST "$BASE/transactions/redeem" "$Hafez_TOKEN" "{\"merchantId\":\"$FRESH_ID\",\"userId\":\"$youssef_ID\",\"points\":10}")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "Redeem at disabled merchant → 400" "400" "$CODE" "$BODY"
assert "Redemption not enabled msg" "not enabled" "$BODY"

# Re-enable
call PATCH "$BASE/merchants/$FRESH_ID" "$Farag_TOKEN" '{"redemptionEnabled":true}' > /dev/null

# 7.9 Redeem without auth
RES=$(call POST "$BASE/transactions/redeem" "" "{\"merchantId\":\"$CAFE_ID\",\"userId\":\"$youssef_ID\",\"points\":10}")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "Redeem no auth → 401" "401" "$CODE" "$BODY"

# ============================================================
#  8. TRANSACTION HISTORY
# ============================================================
section "8. TRANSACTION HISTORY"

# 8.1 youssef's transaction history
RES=$(call GET "$BASE/transactions/my" "$youssef_TOKEN")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "GET /transactions/my youssef" "200" "$CODE" "$BODY"
TX_COUNT=$(echo "$BODY" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null)
echo -e "  ${yellow}youssef has $TX_COUNT transactions${nc}"

# 8.2 Merchant transaction history
RES=$(call GET "$BASE/transactions/merchant/$CAFE_ID" "$Farag_TOKEN")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "GET merchant transactions" "200" "$CODE" "$BODY"

# 8.3 Merchant stats
RES=$(call GET "$BASE/transactions/merchant/$CAFE_ID/stats" "$Farag_TOKEN")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "GET merchant stats" "200" "$CODE" "$BODY"
assert "Stats has totalPointsIssued" "totalPointsIssued" "$BODY"
assert "Stats has totalPointsRedeemed" "totalPointsRedeemed" "$BODY"
assert "Stats has totalTransactions" "totalTransactions" "$BODY"

# 8.4 Transaction history without auth
RES=$(call GET "$BASE/transactions/my" "")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "GET /transactions/my no auth → 401" "401" "$CODE" "$BODY"

# ============================================================
#  9. QR SESSIONS — Full Flow
# ============================================================
section "9. QR SESSIONS"

# 9.1 Create earn QR session (youssef wants to earn at Café)
RES=$(call POST "$BASE/qr/create" "$youssef_TOKEN" "{\"type\":\"earn\",\"merchantId\":\"$CAFE_ID\"}")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "Create earn QR session" "201" "$CODE" "$BODY"
assert "QR type = earn" '"type":"earn"' "$BODY"
assert "QR status = pending" '"status":"pending"' "$BODY"
EARN_TOKEN=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])" 2>/dev/null)
echo -e "  ${yellow}Earn QR token: $EARN_TOKEN${nc}"

# 9.2 Lookup earn QR session (staff scans it)
RES=$(call GET "$BASE/qr/$EARN_TOKEN" "$Hafez_TOKEN")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "Lookup earn QR session" "200" "$CODE" "$BODY"
assert "Lookup returns user info" "youssef" "$BODY"

# 9.3 Complete earn QR session
RES=$(call PATCH "$BASE/qr/$EARN_TOKEN/complete" "$Hafez_TOKEN")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "Complete earn QR session" "200" "$CODE" "$BODY"
assert "QR status = completed" '"status":"completed"' "$BODY"

# 9.4 Lookup completed session (should fail)
RES=$(call GET "$BASE/qr/$EARN_TOKEN" "$Hafez_TOKEN")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "Lookup completed QR → 400" "400" "$CODE" "$BODY"
assert "Already completed msg" "already completed" "$BODY"

# 9.5 Create redeem QR session
RES=$(call POST "$BASE/qr/create" "$youssef_TOKEN" "{\"type\":\"redeem\",\"merchantId\":\"$CAFE_ID\",\"amount\":50}")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "Create redeem QR session" "201" "$CODE" "$BODY"
assert "QR type = redeem" '"type":"redeem"' "$BODY"
REDEEM_TOKEN=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])" 2>/dev/null)
echo -e "  ${yellow}Redeem QR token: $REDEEM_TOKEN${nc}"

# 9.6 Lookup redeem QR
RES=$(call GET "$BASE/qr/$REDEEM_TOKEN" "$Hafez_TOKEN")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "Lookup redeem QR" "200" "$CODE" "$BODY"

# 9.7 Complete redeem QR
RES=$(call PATCH "$BASE/qr/$REDEEM_TOKEN/complete" "$Hafez_TOKEN")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "Complete redeem QR" "200" "$CODE" "$BODY"

# 9.8 Lookup non-existent token
RES=$(call GET "$BASE/qr/XXXXXX" "$Hafez_TOKEN")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "Lookup non-existent QR → 404" "404" "$CODE" "$BODY"

# 9.9 Create QR without auth
RES=$(call POST "$BASE/qr/create" "" "{\"type\":\"earn\",\"merchantId\":\"$CAFE_ID\"}")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "Create QR no auth → 401" "401" "$CODE" "$BODY"

# 9.10 Create QR with invalid type
RES=$(call POST "$BASE/qr/create" "$youssef_TOKEN" "{\"type\":\"invalid\",\"merchantId\":\"$CAFE_ID\"}")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "Create QR invalid type → 400" "400" "$CODE" "$BODY"

# 9.11 Create QR missing merchantId
RES=$(call POST "$BASE/qr/create" "$youssef_TOKEN" '{"type":"earn"}')
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "Create QR missing merchantId → 400" "400" "$CODE" "$BODY"

# ============================================================
# 10. PROGRAMS
# ============================================================
section "10. LOYALTY PROGRAMS"

# 10.1 youssef's programs
RES=$(call GET "$BASE/programs/my" "$youssef_TOKEN")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "GET /programs/my youssef" "200" "$CODE" "$BODY"
PROG_COUNT=$(echo "$BODY" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null)
echo -e "  ${yellow}youssef has $PROG_COUNT programs${nc}"

# 10.2 Hafez's programs
RES=$(call GET "$BASE/programs/my" "$Hafez_TOKEN")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "GET /programs/my Hafez" "200" "$CODE" "$BODY"

# 10.3 Programs without auth
RES=$(call GET "$BASE/programs/my" "")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "GET /programs/my no auth → 401" "401" "$CODE" "$BODY"

# ============================================================
# 11. END-TO-END: Full Earn Flow via QR
# ============================================================
section "11. E2E: Full Earn → Wallet Update"

# Save balance
E2E_BEFORE=$youssef_BALANCE

# Step 1: Member creates earn QR
RES=$(call POST "$BASE/qr/create" "$youssef_TOKEN" "{\"type\":\"earn\",\"merchantId\":\"$BLOOM_ID\"}")
BODY=$(parse_body "$RES")
E2E_TOKEN=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])" 2>/dev/null)
echo -e "  ${yellow}E2E earn token: $E2E_TOKEN${nc}"

# Step 2: Staff looks up the code
RES=$(call GET "$BASE/qr/$E2E_TOKEN" "$Hafez_TOKEN")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "E2E: Staff looks up earn QR" "200" "$CODE" "$BODY"
QR_USER_ID=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['userId']['_id'])" 2>/dev/null)

# Step 3: Staff issues points (50 AED × Bloom 15 = 750 pts, meets minSpend 50)
RES=$(call POST "$BASE/transactions/earn" "$Hafez_TOKEN" "{\"merchantId\":\"$BLOOM_ID\",\"userId\":\"$QR_USER_ID\",\"amountAed\":50,\"qrToken\":\"$E2E_TOKEN\"}")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "E2E: Staff earns 50 AED (750 pts)" "201" "$CODE" "$BODY"
assert "E2E: Points = 750" '"pointsEarned":750' "$BODY"

# Step 4: Complete QR
call PATCH "$BASE/qr/$E2E_TOKEN/complete" "$Hafez_TOKEN" > /dev/null

# Step 5: Verify wallet
RES=$(call GET "$BASE/wallets/my" "$youssef_TOKEN")
BODY=$(parse_body "$RES")
E2E_AFTER=$(echo "$BODY" | python3 -c "
import sys,json
ws=json.load(sys.stdin)
for w in ws:
    if w.get('merchantId') is None: print(w['balance']); break
" 2>/dev/null)
EXPECTED=$((E2E_BEFORE + 750))
TOTAL=$((TOTAL + 1))
if [ "$E2E_AFTER" = "$EXPECTED" ]; then
  PASS=$((PASS + 1))
  echo -e "  ${green}✓ PASS${nc} — E2E balance: $E2E_BEFORE → $E2E_AFTER (+750) ✓"
else
  FAIL=$((FAIL + 1))
  echo -e "  ${red}✗ FAIL${nc} — E2E balance: expected $EXPECTED, got $E2E_AFTER"
fi
youssef_BALANCE=$E2E_AFTER

# ============================================================
# 12. E2E: Full Redeem Flow via QR
# ============================================================
section "12. E2E: Full Redeem → Wallet Deduction"

E2E_BEFORE=$youssef_BALANCE

# Step 1: Member creates redeem QR
RES=$(call POST "$BASE/qr/create" "$youssef_TOKEN" "{\"type\":\"redeem\",\"merchantId\":\"$CAFE_ID\",\"amount\":200}")
BODY=$(parse_body "$RES")
REDEEM_E2E_TOKEN=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])" 2>/dev/null)
echo -e "  ${yellow}E2E redeem token: $REDEEM_E2E_TOKEN${nc}"

# Step 2: Staff looks up redeem code
RES=$(call GET "$BASE/qr/$REDEEM_E2E_TOKEN" "$Hafez_TOKEN")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "E2E: Staff looks up redeem QR" "200" "$CODE" "$BODY"
QR_USER_ID=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['userId']['_id'])" 2>/dev/null)

# Step 3: Staff validates redemption (200 pts)
RES=$(call POST "$BASE/transactions/redeem" "$Hafez_TOKEN" "{\"merchantId\":\"$CAFE_ID\",\"userId\":\"$QR_USER_ID\",\"points\":200,\"qrToken\":\"$REDEEM_E2E_TOKEN\"}")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "E2E: Staff redeems 200 pts" "201" "$CODE" "$BODY"

# Step 4: Complete QR
call PATCH "$BASE/qr/$REDEEM_E2E_TOKEN/complete" "$Hafez_TOKEN" > /dev/null

# Step 5: Verify wallet decreased
RES=$(call GET "$BASE/wallets/my" "$youssef_TOKEN")
BODY=$(parse_body "$RES")
E2E_AFTER=$(echo "$BODY" | python3 -c "
import sys,json
ws=json.load(sys.stdin)
for w in ws:
    if w.get('merchantId') is None: print(w['balance']); break
" 2>/dev/null)
EXPECTED=$((E2E_BEFORE - 200))
TOTAL=$((TOTAL + 1))
if [ "$E2E_AFTER" = "$EXPECTED" ]; then
  PASS=$((PASS + 1))
  echo -e "  ${green}✓ PASS${nc} — E2E balance: $E2E_BEFORE → $E2E_AFTER (-200) ✓"
else
  FAIL=$((FAIL + 1))
  echo -e "  ${red}✗ FAIL${nc} — E2E balance: expected $EXPECTED, got $E2E_AFTER"
fi
youssef_BALANCE=$E2E_AFTER

# ============================================================
# 13. CROSS-ROLE TESTS
# ============================================================
section "13. CROSS-ROLE VERIFICATION"

# 13.1 Verify youssef has ONLY member role (shouldn't have staff or admin data)
RES=$(call GET "$BASE/users/me" "$youssef_TOKEN")
BODY=$(parse_body "$RES")
youssef_ROLES=$(echo "$BODY" | python3 -c "import sys,json; print(','.join(json.load(sys.stdin).get('roles',[])))" 2>/dev/null)
TOTAL=$((TOTAL + 1))
if [ "$youssef_ROLES" = "member" ]; then
  PASS=$((PASS + 1))
  echo -e "  ${green}✓ PASS${nc} — youssef roles = [member] only"
else
  FAIL=$((FAIL + 1))
  echo -e "  ${red}✗ FAIL${nc} — youssef roles = [$youssef_ROLES], expected [member]"
fi

# 13.2 Verify Hafez has member+staff
Hafez_ROLES=$(call GET "$BASE/users/me" "$Hafez_TOKEN" | sed '$d' | python3 -c "import sys,json; print(','.join(sorted(json.load(sys.stdin).get('roles',[]))))" 2>/dev/null)
TOTAL=$((TOTAL + 1))
if [ "$Hafez_ROLES" = "member,staff" ]; then
  PASS=$((PASS + 1))
  echo -e "  ${green}✓ PASS${nc} — Hafez roles = [member, staff]"
else
  FAIL=$((FAIL + 1))
  echo -e "  ${red}✗ FAIL${nc} — Hafez roles = [$Hafez_ROLES], expected [member,staff]"
fi

# 13.3 Verify Farag has all 3 roles
Farag_ROLES=$(call GET "$BASE/users/me" "$Farag_TOKEN" | sed '$d' | python3 -c "import sys,json; print(','.join(sorted(json.load(sys.stdin).get('roles',[]))))" 2>/dev/null)
TOTAL=$((TOTAL + 1))
if [ "$Farag_ROLES" = "admin,member,staff" ]; then
  PASS=$((PASS + 1))
  echo -e "  ${green}✓ PASS${nc} — Farag roles = [admin, member, staff]"
else
  FAIL=$((FAIL + 1))
  echo -e "  ${red}✗ FAIL${nc} — Farag roles = [$Farag_ROLES], expected [admin,member,staff]"
fi

# 13.4 Verify youssef has no merchantId
youssef_MERCHANT=$(call GET "$BASE/users/me" "$youssef_TOKEN" | sed '$d' | python3 -c "import sys,json; print(json.load(sys.stdin).get('merchantId','null'))" 2>/dev/null)
TOTAL=$((TOTAL + 1))
if [ "$youssef_MERCHANT" = "None" ] || [ "$youssef_MERCHANT" = "null" ]; then
  PASS=$((PASS + 1))
  echo -e "  ${green}✓ PASS${nc} — youssef has no merchantId"
else
  FAIL=$((FAIL + 1))
  echo -e "  ${red}✗ FAIL${nc} — youssef merchantId = $youssef_MERCHANT, expected null"
fi

# 13.5 Verify Hafez is linked to Café Beirut
Hafez_MERCHANT=$(call GET "$BASE/users/me" "$Hafez_TOKEN" | sed '$d' | python3 -c "import sys,json; print(json.load(sys.stdin).get('merchantId','null'))" 2>/dev/null)
TOTAL=$((TOTAL + 1))
if [ "$Hafez_MERCHANT" = "$CAFE_ID" ]; then
  PASS=$((PASS + 1))
  echo -e "  ${green}✓ PASS${nc} — Hafez linked to Café Beirut"
else
  FAIL=$((FAIL + 1))
  echo -e "  ${red}✗ FAIL${nc} — Hafez merchantId = $Hafez_MERCHANT, expected $CAFE_ID"
fi

# ============================================================
# 14. MERCHANT STATS AFTER TRANSACTIONS
# ============================================================
section "14. MERCHANT STATS VERIFICATION"

# 14.1 Café Beirut stats should reflect our test transactions
RES=$(call GET "$BASE/transactions/merchant/$CAFE_ID/stats" "$Farag_TOKEN")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "Café stats after tests" "200" "$CODE" "$BODY"
echo -e "  ${yellow}Café stats: $BODY${nc}"

# 14.2 Bloom stats
RES=$(call GET "$BASE/transactions/merchant/$BLOOM_ID/stats" "$Farag_TOKEN")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "Bloom stats" "200" "$CODE" "$BODY"
echo -e "  ${yellow}Bloom stats: $BODY${nc}"

# 14.3 Stats for a merchant with potentially no transactions
RES=$(call GET "$BASE/transactions/merchant/$FRESH_ID/stats" "$Farag_TOKEN")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "FreshMart stats (may be empty)" "200" "$CODE" "$BODY"

# ============================================================
# 15. ADMIN — Merchant Management
# ============================================================
section "15. ADMIN MERCHANT MANAGEMENT"

# 15.1 Update merchant name
RES=$(call PATCH "$BASE/merchants/$NEW_MERCHANT_ID" "$Farag_TOKEN" '{"name":"Renamed Bakery"}')
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "Rename merchant" "200" "$CODE" "$BODY"
assert "New name applied" "Renamed Bakery" "$BODY"

# 15.2 Toggle crossSmeRedemption
RES=$(call PATCH "$BASE/merchants/$CAFE_ID" "$Farag_TOKEN" '{"crossSmeRedemption":true}')
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "Enable crossSmeRedemption" "200" "$CODE" "$BODY"
assert "crossSmeRedemption = true" '"crossSmeRedemption":true' "$BODY"

# 15.3 Update multiple fields at once
RES=$(call PATCH "$BASE/merchants/$NEW_MERCHANT_ID" "$Farag_TOKEN" '{"earnRate":20,"description":"Updated desc","category":"Bakery"}')
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "Update multiple fields" "200" "$CODE" "$BODY"
assert "earnRate = 20" '"earnRate":20' "$BODY"
assert "Category = Bakery" "Bakery" "$BODY"

# 15.4 Verify merchant count (should be 4: 3 seeded + 1 created)
RES=$(call GET "$BASE/merchants" "")
BODY=$(parse_body "$RES")
MERCHANT_COUNT=$(echo "$BODY" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null)
TOTAL=$((TOTAL + 1))
if [ "$MERCHANT_COUNT" -ge 4 ]; then
  PASS=$((PASS + 1))
  echo -e "  ${green}✓ PASS${nc} — Merchant count: $MERCHANT_COUNT (≥ 4)"
else
  FAIL=$((FAIL + 1))
  echo -e "  ${red}✗ FAIL${nc} — Merchant count: $MERCHANT_COUNT, expected ≥ 4"
fi

# ============================================================
# 16. EDGE CASES & SECURITY
# ============================================================
section "16. EDGE CASES & SECURITY"

# 16.1 Access protected endpoint without Authorization header
RES=$(call GET "$BASE/wallets/my" "")
CODE=$(parse_code "$RES")
assert_status "No auth header → 401" "401" "$CODE" ""

# 16.2 Access with malformed JWT
RES=$(call GET "$BASE/wallets/my" "Bearer not.a.jwt")
CODE=$(parse_code "$RES")
assert_status "Malformed JWT → 401" "401" "$CODE" ""

# 16.3 Send empty body to POST endpoints
RES=$(call POST "$BASE/transactions/earn" "$Hafez_TOKEN" '{}')
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "Earn empty body → 400" "400" "$CODE" "$BODY"

RES=$(call POST "$BASE/transactions/redeem" "$Hafez_TOKEN" '{}')
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "Redeem empty body → 400" "400" "$CODE" "$BODY"

# 16.4 Send non-JSON content
RES=$(curl -s -w "\n%{http_code}" -X POST "$BASE/auth/login" -H "Content-Type: application/json" -d "this is not json")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "Non-JSON body → 400" "400" "$CODE" "$BODY"

# 16.5 Large earnRate boundary
RES=$(call POST "$BASE/merchants" "$Farag_TOKEN" '{"name":"MaxRate","earnRate":1000}')
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "earnRate max 1000 → 201" "201" "$CODE" "$BODY"

RES=$(call POST "$BASE/merchants" "$Farag_TOKEN" '{"name":"OverRate","earnRate":1001}')
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "earnRate > 1000 → 400" "400" "$CODE" "$BODY"

# 16.6 Earn at a newly created merchant (no existing wallets)
RES=$(call POST "$BASE/transactions/earn" "$Hafez_TOKEN" "{\"merchantId\":\"$NEW_MERCHANT_ID\",\"userId\":\"$youssef_ID\",\"amountAed\":5}")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "Earn at new merchant (auto-create wallet)" "201" "$CODE" "$BODY"

# 16.7 Very large point earn (stress test for number handling)
RES=$(call POST "$BASE/transactions/earn" "$Hafez_TOKEN" "{\"merchantId\":\"$CAFE_ID\",\"userId\":\"$youssef_ID\",\"amountAed\":9999.99}")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "Earn large amount (9999.99 AED)" "201" "$CODE" "$BODY"

# ============================================================
# 17. NEWLY REGISTERED USER — Clean State
# ============================================================
section "17. NEW USER — CLEAN STATE"

# 17.1 Login as newly registered user
RES=$(call GET "$BASE/users/me" "$NEW_TOKEN")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "New user profile" "200" "$CODE" "$BODY"
NEW_USER_ID=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['_id'])" 2>/dev/null)

# 17.2 New user has empty wallets
RES=$(call GET "$BASE/wallets/my" "$NEW_TOKEN")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "New user wallets" "200" "$CODE" "$BODY"
WALLET_COUNT=$(echo "$BODY" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null)
echo -e "  ${yellow}New user wallet count: $WALLET_COUNT${nc}"

# 17.3 New user has empty transactions
RES=$(call GET "$BASE/transactions/my" "$NEW_TOKEN")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "New user transactions (empty list)" "200" "$CODE" "$BODY"

# 17.4 New user can create QR
RES=$(call POST "$BASE/qr/create" "$NEW_TOKEN" "{\"type\":\"earn\",\"merchantId\":\"$CAFE_ID\"}")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "New user creates QR" "201" "$CODE" "$BODY"

# 17.5 Earn points for new user (creates wallet on-the-fly)
RES=$(call POST "$BASE/transactions/earn" "$Hafez_TOKEN" "{\"merchantId\":\"$CAFE_ID\",\"userId\":\"$NEW_USER_ID\",\"amountAed\":10}")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "Earn for new user (auto-wallet)" "201" "$CODE" "$BODY"

# 17.6 Verify new user now has a wallet with balance
RES=$(call GET "$BASE/wallets/my" "$NEW_TOKEN")
BODY=$(parse_body "$RES")
NEW_BALANCE=$(echo "$BODY" | python3 -c "
import sys,json
ws=json.load(sys.stdin)
total=sum(w['balance'] for w in ws)
print(total)
" 2>/dev/null)
TOTAL=$((TOTAL + 1))
if [ "$NEW_BALANCE" -gt 0 ] 2>/dev/null; then
  PASS=$((PASS + 1))
  echo -e "  ${green}✓ PASS${nc} — New user balance: $NEW_BALANCE EP"
else
  FAIL=$((FAIL + 1))
  echo -e "  ${red}✗ FAIL${nc} — New user balance should be >0, got: $NEW_BALANCE"
fi

# ============================================================
# 18. OFFERS — Full CRUD
# ============================================================
section "18. OFFERS — FULL CRUD"

# 18.1 Get active offers (seeded)
RES=$(call GET "$BASE/offers/active" "$youssef_TOKEN")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "GET /offers/active" "200" "$CODE" "$BODY"
OFFER_COUNT=$(echo "$BODY" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null)
echo -e "  ${yellow}Active offers: $OFFER_COUNT${nc}"

# 18.2 Get offers by merchant
RES=$(call GET "$BASE/offers/merchant/$CAFE_ID" "$youssef_TOKEN")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "GET /offers/merchant/:id" "200" "$CODE" "$BODY"

# 18.3 Get active offers by merchant
RES=$(call GET "$BASE/offers/merchant/$CAFE_ID/active" "$youssef_TOKEN")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "GET /offers/merchant/:id/active" "200" "$CODE" "$BODY"

# 18.4 Create offer (admin/staff)
STARTS=$(date -u +"%Y-%m-%dT%H:%M:%S.000Z")
ENDS=$(date -u -v+7d +"%Y-%m-%dT%H:%M:%S.000Z" 2>/dev/null || date -u -d "+7 days" +"%Y-%m-%dT%H:%M:%S.000Z")
RES=$(call POST "$BASE/offers" "$Farag_TOKEN" "{\"merchantId\":\"$CAFE_ID\",\"title\":\"Test Offer\",\"type\":\"bonus\",\"value\":2,\"startsAt\":\"$STARTS\",\"endsAt\":\"$ENDS\"}")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "POST /offers create" "201" "$CODE" "$BODY"
assert "Offer title returned" "Test Offer" "$BODY"
OFFER_ID=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['_id'])" 2>/dev/null)

# 18.5 Create offer without auth → 401
RES=$(call POST "$BASE/offers" "" "{\"merchantId\":\"$CAFE_ID\",\"title\":\"No Auth\",\"type\":\"bonus\",\"value\":1,\"startsAt\":\"$STARTS\",\"endsAt\":\"$ENDS\"}")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "POST /offers no auth → 401" "401" "$CODE" "$BODY"

# 18.6 Create offer as member-only → 403
RES=$(call POST "$BASE/offers" "$youssef_TOKEN" "{\"merchantId\":\"$CAFE_ID\",\"title\":\"Member Try\",\"type\":\"bonus\",\"value\":1,\"startsAt\":\"$STARTS\",\"endsAt\":\"$ENDS\"}")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "POST /offers member → 403" "403" "$CODE" "$BODY"

# 18.7 Create offer missing required fields → 400
RES=$(call POST "$BASE/offers" "$Farag_TOKEN" '{"merchantId":"abc"}')
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "POST /offers missing fields → 400" "400" "$CODE" "$BODY"

# 18.8 Update offer
RES=$(call PATCH "$BASE/offers/$OFFER_ID" "$Farag_TOKEN" '{"title":"Updated Offer","value":5}')
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "PATCH /offers/:id update" "200" "$CODE" "$BODY"
assert "Updated title" "Updated Offer" "$BODY"

# 18.9 Delete offer (admin only)
RES=$(call DELETE "$BASE/offers/$OFFER_ID" "$Farag_TOKEN")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "DELETE /offers/:id" "200" "$CODE" "$BODY"

# 18.10 Delete offer as staff → 403
# Create one first as admin
RES=$(call POST "$BASE/offers" "$Farag_TOKEN" "{\"merchantId\":\"$CAFE_ID\",\"title\":\"Staff Offer\",\"type\":\"discount\",\"value\":10,\"startsAt\":\"$STARTS\",\"endsAt\":\"$ENDS\"}")
BODY=$(parse_body "$RES")
STAFF_OFFER_ID=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['_id'])" 2>/dev/null)
RES=$(call DELETE "$BASE/offers/$STAFF_OFFER_ID" "$Hafez_TOKEN")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "DELETE /offers staff → 403" "403" "$CODE" "$BODY"
# Clean up: admin deletes it
call DELETE "$BASE/offers/$STAFF_OFFER_ID" "$Farag_TOKEN" > /dev/null

# ============================================================
# 19. PROGRAMS — Link, Available, Unlink
# ============================================================
section "19. PROGRAMS — LINK & UNLINK"

# 19.1 Get available programs
RES=$(call GET "$BASE/programs/available" "$youssef_TOKEN")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "GET /programs/available" "200" "$CODE" "$BODY"

# 19.2 Available programs without auth → 401
RES=$(call GET "$BASE/programs/available" "")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "GET /programs/available no auth → 401" "401" "$CODE" "$BODY"

# 19.3 Link a program (use new user who may have unlinked programs)
# First check what's available for the new user
RES=$(call GET "$BASE/programs/available" "$NEW_TOKEN")
BODY=$(parse_body "$RES")
AVAIL_PROG=$(echo "$BODY" | python3 -c "
import sys,json
progs=json.load(sys.stdin)
if progs: print(progs[0]['programName'])
else: print('')
" 2>/dev/null)

if [ -n "$AVAIL_PROG" ] && [ "$AVAIL_PROG" != "" ]; then
  RES=$(call POST "$BASE/programs/link" "$NEW_TOKEN" "{\"programName\":\"$AVAIL_PROG\"}")
  BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
  assert_status "POST /programs/link" "201" "$CODE" "$BODY"
  assert "Linked program name matches" "$AVAIL_PROG" "$BODY"
  LINKED_PROG_ID=$(echo "$BODY" | python3 -c "import sys,json; print(json.load(sys.stdin)['_id'])" 2>/dev/null)

  # 19.4 Link duplicate program → should fail
  RES=$(call POST "$BASE/programs/link" "$NEW_TOKEN" "{\"programName\":\"$AVAIL_PROG\"}")
  BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
  assert_status "POST /programs/link duplicate → 400" "400" "$CODE" "$BODY"

  # 19.5 Unlink program
  RES=$(call DELETE "$BASE/programs/$LINKED_PROG_ID" "$NEW_TOKEN")
  BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
  assert_status "DELETE /programs/:id unlink" "200" "$CODE" "$BODY"
else
  echo -e "  ${yellow}⚠ No available programs for new user — skipping link/unlink tests${nc}"
fi

# 19.6 Link without auth → 401
RES=$(call POST "$BASE/programs/link" "" '{"programName":"Share"}')
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "POST /programs/link no auth → 401" "401" "$CODE" "$BODY"

# ============================================================
# 20. STAFF MANAGEMENT
# ============================================================
section "20. STAFF MANAGEMENT"

# 20.1 Get staff list (Hafez is the owner of all seeded merchants)
RES=$(call GET "$BASE/merchants/$CAFE_ID/staff" "$Hafez_TOKEN")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "GET /merchants/:id/staff" "200" "$CODE" "$BODY"
STAFF_COUNT=$(echo "$BODY" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null)
echo -e "  ${yellow}Staff count: $STAFF_COUNT${nc}"

# 20.2 Get staff without auth → 401
RES=$(call GET "$BASE/merchants/$CAFE_ID/staff" "")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "GET staff no auth → 401" "401" "$CODE" "$BODY"

# 20.3 Get staff as member → 403
RES=$(call GET "$BASE/merchants/$CAFE_ID/staff" "$youssef_TOKEN")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "GET staff as member → 403" "403" "$CODE" "$BODY"

# 20.4 Add staff member
# Get the new user's email
NEW_USER_EMAIL=$(call GET "$BASE/users/me" "$NEW_TOKEN" | sed '$d' | python3 -c "import sys,json; print(json.load(sys.stdin)['email'])" 2>/dev/null)
RES=$(call POST "$BASE/merchants/$CAFE_ID/staff" "$Hafez_TOKEN" "{\"email\":\"$NEW_USER_EMAIL\"}")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "POST /merchants/:id/staff add" "201" "$CODE" "$BODY"

# 20.5 Add staff with invalid email → 400
RES=$(call POST "$BASE/merchants/$CAFE_ID/staff" "$Hafez_TOKEN" '{"email":"notanemail"}')
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "POST staff invalid email → 400" "400" "$CODE" "$BODY"

# 20.6 Add staff without auth → 401
RES=$(call POST "$BASE/merchants/$CAFE_ID/staff" "" '{"email":"test@test.com"}')
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "POST staff no auth → 401" "401" "$CODE" "$BODY"

# 20.7 Remove staff member
RES=$(call DELETE "$BASE/merchants/$CAFE_ID/staff/$NEW_USER_ID" "$Hafez_TOKEN")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "DELETE /merchants/:id/staff/:userId" "200" "$CODE" "$BODY"

# 20.8 Remove staff without auth → 401
RES=$(curl -s -w "\n%{http_code}" -X DELETE -H "Content-Type: application/json" "$BASE/merchants/$CAFE_ID/staff/$NEW_USER_ID")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "DELETE staff no auth → 401" "401" "$CODE" "$BODY"

# ============================================================
# 21. MERCHANT SELF-REGISTRATION
# ============================================================
section "21. MERCHANT SELF-REGISTRATION"

# 21.1 Register a new merchant (member self-onboarding)
RES=$(call POST "$BASE/merchants/register" "$NEW_TOKEN" '{"name":"My New Shop","earnRate":8,"category":"Retail","description":"A test shop"}')
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "POST /merchants/register" "201" "$CODE" "$BODY"
assert "Registered merchant name" "My New Shop" "$BODY"

# 21.2 Register without auth → 401
RES=$(call POST "$BASE/merchants/register" "" '{"name":"No Auth Shop","earnRate":5}')
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "POST /merchants/register no auth → 401" "401" "$CODE" "$BODY"

# 21.3 Register missing required fields → 400
RES=$(call POST "$BASE/merchants/register" "$NEW_TOKEN" '{"name":"No Rate"}')
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "POST /merchants/register missing fields → 400" "400" "$CODE" "$BODY"

# ============================================================
# 22. DAILY STATS
# ============================================================
section "22. DAILY STATS"

# 22.1 Get daily stats for Café Beirut
RES=$(call GET "$BASE/transactions/merchant/$CAFE_ID/stats/daily" "$Farag_TOKEN")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "GET /stats/daily Café" "200" "$CODE" "$BODY"

# 22.2 Get daily stats for Bloom
RES=$(call GET "$BASE/transactions/merchant/$BLOOM_ID/stats/daily" "$Farag_TOKEN")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "GET /stats/daily Bloom" "200" "$CODE" "$BODY"

# 22.3 Daily stats without auth → 401
RES=$(call GET "$BASE/transactions/merchant/$CAFE_ID/stats/daily" "")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "GET daily stats no auth → 401" "401" "$CODE" "$BODY"

# 22.4 Daily stats as member → 403
RES=$(call GET "$BASE/transactions/merchant/$CAFE_ID/stats/daily" "$youssef_TOKEN")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "GET daily stats member → 403" "403" "$CODE" "$BODY"

# ============================================================
# 23. PROFILE UPDATE
# ============================================================
section "23. PROFILE UPDATE"

# 23.1 Update name
RES=$(call PATCH "$BASE/users/me" "$youssef_TOKEN" '{"name":"youssef Updated"}')
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "PATCH /users/me name" "200" "$CODE" "$BODY"
assert "Name updated" "youssef Updated" "$BODY"

# 23.2 Update phone
RES=$(call PATCH "$BASE/users/me" "$youssef_TOKEN" '{"phone":"+971501234567"}')
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "PATCH /users/me phone" "200" "$CODE" "$BODY"
assert "Phone updated" "971501234567" "$BODY"

# 23.3 Restore name
call PATCH "$BASE/users/me" "$youssef_TOKEN" '{"name":"youssef Ahmed","phone":""}' > /dev/null

# 23.4 Update profile without auth → 401
RES=$(call PATCH "$BASE/users/me" "" '{"name":"Hacker"}')
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "PATCH profile no auth → 401" "401" "$CODE" "$BODY"

# ============================================================
# 24. PAGINATION
# ============================================================
section "24. PAGINATION"

# 24.1 Get transactions with page/limit
RES=$(call GET "$BASE/transactions/my?page=1&limit=2" "$youssef_TOKEN")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "GET /transactions/my?page=1&limit=2" "200" "$CODE" "$BODY"
PAGE_COUNT=$(echo "$BODY" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))" 2>/dev/null)
TOTAL=$((TOTAL + 1))
if [ "$PAGE_COUNT" -le 2 ] 2>/dev/null; then
  PASS=$((PASS + 1))
  echo -e "  ${green}✓ PASS${nc} — Pagination returned $PAGE_COUNT items (limit=2)"
else
  FAIL=$((FAIL + 1))
  echo -e "  ${red}✗ FAIL${nc} — Pagination returned $PAGE_COUNT items, expected ≤2"
fi

# 24.2 Merchant transactions with pagination
RES=$(call GET "$BASE/transactions/merchant/$CAFE_ID?page=1&limit=1" "$Farag_TOKEN")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "GET merchant txns?page=1&limit=1" "200" "$CODE" "$BODY"

# ============================================================
# 25. RBAC — ROLE ENFORCEMENT
# ============================================================
section "25. RBAC — ROLE ENFORCEMENT"

# 25.1 Member cannot earn (staff-only)
RES=$(call POST "$BASE/transactions/earn" "$youssef_TOKEN" "{\"merchantId\":\"$CAFE_ID\",\"userId\":\"$youssef_ID\",\"amountAed\":10}")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "Earn as member → 403" "403" "$CODE" "$BODY"

# 25.2 Member cannot redeem (staff-only)
RES=$(call POST "$BASE/transactions/redeem" "$youssef_TOKEN" "{\"merchantId\":\"$CAFE_ID\",\"userId\":\"$youssef_ID\",\"points\":10}")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "Redeem as member → 403" "403" "$CODE" "$BODY"

# 25.3 Member cannot view merchant transactions
RES=$(call GET "$BASE/transactions/merchant/$CAFE_ID" "$youssef_TOKEN")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "Merchant txns as member → 403" "403" "$CODE" "$BODY"

# 25.4 Member cannot view merchant stats
RES=$(call GET "$BASE/transactions/merchant/$CAFE_ID/stats" "$youssef_TOKEN")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "Merchant stats as member → 403" "403" "$CODE" "$BODY"

# 25.5 Staff CAN earn
RES=$(call POST "$BASE/transactions/earn" "$Hafez_TOKEN" "{\"merchantId\":\"$CAFE_ID\",\"userId\":\"$youssef_ID\",\"amountAed\":1}")
BODY=$(parse_body "$RES"); CODE=$(parse_code "$RES")
assert_status "Earn as staff → 201" "201" "$CODE" "$BODY"

# ============================================================
# RESULTS SUMMARY
# ============================================================
echo ""
echo -e "${cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${nc}"
echo -e "${bold}  TEST RESULTS SUMMARY${nc}"
echo -e "${cyan}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${nc}"
echo ""
echo -e "  Total:   ${bold}$TOTAL${nc}"
echo -e "  Passed:  ${green}${bold}$PASS${nc}"
echo -e "  Failed:  ${red}${bold}$FAIL${nc}"
echo ""

if [ "$FAIL" -eq 0 ]; then
  echo -e "  ${green}${bold}🎉 ALL TESTS PASSED!${nc}"
else
  echo -e "  ${red}${bold}⚠️  $FAIL test(s) failed — review above${nc}"
fi
echo ""
