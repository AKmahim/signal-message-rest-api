#!/bin/bash

# Signal API Test Script

echo "🧪 Testing Signal REST API"
echo "================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

BASE_URL="http://localhost:3000"

# Test 1: API Health Check
echo "${BLUE}Test 1: API Root Endpoint${NC}"
curl -s $BASE_URL | jq .
echo ""

# Test 2: Signal CLI Health Check
echo "${BLUE}Test 2: Signal CLI Health Check${NC}"
curl -s $BASE_URL/api/health | jq .
echo ""

# Test 3: Send Test Message (Update phone number)
echo "${BLUE}Test 3: Send Test Message${NC}"
read -p "Enter phone number to test (e.g., +1234567890): " PHONE_NUMBER

if [ ! -z "$PHONE_NUMBER" ]; then
  curl -s -X POST $BASE_URL/api/send \
    -H "Content-Type: application/json" \
    -d "{\"phone_number\": \"$PHONE_NUMBER\", \"message\": \"Test message from Signal API - $(date)\"}" | jq .
  echo ""
else
  echo "${RED}Skipped - No phone number provided${NC}"
  echo ""
fi

# Test 4: Admin Panel Access
echo "${BLUE}Test 4: Admin Panel${NC}"
echo "Admin Panel URL: ${GREEN}$BASE_URL/admin${NC}"
echo "Email: admin@example.com"
echo "Password: 12345678"
echo ""

# Test 5: Check Database
echo "${BLUE}Test 5: Database Messages Count${NC}"
if [ -f "data/signal.db" ]; then
  COUNT=$(sqlite3 data/signal.db "SELECT COUNT(*) FROM messages;")
  echo "Total messages in database: ${GREEN}$COUNT${NC}"
else
  echo "${RED}Database not found${NC}"
fi
echo ""

echo "${GREEN}✅ Testing Complete!${NC}"
echo ""
echo "📊 Access Admin Panel: ${BLUE}$BASE_URL/admin${NC}"
