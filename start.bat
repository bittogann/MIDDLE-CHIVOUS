@echo off
echo.
echo  MIDFINGER -- Starting website...
echo.

:: Kiem tra Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
  echo  Chua cai Node.js. Tai tai: https://nodejs.org
  pause
  exit /b 1
)

:: Cai backend
if not exist "backend\node_modules" (
  echo  Installing backend...
  cd backend
  npm install
  cd ..
)

:: Tao .env
if not exist "backend\.env" (
  copy backend\.env.example backend\.env
)

:: Cai frontend
if not exist "frontend\node_modules" (
  echo  Installing frontend...
  cd frontend
  npm install
  cd ..
)

echo.
echo  Backend  ^> http://localhost:4000
echo  Frontend ^> http://localhost:5173
echo.
echo  Mo 2 cua so Command Prompt:
echo  Terminal 1: cd backend ^&^& node server.js
echo  Terminal 2: cd frontend ^&^& npm run dev
echo.

:: Mo 2 terminal rieng
start "MIDFINGER Backend" cmd /k "cd backend && node server.js"
timeout /t 2 >nul
start "MIDFINGER Frontend" cmd /k "cd frontend && npm run dev"

echo  Da khoi dong! Mo trinh duyet: http://localhost:5173
pause
