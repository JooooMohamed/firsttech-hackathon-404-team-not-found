#!/bin/bash
# ============================================================
#  EasyPoints — Demo Reset Script
#  Resets DB to clean seed state for a fresh demo
# ============================================================

set -e

green='\033[0;32m'
yellow='\033[1;33m'
bold='\033[1m'
nc='\033[0m'

echo ""
echo -e "${bold}🔄 EasyPoints Demo Reset${nc}"
echo ""

# 1. Clean the database
echo -e "${yellow}Cleaning database...${nc}"
mongosh --quiet mongodb://localhost:27017/easypoints --eval '
  db.transactions.deleteMany({});
  db.qrsessions.deleteMany({});
  db.merchants.deleteMany({ name: { $nin: ["Café Beirut", "Bloom Flowers", "FreshMart"] } });
  db.users.deleteMany({ email: { $nin: ["youssef@demo.com", "hafez@demo.com", "farag@demo.com"] } });
  db.wallets.updateMany({}, { $set: { balance: 0 } });
  db.offers.deleteMany({});
  db.users.updateOne({ email: "youssef@demo.com" }, { $set: { name: "youssef Ahmed", consentGiven: true } });
  db.users.updateOne({ email: "hafez@demo.com" }, { $set: { name: "Hafez Hassan", consentGiven: true } });
  db.users.updateOne({ email: "farag@demo.com" }, { $set: { name: "Farag Ali", consentGiven: true } });
'
echo -e "${green}✓ Database cleaned${nc}"

# 2. Restart server (re-seeds offers and starting balances)
echo -e "${yellow}Restarting server...${nc}"
lsof -ti:3000 | xargs kill -9 2>/dev/null || true
sleep 1

cd "$(dirname "$0")/server"
node dist/main.js &
SERVER_PID=$!
sleep 3

# 3. Verify server is up
if curl -s http://localhost:3000/api/merchants | grep -q "Café"; then
  echo -e "${green}✓ Server running (PID $SERVER_PID)${nc}"
else
  echo -e "\033[0;31m✗ Server failed to start${nc}"
  exit 1
fi

# 4. Show demo accounts
echo ""
echo -e "${bold}📋 Demo Accounts:${nc}"
echo "  ┌──────────────┬───────────────────┬──────────┬──────────────────────┐"
echo "  │ Name         │ Email             │ Password │ Roles                │"
echo "  ├──────────────┼───────────────────┼──────────┼──────────────────────┤"
echo "  │ youssef Ahmed  │ youssef@demo.com    │ demo123  │ member               │"
echo "  │ Hafez Hassan  │ hafez@demo.com     │ demo123  │ member, staff        │"
echo "  │ Farag Ali   │ farag@demo.com   │ demo123  │ member, staff, admin │"
echo "  └──────────────┴───────────────────┴──────────┴──────────────────────┘"
echo ""
echo -e "${green}${bold}✅ Ready for demo!${nc}"
echo ""
