#!/bin/bash
# MIDFINGER — Khởi động website (Mac / Linux)
# Chạy: bash start.sh

echo ""
echo "🔥 MIDFINGER — Starting..."
echo ""

# Kiểm tra Node.js
if ! command -v node &> /dev/null; then
  echo "❌ Chưa cài Node.js. Tải tại: https://nodejs.org"
  exit 1
fi

echo "✅ Node.js $(node -v) detected"

# Cài backend nếu chưa có node_modules
if [ ! -d "backend/node_modules" ]; then
  echo "📦 Installing backend dependencies..."
  cd backend && npm install && cd ..
fi

# Cài frontend nếu chưa có node_modules
if [ ! -d "frontend/node_modules" ]; then
  echo "📦 Installing frontend dependencies..."
  cd frontend && npm install && cd ..
fi

# Tạo .env nếu chưa có
if [ ! -f "backend/.env" ]; then
  cp backend/.env.example backend/.env
  echo "✅ Created backend/.env"
fi

echo ""
echo "🚀 Starting servers..."
echo "   Backend  → http://localhost:4000"
echo "   Frontend → http://localhost:5173"
echo ""
echo "   Nhấn Ctrl+C để dừng"
echo ""

# Chạy backend và frontend song song
(cd backend && node server.js) &
BACKEND_PID=$!

sleep 1

(cd frontend && npm run dev) &
FRONTEND_PID=$!

# Dọn dẹp khi Ctrl+C
trap "kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; echo ''; echo '👋 Đã dừng.'; exit 0" INT

wait
