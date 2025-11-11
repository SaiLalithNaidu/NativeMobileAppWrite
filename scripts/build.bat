@echo off
REM 🚀 NativeMobile Build Script for Windows
REM Automated build process with error handling

setlocal enabledelayedexpansion

REM Build configuration
set BUILD_TYPE=%1
set PLATFORM=%2

if "%BUILD_TYPE%"=="" set BUILD_TYPE=preview
if "%PLATFORM%"=="" set PLATFORM=all

echo 🚀 Starting NativeMobile Build Process
echo Build Type: %BUILD_TYPE%
echo Platform: %PLATFORM%

REM Step 1: Validate environment
echo 📋 Step 1: Validating environment...
where eas >nul 2>nul
if errorlevel 1 (
    echo ⚠️  EAS CLI not found. Installing...
    npm install -g @expo/eas-cli
    if errorlevel 1 (
        echo ❌ Failed to install EAS CLI
        exit /b 1
    )
)

REM Step 2: Check authentication
echo 🔐 Step 2: Checking authentication...
eas whoami >nul 2>nul
if errorlevel 1 (
    echo ⚠️  Not logged in to EAS. Please run: eas login
    exit /b 1
)

REM Step 3: Install dependencies
echo 📦 Step 3: Installing dependencies...
npm ci
if errorlevel 1 (
    echo ❌ Failed to install dependencies
    exit /b 1
)

REM Step 4: Run pre-build checks
echo 🧪 Step 4: Running pre-build checks...
if not exist "app.json" if not exist "app.config.js" (
    echo ❌ app.json or app.config.js not found
    exit /b 1
)

REM Step 5: Clean and prepare
echo 🧹 Step 5: Cleaning previous builds...
if exist ".expo" rmdir /s /q ".expo"
if exist "node_modules\.cache" rmdir /s /q "node_modules\.cache"
npx expo install --fix
if errorlevel 1 (
    echo ❌ Failed to fix dependencies
    exit /b 1
)

REM Step 6: Build
echo 🏗️  Step 6: Starting build...
if "%BUILD_TYPE%"=="development" (
    eas build --profile development --platform %PLATFORM% --non-interactive
) else if "%BUILD_TYPE%"=="preview" (
    eas build --profile preview --platform %PLATFORM% --non-interactive
) else if "%BUILD_TYPE%"=="production" (
    echo ⚠️  Production build requires additional verification
    set /p "confirm=Are you sure you want to build for production? (y/N): "
    if /i "!confirm!"=="y" (
        eas build --profile production --platform %PLATFORM% --non-interactive
    ) else (
        echo Production build cancelled
        exit /b 0
    )
) else (
    echo ❌ Invalid build type. Use: development, preview, or production
    exit /b 1
)

if errorlevel 1 (
    echo ❌ Build failed
    exit /b 1
)

REM Step 7: Success
echo ✅ Build completed successfully!
echo 📱 Check your builds at: https://expo.dev/accounts/[your-account]/projects

endlocal