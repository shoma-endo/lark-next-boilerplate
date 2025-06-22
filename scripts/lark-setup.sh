#!/bin/bash
# scripts/lark-setup.sh

echo "▶ tailwindcss init -p"
npx tailwindcss init -p

echo "▶ node scripts/setup.js"
node scripts/setup.js
