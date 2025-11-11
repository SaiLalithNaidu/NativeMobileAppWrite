# 🚀 NativeMobile Build & Deployment Guide

## 📋 **Quick Start**

### **Recommended Approach: EAS Build**
```bash
# 1. Install EAS CLI (if not already installed)
npm install -g @expo/eas-cli

# 2. Login to Expo
eas login

# 3. Build for testing
npm run build:preview

# 4. Build for production
npm run build:prod
```

## 🏗️ **Build Options (Ranked by Ease)**

### **1. EAS Build (⭐ RECOMMENDED)**
**Why it's best for your project:**
- ✅ Zero local configuration
- ✅ Automatic certificate management
- ✅ Built-in CI/CD support
- ✅ Works with Firebase out of the box
- ✅ Handles AsyncStorage automatically

```bash
# Development build (for testing with dev client)
npm run build:dev

# Preview build (for internal testing)
npm run build:preview

# Production build (for app stores)
npm run build:prod
```

### **2. Platform-Specific Builds**
```bash
# Android only
npm run build:android

# iOS only  
npm run build:ios
```

### **3. Manual EAS Commands**
```bash
# Full control over build process
eas build --profile preview --platform all
eas build --profile production --platform android --non-interactive
```

## 🤖 **CI/CD Setup**

### **GitHub Actions (Automated)**
We've configured GitHub Actions for you:

**Triggers:**
- ✅ **Push to main**: Triggers production build
- ✅ **Pull Request**: Creates preview build
- ✅ **Manual trigger**: Via GitHub UI

**Setup Steps:**
1. Add `EXPO_TOKEN` to GitHub Secrets:
   ```bash
   # Get your token
   eas token:create
   
   # Add to GitHub: Settings → Secrets → Actions → New secret
   # Name: EXPO_TOKEN
   # Value: [your-token]
   ```

2. Push code to trigger first build:
   ```bash
   git add .
   git commit -m "feat: setup automated builds"
   git push origin main
   ```

### **Alternative CI/CD Options**

#### **GitLab CI**
```yaml
# .gitlab-ci.yml
build:
  image: node:18
  script:
    - npm ci
    - npx eas-cli@latest build --platform all --non-interactive
  only:
    - main
```

#### **Bitbucket Pipelines**
```yaml
# bitbucket-pipelines.yml
pipelines:
  default:
    - step:
        name: Build App
        image: node:18
        script:
          - npm ci
          - npx eas-cli@latest build --platform all --non-interactive
```

## 🚨 **Common Build Issues & Solutions**

### **1. Firebase Configuration**
```javascript
// lib/firebase.js - Ensure this exists and is properly configured
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // Your config here
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
```

### **2. AsyncStorage Import**
```javascript
// Correct import
import AsyncStorage from '@react-native-async-storage/async-storage';

// NOT: import { AsyncStorage } from 'react-native';
```

### **3. Environment Variables**
```javascript
// app.config.js
export default {
  expo: {
    name: "NativeMobile",
    slug: "nativemobile",
    // ... other config
  },
};
```

### **4. Build Profile Issues**
If build fails, check `eas.json`:
```json
{
  "build": {
    "preview": {
      "distribution": "internal",
      "channel": "preview"
    }
  }
}
```

## 📱 **Build Profiles Explained**

### **Development**
- 🎯 **Purpose**: Testing with Expo Dev Client
- 📦 **Size**: Larger (includes dev tools)
- ⚡ **Speed**: Fast iteration
- 🔧 **Use**: Local development

### **Preview**
- 🎯 **Purpose**: Internal testing & QA
- 📦 **Size**: Optimized
- ⚡ **Speed**: Medium
- 🔧 **Use**: Beta testing, stakeholder reviews

### **Production**
- 🎯 **Purpose**: App Store submission
- 📦 **Size**: Fully optimized
- ⚡ **Speed**: Slower (full optimization)
- 🔧 **Use**: Final release

## 🔄 **Update Strategy**

### **OTA Updates (Fastest)**
```bash
# Push updates without rebuilding
eas update --branch production --message "Bug fixes"

# Target specific build
eas update --branch preview --message "New features"
```

### **New Build (When Required)**
Rebuild when you:
- ✅ Add new native modules
- ✅ Change app.json/app.config.js
- ✅ Update Expo SDK
- ✅ Modify native code

## 📊 **Build Monitoring**

### **Build Status**
```bash
# Check build status
eas build:list

# View specific build
eas build:view [BUILD_ID]

# Cancel running build
eas build:cancel [BUILD_ID]
```

### **Build Artifacts**
- 📱 **Android**: `.apk` or `.aab` files
- 🍎 **iOS**: `.ipa` files
- 📥 **Download**: Available from Expo dashboard

## 💡 **Best Practices**

### **Before Building**
1. ✅ Test locally: `npm start`
2. ✅ Run linting: `npm run lint`
3. ✅ Check dependencies: `npm audit`
4. ✅ Verify Firebase connection
5. ✅ Test on physical device

### **Version Management**
```json
// app.json
{
  "expo": {
    "version": "1.0.0",
    "android": {
      "versionCode": 1
    },
    "ios": {
      "buildNumber": "1"
    }
  }
}
```

### **Environment-Specific Builds**
```bash
# Use different Firebase projects per environment
NODE_ENV=development eas build --profile development
NODE_ENV=production eas build --profile production
```

## 🎯 **Recommended Workflow**

### **For Your Project:**

1. **Daily Development**
   ```bash
   npm start  # Local testing
   ```

2. **Feature Testing**
   ```bash
   npm run build:preview  # Internal testing
   ```

3. **Release Preparation**
   ```bash
   npm run build:prod  # Production build
   ```

4. **Hotfixes**
   ```bash
   eas update --branch production  # OTA update
   ```

## 🚀 **Next Steps**

1. **Set up EAS CLI**: `npm install -g @expo/eas-cli`
2. **Login**: `eas login`
3. **First build**: `npm run build:preview`
4. **Set up CI/CD**: Add `EXPO_TOKEN` to GitHub Secrets
5. **Monitor**: Check builds at [expo.dev](https://expo.dev)

This approach will give you the most reliable, maintainable build process with minimal configuration overhead!