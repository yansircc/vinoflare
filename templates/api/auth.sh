#!/bin/bash

# Simple login script for Vinoflare API

API_URL="${API_URL:-http://localhost:5173}"

echo "🔐 Vinoflare API - Discord Login"
echo ""

# Get Discord OAuth URL
response=$(curl -s -X POST "$API_URL/api/auth/sign-in/social" \
  -H "Content-Type: application/json" \
  -d '{"provider":"discord"}')

url=$(echo "$response" | grep -o '"url":"[^"]*' | cut -d'"' -f4)

if [ -n "$url" ]; then
  echo "Open this URL in your browser to login:"
  echo ""
  echo "$url"
  echo ""
  echo "After login, you'll be redirected back and your browser will have the session cookie."
  echo ""
  echo "To logout: Clear cookies for localhost:5173 in your browser settings"
else
  echo "❌ Failed to get login URL. Is the API server running?"
fi