# Build Troubleshooting Guide
## NativeMobile App (Expo Router + React Native)

This document consolidates all build failures and solutions encountered during development. Use this as a reference when facing similar issues in the future.

---

## 1. AsyncStorage Version Mismatch Error

### Error Message
```
npm error code EUSAGE
npm error `npm ci` can only install packages when your package.json and package-lock.json or npm-shrinkwrap.json are in sync.
npm error Missing: @react-native-async-storage/async-storage@1.24.0 from lock file
```

### Root Cause
- Expo SDK 54 requires `@react-native-async-storage/async-storage@2.2.0`
- Project was initially using `1.24.0`, creating a version mismatch
- npm ci (clean install) enforces strict lockfile sync and fails when package.json and package-lock.json don't match

### Solution

**Quick Fix (Recommended):**
1. Upgrade AsyncStorage in package.json:
```powershell
npm install @react-native-async-storage/async-storage@2.2.0 --save-exact
```

2. Regenerate lockfile:
```powershell
del package-lock.json
npm install --package-lock-only
npm install
```

3. Commit and push:
```powershell
git add package-lock.json
git commit -m "Update AsyncStorage to 2.2.0 for Expo SDK 54"
git push
```

4. Clear EAS cache and rebuild:
```powershell
eas build --platform android --profile preview --clear-cache --non-interactive
```

**Alternative (Use Yarn):**
If npm ci continues to fail, switch to Yarn:
```powershell
del package-lock.json
yarn install
git add yarn.lock
git rm -f package-lock.json
git commit -m "Switch to Yarn to avoid npm ci mismatch"
git push
eas build --platform android --profile preview --clear-cache --non-interactive
```

### Prevention
- Always use `expo install <package>` for dependencies (Expo automatically finds compatible versions)
- Keep package.json and lockfiles in sync: `npm install` before `git commit`
- Use `npx expo-doctor` locally to catch version mismatches early

---

## 2. Multiple Lock Files Conflict

### Error Message
```
✖ Check for lock file
Multiple lock files detected (yarn.lock, package-lock.json). This may result in unexpected behavior in CI environments, such as EAS Build, which infer the package manager from the lock file.
```

### Root Cause
- Both yarn.lock and package-lock.json exist in the repo
- EAS cannot determine which package manager to use, causing unpredictable behavior
- npm ci may fail if yarn.lock is prioritized over package-lock.json

### Solution

**Choose One Package Manager:**

**Option A: Use npm (recommended for simplicity)**
```powershell
del yarn.lock
git rm -f yarn.lock
git commit -m "Remove yarn.lock; use npm only"
git push
```

**Option B: Use Yarn (recommended if npm ci has issues)**
```powershell
del package-lock.json
git rm -f package-lock.json
git commit -m "Remove package-lock.json; use Yarn"
git push
```

### Verification
```powershell
npx expo-doctor
# Should show 17/17 checks passed with no lock file warning
```

---

## 3. Build Queue Stuck for 45+ Minutes

### Symptoms
- Build status shows "in queue" but never progresses to build phase
- Waiting hours with no update
- No errors, just idle state

### Root Cause
- EAS free-tier builds share workers; high demand = long queue times
- Production profile builds (store distribution) have lower priority
- Free accounts have no queue priority

### Solution

**Option 1: Use Preview Profile (Faster)**
```powershell
eas build --platform android --profile preview --non-interactive
```
Preview builds typically take 15-25 minutes total (much faster than production).

**Option 2: Cancel and Restart**
```powershell
# Note: EAS doesn't support direct cancellation via CLI for old builds
# Instead, use the web dashboard: https://expo.dev/accounts/sailalithkona1/projects/ramesh-aqua-app/builds
# Then restart:
eas build --platform android --profile preview --clear-cache --non-interactive
```

**Option 3: Use Existing APK**
If an earlier build succeeded, use that APK instead of waiting:
```
Download APK from: https://expo.dev/accounts/sailalithkona1/projects/ramesh-aqua-app
```

### Prevention
- Use preview profile for development testing
- Use production profile only when submitting to stores
- Check queue status before starting build: `eas build:list --limit 1`

---

## 4. Android Package Name Install Conflict

### Error Message
```
"The app conflicts with an existing package of the same name"
```

### Root Cause
- Old APK with package name `com.anonymous.NativeMobile` already installed on device
- New build uses the same package name, causing conflict
- Android requires unique package names per app installation

### Solution

**Update Package Name in app.json:**
```json
"android": {
  "package": "com.sailalith.rameshaqua"
}
```

**Full Steps:**
1. Edit `app.json` and change the package name to something unique
2. Commit and push:
```powershell
git add app.json
git commit -m "Change Android package to com.sailalith.rameshaqua"
git push
```

3. Rebuild with new keystore (required for new package):
```powershell
eas build --platform android --profile preview
# Accept prompt: "Generate a new Android Keystore? ... yes"
```

### Prevention
- Use descriptive, unique package names: `com.companyname.appname`
- Avoid generic names like `com.anonymous.NativeMobile`
- Check existing installations on device before installing new build

---

## 5. Keystore Generation in Non-Interactive Mode

### Error Message
```
Generating a new Keystore is not supported in --non-interactive mode
Error: build command failed.
```

### Root Cause
- When package name changes, Android keystore must be regenerated
- `--non-interactive` flag prevents manual approval of keystore generation
- EAS requires confirmation for security reasons

### Solution

**Use Interactive Mode for First Build with New Package:**
```powershell
eas build --platform android --profile preview
# Accept prompt: "Generate a new Android Keystore? ... yes"
```

**After First Build, Use Non-Interactive for Subsequent Builds:**
```powershell
eas build --platform android --profile preview --non-interactive
```

### Prevention
- Use interactive mode when changing package names or credentials
- Use non-interactive only after initial setup is complete
- Save the build ID for reference

---

## 6. Expo Doctor Errors

### Error 1: "expo module is not installed"
```
Cannot determine the project's Expo SDK version because the module `expo` is not installed.
```

**Solution:**
```powershell
npm install
npx expo-doctor
```

### Error 2: "AsyncStorage mismatch in doctor check"
```
Check that packages match versions required by installed Expo SDK
Expected: @react-native-async-storage/async-storage 2.2.0, Found: 1.24.0
```

**Solution:**
Follow [Section 1: AsyncStorage Version Mismatch](#1-asyncstorage-version-mismatch-error)

### Verification
```powershell
npx expo-doctor
# Should output: 17/17 checks passed. No issues detected!
```

---

## Quick Reference: Common Commands

### Check Status
```powershell
npx expo-doctor                           # Validate local environment
eas build:list --limit 1                 # Check latest build
eas build:view <BUILD_ID>                # View specific build details
eas whoami                               # Check logged-in account
```

### Build Commands
```powershell
eas build --platform android --profile preview                    # Interactive build
eas build --platform android --profile preview --non-interactive  # Non-interactive
eas build --platform android --profile preview --clear-cache      # Clear build cache
```

### Dependency Management
```powershell
npx expo install <package>               # Install Expo-compatible package
npm install --package-lock-only          # Regenerate lock without node_modules
yarn install                             # Generate yarn.lock
```

### Git Workflow
```powershell
git add .
git commit -m "Descriptive message"
git push
```

---

## Project Configuration Reference

### Current Project Setup
- **Project Name:** Ramesh Aqua
- **Slug:** ramesh-aqua-app
- **Package Name:** com.sailalith.rameshaqua
- **EAS Project ID:** ac16db0b-3b84-4a69-9b2c-599e05b7091e
- **Package Manager:** Yarn (yarn.lock) - DO NOT use npm alongside
- **Expo SDK:** 54.0.0
- **Account:** sailalithkona1

### Build Profiles
- **preview:** Internal distribution for testing (fast, ~15-25 min)
- **production:** Store distribution (slower, requires queue priority)

---

## Troubleshooting Workflow

When facing a build issue:

1. **Run Expo Doctor**
   ```powershell
   npx expo-doctor
   ```
   - Check all 17 checks pass
   - Resolve any warnings

2. **Check Recent Commits**
   ```powershell
   git log -3 --oneline
   ```
   - Ensure latest changes are in place

3. **Verify Dependencies**
   ```powershell
   npx expo-doctor
   ```
   - AsyncStorage should be 2.2.0
   - Only one lock file (yarn.lock OR package-lock.json)

4. **Start Clean Build**
   ```powershell
   eas build --platform android --profile preview --clear-cache
   ```
   - Use `--clear-cache` to prevent stale artifacts

5. **Monitor Build**
   ```powershell
   eas build:list --limit 1
   ```
   - Check status until completion or failure

6. **Review Logs**
   - Click the logs URL to view full build output
   - Search for error keywords from this guide

---

## Contact & Resources

- **Expo Docs:** https://docs.expo.dev/
- **EAS Build:** https://docs.expo.dev/build/introduction/
- **Build Status:** https://expo.dev/accounts/sailalithkona1/projects/ramesh-aqua-app/builds

---

**Last Updated:** November 12, 2025
**Author:** Build Troubleshooting Documentation
