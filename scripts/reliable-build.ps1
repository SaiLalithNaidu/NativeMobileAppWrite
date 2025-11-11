#!/usr/bin/env pwsh
# Reliable EAS Build Script
# Runs all checks before building to prevent failures

param(
    [ValidateSet("android", "ios", "all")]
    [string]$Platform = "android",
    
    [ValidateSet("development", "preview", "production")]
    [string]$Profile = "preview"
)

Write-Host "🚀 Starting Reliable Build Process" -ForegroundColor Cyan
Write-Host "Platform: $Platform | Profile: $Profile" -ForegroundColor Yellow
Write-Host ""

# Step 1: Check EAS Login
Write-Host "🔐 Checking EAS authentication..." -ForegroundColor Blue
$whoami = eas whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Not logged in to EAS" -ForegroundColor Red
    Write-Host "Please run: eas login" -ForegroundColor Yellow
    exit 1
}
Write-Host "✅ Logged in as: $whoami" -ForegroundColor Green
Write-Host ""

# Step 2: Install dependencies
Write-Host "📦 Installing dependencies..." -ForegroundColor Blue
npm ci --loglevel=error
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to install dependencies" -ForegroundColor Red
    exit 1
}
Write-Host "✅ Dependencies installed" -ForegroundColor Green
Write-Host ""

# Step 3: Run Expo Doctor
Write-Host "🔍 Running Expo Doctor checks..." -ForegroundColor Blue
$doctorOutput = npx expo-doctor 2>&1
if ($doctorOutput -match "(\d+)/(\d+) checks passed") {
    $passed = $matches[1]
    $total = $matches[2]
    if ($passed -eq $total) {
        Write-Host "✅ All $total checks passed!" -ForegroundColor Green
    } else {
        Write-Host "⚠️  Only $passed/$total checks passed" -ForegroundColor Yellow
        Write-Host $doctorOutput
        $continue = Read-Host "Continue anyway? (y/N)"
        if ($continue -ne "y") {
            Write-Host "❌ Build cancelled" -ForegroundColor Red
            exit 1
        }
    }
}
Write-Host ""

# Step 4: Start Build
Write-Host "🏗️  Starting EAS build..." -ForegroundColor Blue
Write-Host "Platform: $Platform | Profile: $Profile" -ForegroundColor Cyan
Write-Host ""

eas build --platform $Platform --profile $Profile --non-interactive

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Build started successfully!" -ForegroundColor Green
    Write-Host "📱 Check status at: https://expo.dev/accounts/sailalith/projects/ramesh-aqua/builds" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "❌ Build failed to start" -ForegroundColor Red
    Write-Host "Check the logs above for details" -ForegroundColor Yellow
    exit 1
}