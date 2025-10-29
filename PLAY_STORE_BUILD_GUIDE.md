# Android App Bundle (.aab) Build Guide for Google Play Store

## Overview
This guide walks you through creating an Android App Bundle (.aab) file for uploading Bhakti Breath Pacer to the Google Play Store.

## Prerequisites

### 1. Install EAS CLI (Expo Application Services)
```bash
npm install -g @expo/eas-cli
```

### 2. Login to Expo Account
```bash
eas login
```

### 3. Configure EAS Build
Initialize EAS configuration in your project:
```bash
eas build:configure
```

This creates an `eas.json` file in your project root.

## EAS Configuration

### Update `eas.json` for Play Store Build

Create or update your `eas.json` file:

```json
{
  "cli": {
    "version": ">= 3.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "android": {
        "buildType": "app-bundle"
      },
      "ios": {
        "buildType": "release"
      }
    }
  },
  "submit": {
    "production": {
      "android": {
        "serviceAccountKeyPath": "./google-service-account.json",
        "track": "internal"
      }
    }
  }
}
```

### Key Configuration Points:

1. **`"buildType": "app-bundle"`** - This ensures you get an .aab file instead of .apk
2. **Production profile** - Used for Play Store builds
3. **Service account key** - For automated submission (optional)

## App Configuration Updates

### 1. Update `app.json` for Production

Ensure your `app.json` has proper Play Store configuration:

```json
{
  "expo": {
    "name": "Bhakti Breath Pacer",
    "slug": "bhakti-breath-pacer",
    "version": "1.0.0",
    "orientation": "portrait",
    "icon": "./assets/images/icon.png",
    "userInterfaceStyle": "automatic",
    "newArchEnabled": true,
    "splash": {
      "image": "./assets/images/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#ffffff"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/adaptive-icon.png",
        "backgroundColor": "#ffffff"
      },
      "package": "com.bhaktiwellness.breathpacer",
      "versionCode": 1,
      "permissions": [
        "WAKE_LOCK",
        "VIBRATE"
      ],
      "splash": {
        "image": "./assets/images/splash-icon.png",
        "resizeMode": "contain",
        "backgroundColor": "#ffffff"
      }
    },
    "plugins": [
      "expo-router",
      [
        "expo-splash-screen",
        {
          "image": "./assets/images/splash-icon.png",
          "imageWidth": 200,
          "resizeMode": "contain",
          "backgroundColor": "#ffffff"
        }
      ],
      "expo-font",
      "expo-audio"
    ],
    "extra": {
      "eas": {
        "projectId": "44f50d2d-8235-4e4b-99c0-962bff20d351"
      }
    }
  }
}
```

### Important Android Settings:

- **`package`**: Must be unique (reverse domain format)
- **`versionCode`**: Integer that increments with each release
- **`version`**: User-facing version string
- **`permissions`**: Only include necessary permissions
- **`adaptiveIcon`**: Required for modern Android versions

## Building the App Bundle

### 1. Build for Production
```bash
eas build --platform android --profile production
```

### 2. Monitor Build Progress
- The build will run on Expo's cloud servers
- You'll get a URL to monitor progress
- Build typically takes 10-20 minutes

### 3. Download the .aab File
Once complete, you'll get:
- Download link for the .aab file
- Build artifacts and logs
- The .aab file will be named something like: `bhakti-breath-pacer-1.0.0.aab`

## Alternative: Local Build (Advanced)

If you prefer to build locally:

### 1. Install Android Studio
- Download from https://developer.android.com/studio
- Install Android SDK and build tools

### 2. Set up Environment Variables
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

### 3. Generate Android Project
```bash
npx expo run:android --variant release
```

### 4. Build Bundle with Gradle
```bash
cd android
./gradlew bundleRelease
```

The .aab file will be at: `android/app/build/outputs/bundle/release/app-release.aab`

## Code Signing

### For EAS Build (Recommended)
EAS handles code signing automatically:
- First build: Expo generates a keystore
- Subsequent builds: Uses the same keystore for consistency

### For Local Build
You'll need to create and configure a keystore manually.

## Upload Requirements for Play Store

### 1. File Requirements
- **File format**: .aab (Android App Bundle)
- **Maximum size**: 150MB for the base APK
- **Minimum API level**: 21 (Android 5.0) - configured in your Expo config

### 2. Store Listing Requirements
- **App name**: "Bhakti Breath Pacer"
- **Package name**: `com.bhaktiwellness.breathpacer`
- **Version code**: 1 (increment for updates)
- **Version name**: "1.0.0"

### 3. Content Requirements
- **Privacy policy URL**: (use the one you created)
- **App category**: Health & Fitness
- **Content rating**: Everyone (PEGI 3)
- **Target audience**: All ages

## Play Store Upload Process

### 1. Create Play Console Account
- Go to https://play.google.com/console
- Pay one-time $25 registration fee
- Complete developer profile

### 2. Create New App
- Click "Create app"
- Choose "App" (not game)
- Select "Free" (unless you plan to charge)
- Add your app details

### 3. Upload App Bundle
- Go to "Release" → "Production"
- Click "Create new release"
- Upload your .aab file
- Add release notes

### 4. Complete Store Listing
- App details (name, description, screenshots)
- Graphics (icon, feature graphic, screenshots)
- Categorization
- Contact details
- Privacy policy URL

### 5. Content Rating
- Complete the content rating questionnaire
- Your app should qualify for "Everyone" rating

### 6. Data Safety
- Use the guide in `DATA_SAFETY_GUIDE.md`
- Answer "NO" to data collection questions

### 7. App Content
- Add privacy policy URL
- Declare no ads (unless you have them)
- Target audience: All ages

## Testing Before Release

### 1. Internal Testing
```bash
eas submit --platform android --track internal
```

### 2. Closed Testing
- Upload to "Testing" → "Closed testing"
- Add test users via email
- Get feedback before public release

### 3. Pre-launch Report
- Google automatically tests your app
- Check for crashes or issues
- Review performance metrics

## Common Issues and Solutions

### Build Fails
```bash
# Clear cache and retry
eas build --platform android --profile production --clear-cache
```

### Version Conflicts
- Ensure `versionCode` increments with each build
- Check that `version` follows semantic versioning

### Permission Issues
- Only include necessary permissions in `app.json`
- Test on different Android versions

### Asset Issues
- Ensure all images are properly sized
- Test adaptive icon on different launchers

## Release Checklist

### Pre-Build
- [ ] Update version numbers in `app.json`
- [ ] Test app thoroughly on device
- [ ] Verify privacy policy is hosted and accessible
- [ ] Update privacy policy URL in app code
- [ ] Check all permissions are necessary

### Build & Upload
- [ ] Run successful production build
- [ ] Download and verify .aab file
- [ ] Upload to Play Console
- [ ] Complete all store listing sections
- [ ] Fill out Data Safety form (use guide)
- [ ] Set up content rating

### Pre-Release
- [ ] Review pre-launch report
- [ ] Test with internal users
- [ ] Check app bundle analyzer results
- [ ] Verify all metadata is correct

### Release
- [ ] Submit for review
- [ ] Monitor review status
- [ ] Respond to any Google feedback
- [ ] Plan release announcement

## Post-Release Monitoring

### Analytics (Optional)
If you add analytics later, update:
- Privacy policy
- Data Safety form
- App permissions

### Updates
For future updates:
1. Increment `versionCode` in `app.json`
2. Update `version` if needed
3. Build new .aab
4. Upload to Play Console
5. Update release notes

## Cost Breakdown

- **Google Play Developer Account**: $25 (one-time)
- **EAS Build**: Free tier includes builds, paid plans for more
- **Hosting**: Free options available for privacy policy

## Support Resources

- **Expo Documentation**: https://docs.expo.dev/build/setup/
- **Google Play Console Help**: https://support.google.com/googleplay/android-developer/
- **EAS Build Docs**: https://docs.expo.dev/build/introduction/

This guide should get your Bhakti Breath Pacer app successfully built and submitted to the Google Play Store!