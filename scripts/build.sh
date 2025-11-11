#!/bin/bash

# 🚀 NativeMobile Build Script
# Automated build process with error handling

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Build configuration
BUILD_TYPE=${1:-preview}  # Default to preview build
PLATFORM=${2:-all}       # Default to all platforms

echo -e "${BLUE}🚀 Starting NativeMobile Build Process${NC}"
echo -e "${YELLOW}Build Type: $BUILD_TYPE${NC}"
echo -e "${YELLOW}Platform: $PLATFORM${NC}"

# Function to handle errors
handle_error() {
    echo -e "${RED}❌ Build failed at step: $1${NC}"
    exit 1
}

# Step 1: Validate environment
echo -e "${BLUE}📋 Step 1: Validating environment...${NC}"
if ! command -v eas &> /dev/null; then
    echo -e "${YELLOW}⚠️  EAS CLI not found. Installing...${NC}"
    npm install -g @expo/eas-cli || handle_error "EAS CLI installation"
fi

# Step 2: Check authentication
echo -e "${BLUE}🔐 Step 2: Checking authentication...${NC}"
if ! eas whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to EAS. Please run: eas login${NC}"
    handle_error "EAS authentication"
fi

# Step 3: Install dependencies
echo -e "${BLUE}📦 Step 3: Installing dependencies...${NC}"
npm ci || handle_error "dependency installation"

# Step 4: Run pre-build checks
echo -e "${BLUE}🧪 Step 4: Running pre-build checks...${NC}"

# Check for common issues
if [ ! -f "app.json" ] && [ ! -f "app.config.js" ]; then
    handle_error "app.json or app.config.js not found"
fi

# Validate Firebase config
if [ ! -f "lib/firebase.js" ]; then
    echo -e "${YELLOW}⚠️  Firebase config not found at lib/firebase.js${NC}"
fi

# Step 5: Clean and prepare
echo -e "${BLUE}🧹 Step 5: Cleaning previous builds...${NC}"
rm -rf .expo
rm -rf node_modules/.cache
npx expo install --fix || handle_error "dependency fixing"

# Step 6: Build
echo -e "${BLUE}🏗️  Step 6: Starting build...${NC}"
case $BUILD_TYPE in
    "development")
        eas build --profile development --platform $PLATFORM --non-interactive || handle_error "development build"
        ;;
    "preview")
        eas build --profile preview --platform $PLATFORM --non-interactive || handle_error "preview build"
        ;;
    "production")
        echo -e "${YELLOW}⚠️  Production build requires additional verification${NC}"
        read -p "Are you sure you want to build for production? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
            eas build --profile production --platform $PLATFORM --non-interactive || handle_error "production build"
        else
            echo -e "${YELLOW}Production build cancelled${NC}"
            exit 0
        fi
        ;;
    *)
        handle_error "invalid build type. Use: development, preview, or production"
        ;;
esac

# Step 7: Success
echo -e "${GREEN}✅ Build completed successfully!${NC}"
echo -e "${BLUE}📱 Check your builds at: https://expo.dev/accounts/$(eas whoami)/projects${NC}"

# Optional: Open build page
if command -v open &> /dev/null; then
    read -p "Open build page in browser? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open "https://expo.dev/accounts/$(eas whoami)/projects"
    fi
fi