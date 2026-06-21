@echo off
REM CMS Quick Start Guide for Windows

color 0A
cls

echo ============================================
echo  CMS - Full Stack Content Management System
echo ============================================
echo.
echo 📋 QUICK START CHECKLIST
echo.
echo ✅ STEP 1: Install PostgreSQL
echo    - Read: POSTGRESQL_SETUP.md
echo    - Install PostgreSQL v12 or higher
echo    - Download from: https://www.postgresql.org/download/windows/
echo    - Remember your postgres password
echo.
echo ✅ STEP 2: Backend Setup
echo    $ cd backend
echo    $ npm install
echo.
echo ✅ STEP 3: Configure Database
echo    $ cp .env.example .env
echo    - Edit .env with your PostgreSQL credentials
echo.
echo ✅ STEP 4: Initialize Database
echo    $ npm run setup-db
echo    - Creates database, user, tables, and indexes
echo.
echo ✅ STEP 5: Start Backend (Command Prompt 1)
echo    $ cd backend
echo    $ npm start
echo    - Look for: 'CMS Backend running on http://localhost:5000'
echo.
echo ✅ STEP 6: Start Frontend (Command Prompt 2)
echo    $ cd frontend
echo    $ npm install (if not done already)
echo    $ npm start
echo    - Browser opens to http://localhost:3000
echo.
echo ============================================
echo.
echo 🎯 FIRST TIME USAGE
echo.
echo 1. Go to http://localhost:3000/register
echo 2. Create your account
echo 3. Log in with your credentials
echo 4. Click on Dashboard
echo 5. Click "Create New Post"
echo 6. Write and publish your first post!
echo.
echo ============================================
echo.
echo 📚 DOCUMENTATION
echo.
echo Main Documentation:    README.md
echo PostgreSQL Setup:      POSTGRESQL_SETUP.md
echo Backend Code:          backend\server.js
echo Database Connection:   backend\db.js
echo.
echo ============================================
echo.
echo 🔍 VERIFY EVERYTHING IS WORKING
echo.
echo Backend Health Check:
echo   Open http://localhost:5000/api/health in your browser
echo.
echo Frontend:
echo   Open http://localhost:3000 in your browser
echo.
echo ============================================
echo.
echo ⚠️  COMMON ISSUES
echo.
echo "PostgreSQL won't connect?"
echo   - Make sure PostgreSQL service is running
echo   - Check Services (Windows Key + R, type 'services.msc')
echo   - Look for 'postgresql-x64-XX' and ensure it's Running
echo.
echo "Database error?"
echo   - Run: npm run setup-db
echo   - Check .env file has correct credentials
echo.
echo "Port already in use?"
echo   - Change PORT in backend\.env to 5001
echo   - Or: set PORT=3001 && npm start (for frontend)
echo.
echo ============================================
pause
