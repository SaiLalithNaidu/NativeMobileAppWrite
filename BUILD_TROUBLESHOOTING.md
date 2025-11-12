# Build Troubleshooting Guide
## Ramesh Aqua Mobile App - EAS Build Issues & Solutions

**Last Updated:** November 12, 2025  
**Project:** ramesh-aqua-app  
**EAS Account:** sailalithkona1  
**Platform:** Android (React Native + Expo)

---

## Table of Contents
1. [Common Build Failures](#common-build-failures)
2. [npm ci Sync Issues](#npm-ci-sync-issues)
3. [Package Name Conflicts](#package-name-conflicts)
4. [Build Queue & Timeouts](#build-queue--timeouts)
5. [Dependency Version Mismatches](#dependency-version-mismatches)
6. [Quick Reference Commands](#quick-reference-commands)
7. [Preventive Maintenance](#preventive-maintenance)

---

## Common Build Failures

### Issue Summary
Between multiple build attempts, the project experienced:
- **10+ failed builds** due to npm ci lockfile sync errors
- **45+ minute queue times** on production profile (free tier)
- **Package installation failures** from stale cached artifacts
- **App install conflicts** from mismatched package names

---

## npm ci Sync Issues

### Problem
```
npm error code EUSAGE
npm error `npm ci` can only install packages when your package.json and package-lock.json 
or npm-shrinkwrap.json are in sync.
npm error Missing: @react-native-async-storage/async-storage@1.24.0 from lock file
```

### Root Cause
- npm ci is **extremely strict** about lockfile/package.json sync
- EAS caches project archives; stale lockfiles persist across builds
- Upgrading dependencies (e.g., AsyncStorage 1.24.0 → 2.2.0) without regenerating lockfile properly
- Multiple lock files (yarn.lock + package-lock.json) confuse EAS package manager detection

### Solution: Switch to Yarn

#### Why Yarn?
- Yarn is **more forgiving** than npm ci for lockfile inconsistencies
- EAS detects yarn.lock and uses `yarn install` instead of `npm ci`
- Avoids strict byte-for-byte sync requirements

#### Steps to Switch:
```powershell
# 1. Install Yarn globally
npm install -g yarn

# 2. Remove npm lockfile
del package-lock.json

# 3. Generate yarn.lock
yarn install --ignore-scripts

# 4. Commit changes
git add yarn.lock
git rm -f package-lock.json
git commit -m "Switch to Yarn to fix npm ci sync issues"
git push

# 5. Build with cache cleared
eas build --platform android --profile preview --clear-cache
```

### Alternative: Fix npm Strictly (Not Recommended)
If you must stay on npm:

```powershell
# 1. Clean everything
rmdir /s /q node_modules
del package-lock.json

# 2. Regenerate lock deterministically
npm install --package-lock-only
npm install

# 3. Verify sync locally
npm ci  # Should succeed without errors

# 4. Commit and clear cache
git add package-lock.json
git commit -m "Regenerate lockfile for npm ci"
git push
eas build --platform android --profile preview --clear-cache
```

**Important:** Always use `--clear-cache` flag when fixing dependency issues to avoid stale artifacts.

---

## Package Name Conflicts

### Problem
```
"Package conflicts with an existing package by the same name"
```

### Root Cause
- Android package name in `app.json` matches an already-installed app
- Changing project slug doesn't auto-update the package identifier
- EAS generates new keystore for each unique package name

### Solution

#### 1. Update Package Name in app.json
```json
{
  "expo": {
    "android": {
      "package": "com.sailalith.rameshaqua"  // Must be globally unique
    }
  }
}
```

**Naming Convention:**
- Format: `com.<owner>.<projectname>`
- Must be unique on the device (no spaces, lowercase)
- Example: `com.sailalith.rameshaqua`

#### 2. Generate New Keystore
After changing package name, keystore must be regenerated:

```powershell
# Run interactive build (not --non-interactive)
eas build --platform android --profile preview

# When prompted:
√ Generate a new Android Keystore? ... yes
```

#### 3. Commit Changes
```powershell
git add app.json
git commit -m "Update Android package name to com.sailalith.rameshaqua"
git push
```

#### 4. Uninstall Old App (If Needed)
Before installing new APK with changed package name:
```bash
# On device or emulator
adb uninstall com.anonymous.NativeMobile  # Old package
```

---

## Build Queue & Timeouts

### Problem
- Build stuck in queue for 45+ minutes
- No worker allocated (free tier)
- Build eventually times out or auto-cancels

### Root Cause
- **Free/Hobby EAS plan** has low priority during peak hours
- **Production profile** queues slower than preview/development
- **Store distribution** adds signing overhead

### Solution

#### 1. Use Preview Profile (Faster)
```json
// eas.json
{
  "build": {
    "preview": {
      "distribution": "internal",  // Faster than "store"
      "channel": "preview"
    }
  }
}
```

Build command:
```powershell
eas build --platform android --profile preview
```

Preview builds typically complete in **15-25 minutes** vs production's 45+ minutes.

#### 2. Cancel Stuck Builds
```powershell
# List recent builds
eas build:list --limit 5

# Cancel stuck build (if ID found)
eas build:cancel <BUILD_ID>
```

#### 3. Upgrade EAS Plan (Optional)
- **Production Plan ($29/mo)**: Priority queue, faster workers
- **Enterprise Plan**: Dedicated resources

#### 4. Check Build Status
Monitor builds:
```powershell
eas build:list --limit 3
eas build:view <BUILD_ID>
```

Build logs URL format:
```
https://expo.dev/accounts/sailalithkona1/projects/ramesh-aqua-app/builds/<BUILD_ID>
```

---

## Dependency Version Mismatches

### Problem
```
16/17 checks passed. 1 checks failed.
✖ Check that packages match versions required by installed Expo SDK
Major version mismatches: @react-native-async-storage/async-storage
```

### Root Cause
- Package versions not aligned with Expo SDK version
- Manual `npm install` of incompatible versions

### Solution

#### 1. Check Expo SDK Compatibility
```powershell
npx expo-doctor
```

#### 2. Fix with Expo Install
Always use `expo install` for Expo-managed packages:
```powershell
npx expo install @react-native-async-storage/async-storage
```

This ensures the correct version for your SDK.

#### 3. Verify After Fix
```powershell
npx expo-doctor
# Should show: 17/17 checks passed. No issues detected!
```

#### 4. Update Lockfile
After fixing versions:
```powershell
# If using Yarn
yarn install

# If using npm
npm install

# Commit
git add package.json yarn.lock  # or package-lock.json
git commit -m "Fix dependency versions for Expo SDK 54"
git push
```

---

## Quick Reference Commands

### Health Checks
```powershell
# Check project health
npx expo-doctor

# Verify EAS login
eas whoami

# Check project info
eas project:info

# List recent builds
eas build:list --limit 5
```

### Build Commands
```powershell
# Standard preview build
eas build --platform android --profile preview

# Build with cleared cache (after dependency fixes)
eas build --platform android --profile preview --clear-cache

# Non-interactive (for CI/CD or scripts)
eas build --platform android --profile preview --non-interactive
```

### Troubleshooting
```powershell
# View build logs
eas build:view <BUILD_ID>

# Check build status
eas build:list --limit 1

# Cancel stuck build
eas build:cancel <BUILD_ID>

# Clear local node_modules
rmdir /s /q node_modules
npm install  # or yarn install
```

### Lock File Management
```powershell
# Switch to Yarn (recommended)
del package-lock.json
yarn install
git add yarn.lock
git rm -f package-lock.json
git commit -m "Switch to Yarn"

# Regenerate npm lock (if staying on npm)
del package-lock.json
npm install --package-lock-only
npm install
git add package-lock.json
git commit -m "Regenerate npm lockfile"
```

---

## Preventive Maintenance

### Before Every Build

#### 1. Run Local Health Check
```powershell
npx expo-doctor
```
Must show: `17/17 checks passed`

#### 2. Verify Lock File
```powershell
# If using Yarn
yarn install

# If using npm
npm ci  # Should complete without errors
```

#### 3. Check Git Status
```powershell
git status
# Ensure package.json, lock file, and app.json are committed
```

#### 4. Commit Before Building
Never build with uncommitted changes to:
- `package.json`
- `yarn.lock` or `package-lock.json`
- `app.json`

### After Dependency Updates

Always follow this sequence:

1. **Update package.json** (manually or via `expo install`)
2. **Regenerate lock file** (`yarn install` or `npm install`)
3. **Run `npx expo-doctor`** to verify compatibility
4. **Commit changes** to Git
5. **Push to remote**
6. **Build with `--clear-cache`** flag

### Monthly Maintenance

```powershell
# Update Expo SDK and dependencies
npx expo install --fix

# Check for outdated packages
yarn outdated  # or npm outdated

# Update non-Expo dependencies carefully
yarn upgrade-interactive --latest
```

---

## Common Error Messages & Quick Fixes

| Error | Quick Fix |
|-------|-----------|
| `npm ci ... not in sync` | Switch to Yarn (see [npm ci section](#npm-ci-sync-issues)) |
| `Package conflicts` | Update `android.package` in app.json, rebuild |
| `Build stuck in queue 45+ min` | Cancel build, use preview profile instead |
| `expo-doctor: 16/17 checks` | Run `npx expo install <package>` for failing package |
| `Generating keystore not supported in --non-interactive` | Run interactive build: `eas build --platform android --profile preview` |
| `Multiple lock files detected` | Delete unwanted lock (keep yarn.lock, remove package-lock.json) |

---

## Project Configuration Reference

### Current Setup (Working)
```json
// app.json
{
  "expo": {
    "name": "Ramesh Aqua",
    "slug": "ramesh-aqua-app",
    "version": "1.0.1",
    "android": {
      "package": "com.sailalith.rameshaqua"
    }
  }
}
```

```json
// eas.json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "channel": "preview"
    },
    "production": {
      "autoIncrement": true,
      "channel": "production",
      "android": {
        "buildType": "apk"
      }
    }
  }
}
```

### Dependencies
- **Expo SDK:** 54.0.23
- **React Native:** 0.81.5
- **React:** 19.1.0
- **AsyncStorage:** 2.2.0 (critical: must match Expo SDK)

### Package Manager
- **Using:** Yarn 1.22.22
- **Why:** More forgiving than npm ci; avoids strict lockfile sync issues

---

## Success Checklist

Before declaring "build fixed," verify:

- [ ] `npx expo-doctor` shows 17/17 checks passed
- [ ] Only one lock file exists (yarn.lock)
- [ ] `package.json` and `yarn.lock` committed and pushed
- [ ] Build completes successfully (not stuck in queue)
- [ ] APK installs on device without "package conflict" error
- [ ] App launches and core features work

---

## Contact & Resources

### Project Info
- **EAS Project:** `@sailalithkona1/ramesh-aqua-app`
- **Project ID:** `ac16db0b-3b84-4a69-9b2c-599e05b7091e`
- **Repository:** `NativeMobileAppWrite` (branch: NativeMobile1)

### Useful Links
- [Expo Doctor Docs](https://docs.expo.dev/more/expo-cli/#expo-doctor)
- [EAS Build Docs](https://docs.expo.dev/build/introduction/)
- [Dependency Validation](https://expo.fyi/dependency-validation)
- [Build Logs](https://expo.dev/accounts/sailalithkona1/projects/ramesh-aqua-app/builds)

### Commands to Bookmark
```powershell
# Quick health check
npx expo-doctor

# Quick build (after fixes)
eas build --platform android --profile preview --clear-cache

# View latest build
eas build:list --limit 1
```

---

## Troubleshooting Flowchart

```
Build Failed?
│
├─ "npm ci not in sync" error?
│  └─ YES → Switch to Yarn (del package-lock.json; yarn install; commit; build --clear-cache)
│
├─ "Package conflicts" error?
│  └─ YES → Update android.package in app.json; rebuild interactively to generate keystore
│
├─ Stuck in queue 45+ min?
│  └─ YES → Cancel build; use preview profile instead of production
│
├─ "expo-doctor" failing?
│  └─ YES → Run: npx expo install <failing-package>; verify with expo-doctor; commit; build
│
└─ Other error?
   └─ Check build logs: eas build:view <BUILD_ID>
      Read error message carefully
      Search this doc for keywords
```

---

**Remember:** When in doubt, run `npx expo-doctor` first, then build with `--clear-cache` after any dependency/config changes.
