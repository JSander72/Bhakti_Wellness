import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { Link } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

// Reuse the same color scheme as the BreathPacer page
const COLORS = {
  bg: '#0D3B34',
  bgDark: '#0A2B27',
  cream: '#F1DEB4',
  creamText: '#F7E9C9',
  red: '#B7272C',
};

// Static content pulled from the repository markdown files
const PRIVACY_MD = `# Privacy Policy

**Effective Date:** October 28, 2025  
**Last Updated:** October 28, 2025

## Developer Information

**App:** Bhakti Breath Pacer  
**Developer:** Bhakti Wellness / James Sanders  
**Contact Email:** [Your Email Address]  
**Contact Address:** [Your Business Address]  
**Website:** [Your Website URL]

For privacy-related inquiries, please contact us at the email address above.

## Overview

Bhakti Breath Pacer is a breathing meditation and mindfulness app designed to help users practice controlled breathing exercises. This Privacy Policy explains how our app accesses, collects, uses, and shares user data in compliance with applicable privacy laws and Google Play Store requirements.

## Data Collection and Usage

### Information We Do NOT Collect

Bhakti Breath Pacer is designed with privacy in mind. We do **NOT** collect, store, or transmit:

- Personal identifying information (names, email addresses, phone numbers)
- User accounts or registration data
- Location data or GPS coordinates
- Device identifiers or advertising IDs
- Usage analytics or tracking data
- Health or biometric data
- Contact lists or social media information
- Photos, videos, or camera access
- Microphone recordings
- Payment or financial information

### Information We Do Collect

**Local Device Settings Only:**
- Breathing session preferences (breaths per minute, session duration, breathing pattern timing)
- Sound preference selections (background sounds like ocean, rain, forest)
- App theme preferences (light/dark mode)

**How This Data is Used:**
- All user preferences are stored locally on your device only
- Data is used solely to customize your breathing sessions
- No data is transmitted to external servers or third parties
- Settings are reset to defaults when you return from a completed session

### Technical Data

**Device Capabilities We Access:**
- **Audio System:** To play optional background sounds during breathing sessions
- **Haptic Feedback:** To provide gentle vibrations for breathing rhythm (iOS only)
- **Screen Wake Lock:** To keep the screen active during breathing sessions
- **Device Orientation:** To provide responsive design across screen sizes

**Android Permissions:**
- \`WAKE_LOCK\`: Prevents screen from sleeping during sessions
- \`VIBRATE\`: Provides haptic feedback for breathing rhythm

**iOS Capabilities:**
- Background audio playback for breathing session sounds
- Haptic feedback through standard iOS APIs

## Data Storage and Security

### Local Storage Only
- All user preferences are stored locally on your device using standard app storage
- No data is synchronized to cloud services
- No user accounts or external databases are used
- Data remains on your device and is not accessible to us or third parties

### Data Security Measures
- Local storage uses standard iOS/Android security frameworks
- No network transmission of personal data
- App does not require internet connectivity for core functionality
- No external analytics or tracking SDKs are integrated

## Data Sharing and Third Parties

### No Data Sharing
We do **NOT** share, sell, rent, or disclose any user data to third parties because:
- We do not collect personal or identifying information
- All app data remains locally on your device
- No third-party services are integrated that access user data

### Third-Party Services
The app uses these technical frameworks that do not collect personal data:
- **Expo Framework:** For cross-platform app development (no data collection)
- **React Native:** For mobile app functionality (no data collection)
- **Expo Audio:** For background sound playback (no data transmission)

## Data Retention and Deletion

### Automatic Data Management
- Session preferences are automatically reset to defaults after each completed breathing session
- App settings persist locally until you manually reset them or uninstall the app
- No historical session data or usage patterns are stored

### User Control
- **Reset to Defaults:** Use the "Reset to Defaults" button in the app to clear all preferences
- **Complete Removal:** Uninstalling the app removes all locally stored data
- **No Account Deletion Needed:** Since no accounts are created, no account deletion process is required

## Children's Privacy

Bhakti Breath Pacer is suitable for users of all ages and complies with COPPA (Children's Online Privacy Protection Act):
- No personal information is collected from users of any age
- No online communication features or social elements
- No advertising or in-app purchases
- Safe for children to use without privacy concerns

## International Users

This app is available worldwide and complies with international privacy regulations:
- **GDPR Compliance:** No personal data processing means GDPR obligations are not applicable
- **CCPA Compliance:** No personal information is collected or sold
- **Global Privacy:** Privacy-by-design approach protects all users equally

## Changes to This Privacy Policy

We may update this Privacy Policy to reflect:
- Changes in app functionality
- Updates to legal requirements
- Improvements to privacy practices

**Notification of Changes:**
- Updated privacy policies will be posted at the same location as this document
- Material changes will be highlighted in app update notes
- Continued use of the app constitutes acceptance of updated policies

## App Store Compliance

This privacy policy and our data practices comply with:
- Google Play Store Developer Policy
- Apple App Store Review Guidelines
- Platform-specific privacy requirements
- Data Safety form disclosures in app store listings

## Your Rights and Choices

Since we do not collect personal data, traditional data rights (access, correction, deletion) are not applicable. However, you maintain complete control over:
- All app settings and preferences stored on your device
- The ability to reset settings at any time
- Complete data removal through app uninstallation

## Contact Information

For questions about this Privacy Policy or our privacy practices:

**Email:** [Your Email Address]  
**Response Time:** We aim to respond within 48 hours

For technical support or app-related questions, please use the same contact information.

## Legal Compliance

This Privacy Policy is governed by applicable privacy laws and regulations. If you have concerns about our privacy practices that cannot be resolved through direct contact, you may have rights to file complaints with relevant privacy authorities in your jurisdiction.

---

**Document Label:** This document serves as the official Privacy Policy for Bhakti Breath Pacer.

**Effective Date:** This policy is effective as of October 28, 2025, and applies to all current and future versions of the app unless superseded by an updated policy.`;

const DATA_SAFETY_MD = `# Google Play Console Data Safety Form Guide

## Overview
This guide provides the exact answers you should select in the Google Play Console Data Safety form for Bhakti Breath Pacer, based on the app's actual data collection and usage practices.

## Data Safety Form Responses

### Section 1: Data Collection and Sharing

**Does your app collect or share any of the required user data types?**
- **Answer: NO**
- **Reason:** The app does not collect, store, or share any personal or sensitive user data. All preferences are stored locally on the device.

### Section 2: Data Types (If you had answered YES above)

Since we answered "NO" to data collection, you won't see these sections, but for reference:

#### Personal Information
- **Name:** Not collected
- **Email address:** Not collected  
- **User IDs:** Not collected
- **Address:** Not collected
- **Phone number:** Not collected
- **Race and ethnicity:** Not collected
- **Political or religious beliefs:** Not collected
- **Sexual orientation:** Not collected
- **Other personal info:** Not collected

#### Financial Information
- **User payment info:** Not collected
- **Purchase history:** Not collected
- **Credit score:** Not collected
- **Other financial info:** Not collected

#### Health and Fitness
- **Health info:** Not collected
- **Fitness info:** Not collected

**Important Note:** Even though this is a breathing/wellness app, we do NOT collect any health data. The app only provides breathing guidance without recording or storing any health metrics.

#### Messages
- **Emails:** Not collected
- **SMS or MMS:** Not collected
- **Other in-app messages:** Not collected

#### Photos and Videos
- **Photos:** Not collected
- **Videos:** Not collected

#### Audio Files
- **Voice or sound recordings:** Not collected
- **Music files:** Not collected
- **Other audio files:** Not collected

**Note:** While the app can play background sounds (ocean, rain, etc.), it does NOT record, collect, or access any audio files from the user's device.

#### Files and Documents
- **Files and documents:** Not collected

#### Calendar
- **Calendar events:** Not collected

#### Contacts
- **Contacts:** Not collected

#### App Activity
- **Page views and taps in app:** Not collected
- **In-app search history:** Not collected
- **Installed apps:** Not collected
- **Other user-generated content:** Not collected
- **Other app performance data:** Not collected

#### Web Browsing
- **Web browsing history:** Not collected

#### App Info and Performance
- **Crash logs:** Not collected
- **Diagnostics:** Not collected
- **Other app performance data:** Not collected

#### Device or Other IDs
- **Device or other IDs:** Not collected

### Section 3: Security Practices

**Is all of the user data collected by your app encrypted in transit?**
- **Answer: This question doesn't apply**
- **Reason:** No user data is transmitted from the device

**Do you provide a way for users to request that their data is deleted?**
- **Answer: This question doesn't apply** 
- **Reason:** No user data is collected that would require deletion

### Section 4: Data Usage and Handling

Since no data is collected, these sections will not appear in your form.

## Additional Compliance Information

### App Store Listing Requirements

**Privacy Policy URL:** 
- You must host your privacy policy at a publicly accessible, non-editable URL
- Example: \`https://yourdomain.com/privacy-policy\`
- Add this URL in the Google Play Console under "Store presence" → "App content" → "Privacy Policy"

### Target Audience and Content

**Age Rating:**
- The app is suitable for all ages (PEGI 3, ESRB E for Everyone)
- No age restrictions needed since no data is collected

**Content Rating Questionnaire:**
- Answer all questions based on the app containing no violent, sexual, or inappropriate content
- The app is a meditation/wellness tool suitable for all users

### Advertising and Monetization

**Ads:**
- **Current Status:** No ads present in the app
- **If adding ads later:** You would need to update the Data Safety form to reflect any data collection by ad networks

**In-App Purchases:**
- **Current Status:** No in-app purchases
- **If adding purchases later:** Update the form to reflect any payment data collection

## Implementation Checklist

### Before Submitting to Google Play:

1. **✅ Privacy Policy Created:** Located at \`/PRIVACY_POLICY.md\` in your project
2. **✅ In-App Link Added:** Privacy policy link added to app footer
3. **⚠️ Host Privacy Policy:** Upload your privacy policy to a public URL (required)
4. **⚠️ Update App Link:** Replace the placeholder URL in the app with your actual privacy policy URL
5. **⚠️ Complete Data Safety Form:** Use the responses provided in this guide
6. **⚠️ Add Policy URL to Console:** Add the privacy policy URL in Google Play Console

### Code Updates Needed:

1. **Update Privacy Policy Link in App:**
   
   In \`components/BreathPacer.tsx\`, replace:
   \`\`\`tsx
   const privacyUrl = "https://your-website.com/privacy-policy";
   \`\`\`
   
   With your actual URL:
   \`\`\`tsx
   const privacyUrl = "https://yourdomain.com/privacy-policy";
   \`\`\`

2. **Consider Using Expo WebBrowser:**
   
   For a better user experience, consider opening the privacy policy in a web browser:
   \`\`\`tsx
   import * as WebBrowser from 'expo-web-browser';
   
   // In the onPress handler:
   WebBrowser.openBrowserAsync(privacyUrl);
   \`\`\`

### Hosting Your Privacy Policy

You can host your privacy policy using:

1. **GitHub Pages (Free):**
   - Create a repository with your privacy policy as \`index.html\`
   - Enable GitHub Pages in repository settings
   - URL will be: \`https://yourusername.github.io/repository-name\`

2. **Your Website:**
   - Upload as a dedicated page: \`https://yourdomain.com/privacy-policy\`

3. **Google Sites or similar free hosting:**
   - Create a simple page with your privacy policy content

## Review Process Tips

### Google Play Review:

1. **Consistency:** Ensure your Data Safety form answers match your privacy policy content
2. **Completeness:** Answer all required questions accurately
3. **Updates:** If you add features that collect data, update both the policy and Data Safety form
4. **Testing:** Google may test your app to verify no unexpected data collection occurs

### Common Rejection Reasons to Avoid:

1. **Missing privacy policy URL** in the console
2. **Inconsistent answers** between Data Safety form and actual app behavior
3. **Privacy policy not accessible** at the provided URL
4. **Missing in-app disclosure** for apps with sensitive permissions

## Future Considerations

If you plan to add these features later, you'll need to update your privacy policy and Data Safety form:

- **User accounts or login**
- **Cloud sync of preferences** 
- **Analytics or crash reporting**
- **Advertising**
- **In-app purchases**
- **Social features**
- **Health data recording**

## Legal Disclaimer

This guide is based on the current implementation of Bhakti Breath Pacer as of October 2025. Always:
- Review your actual app functionality before submitting
- Consult with legal counsel for complex privacy requirements
- Stay updated with Google Play policy changes
- Test your app to ensure data practices match your declarations`;

function renderMarkdown(md: string) {
  // Very lightweight markdown renderer for headings and paragraphs
  const lines = md.split('\n');
  const elements: React.ReactNode[] = [];

  lines.forEach((line, idx) => {
    const key = `${idx}-${line.slice(0, 10)}`;
    if (line.startsWith('### ')) {
      elements.push(
        <Text key={key} style={styles.h3}>{line.replace(/^###\s+/, '')}</Text>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <Text key={key} style={styles.h2}>{line.replace(/^##\s+/, '')}</Text>
      );
    } else if (line.startsWith('# ')) {
      elements.push(
        <Text key={key} style={styles.h1}>{line.replace(/^#\s+/, '')}</Text>
      );
    } else if (line.startsWith('- ')) {
      elements.push(
        <View key={key} style={styles.bulletRow}>
          <Text style={styles.bullet}>{'\u2022'}</Text>
          <Text style={styles.p}>{line.replace(/^-\s+/, '')}</Text>
        </View>
      );
    } else if (line.trim() === '---') {
      elements.push(<View key={key} style={styles.rule} />);
    } else if (line.trim() === '') {
      elements.push(<View key={key} style={{ height: 8 }} />);
    } else {
      // Simple bold replacement for **text**
      const segments = line.split(/(\*\*[^*]+\*\*)/g);
      elements.push(
        <Text key={key} style={styles.p}>
          {segments.map((seg, i) => {
            if (/^\*\*[^*]+\*\*$/.test(seg)) {
              return (
                <Text key={`${key}-b-${i}`} style={{ fontWeight: '700', color: COLORS.creamText }}>
                  {seg.replace(/\*\*/g, '')}
                </Text>
              );
            }
            return <Text key={`${key}-t-${i}`} style={{ color: COLORS.creamText }}>{seg}</Text>;
          })}
        </Text>
      );
    }
  });

  return elements;
}

export default function PrivacyPolicyScreen() {
  return (
    <ThemedView style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.logoLeaf}>🌱</Text>
          <ThemedText style={styles.title} type="title">Privacy Policy</ThemedText>
          <ThemedText style={styles.subtitle}>
            Bhakti Breath Pacer
          </ThemedText>
        </View>

        <View style={styles.section}>{renderMarkdown(PRIVACY_MD)}</View>

        <View style={styles.divider} />

        <View style={styles.headerSmall}>
          <ThemedText style={styles.subtitle} type="subtitle">Google Play Data Safety Guide</ThemedText>
        </View>

        <View style={styles.section}>{renderMarkdown(DATA_SAFETY_MD)}</View>

        <View style={{ height: 24 }} />

        {/* Back to Home link */}
        <Link href="/(tabs)" style={styles.backLink}>
          <Text style={styles.backLinkText}>← Back to Breath Pacer</Text>
        </Link>

        <View style={{ height: 40 }} />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
    backgroundColor: COLORS.bg,
  },
  header: {
    alignItems: 'center',
    marginBottom: 16,
  },
  headerSmall: {
    marginTop: 8,
    marginBottom: 8,
  },
  logoLeaf: { fontSize: 36, color: COLORS.cream },
  title: { color: COLORS.creamText },
  subtitle: { color: COLORS.creamText, opacity: 0.9 },
  section: {
    backgroundColor: COLORS.bgDark,
    borderRadius: 12,
    padding: 16,
  },
  h1: {
    color: COLORS.creamText,
    fontSize: 26,
    fontWeight: '800',
    marginTop: 12,
    marginBottom: 6,
  },
  h2: {
    color: COLORS.creamText,
    fontSize: 20,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 6,
  },
  h3: {
    color: COLORS.creamText,
    fontSize: 18,
    fontWeight: '700',
    marginTop: 10,
    marginBottom: 4,
  },
  p: {
    color: COLORS.creamText,
    fontSize: 16,
    lineHeight: 24,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  bullet: {
    color: COLORS.creamText,
    marginTop: 2,
  },
  rule: {
    height: 1,
    backgroundColor: COLORS.cream,
    opacity: 0.4,
    marginVertical: 12,
  },
  divider: {
    height: 2,
    backgroundColor: COLORS.cream,
    opacity: 0.5,
    marginVertical: 18,
    borderRadius: 2,
  },
  backLink: {
    alignSelf: 'center',
    paddingVertical: 10,
  },
  backLinkText: {
    color: COLORS.creamText,
    fontSize: 16,
    textDecorationLine: 'underline',
    opacity: 0.8,
  },
});
