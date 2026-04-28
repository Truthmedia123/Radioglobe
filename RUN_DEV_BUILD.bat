@echo off
echo ============================================
echo RadioGlobe Development Build Script
echo ============================================
echo.
echo This script will help you build the RadioGlobe
echo development client for Android.
echo.
echo PREREQUISITES:
echo 1. Expo account (create at https://expo.dev)
echo 2. EAS CLI installed (npm install -g eas-cli)
echo.
echo ============================================
echo.

REM Check if in correct directory
if not exist "package.json" (
    echo ERROR: Not in radio-app directory!
    echo Please run this script from: C:\Users\NOEL FERNANDES\Desktop\Radio 23rd april\radio-app
    pause
    exit /b 1
)

REM Step 1: Login to Expo
echo Step 1: Login to Expo
echo ----------------------
echo You will be prompted for your Expo credentials.
echo.
eas login
if %errorlevel% neq 0 (
    echo Login failed. Please check your credentials.
    pause
    exit /b 1
)

REM Step 2: Build Android development client
echo.
echo Step 2: Building Android Development Client
echo -------------------------------------------
echo This will take 15-20 minutes...
echo.
eas build --platform android --profile development
if %errorlevel% neq 0 (
    echo Build failed. Check the error messages above.
    pause
    exit /b 1
)

echo.
echo ============================================
echo BUILD COMPLETE!
echo ============================================
echo.
echo When the build completes, EAS will display:
echo 1. A QR code to scan with your phone camera
echo 2. An install URL
echo.
echo To test the development client:
echo 1. Install the app on your phone from the QR code
echo 2. Run: npx expo start --dev-client
echo 3. Scan the QR code from Metro with the dev client
echo.
echo Press any key to exit...
pause > nul