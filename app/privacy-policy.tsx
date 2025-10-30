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
const PRIVACY_MD = `Privacy Policy

Effective Date: October 28, 2025
Last Updated: October 28, 2025

Developer Information
App: Bhakti Breath Pacer
Developer: Bhakti Wellness / James Sanders, Venkata Vaibhav Suryadevara, Tameika Brinson, & Sean Desiree
Contact Email: [Your Email Address]
Contact Address: [Your Business Address]
Website: [Your Website URL]
For privacy-related inquiries, please contact us at the email address above.

Overview
Bhakti Breath Pacer is a breathing meditation and mindfulness app designed to help users practice controlled breathing exercises. This Privacy Policy explains how our app accesses, collects, uses, and shares user data in compliance with applicable privacy laws and Google Play Store requirements.

Data Collection and Usage
Information we do not collect:
• Personal identifying information (names, email addresses, phone numbers)
• User accounts or registration data
• Location data or GPS coordinates
• Device identifiers or advertising IDs
• Usage analytics or tracking data
• Health or biometric data
• Contact lists or social media information
• Photos, videos, or camera access
• Microphone recordings
• Payment or financial information

Information we do collect (local device settings only):
• Breathing session preferences such as breaths per minute, session duration, and breathing pattern timing
• Sound preference selections such as ocean, rain, or forest
• App theme preferences such as light or dark mode

How this data is used:
• All user preferences are stored locally on your device
• Data is used solely to customize your breathing sessions
• No data is transmitted to external servers or third parties
• Settings are reset to defaults when you return from a completed session

Technical data
Device capabilities we access:
• Audio system to play optional background sounds during breathing sessions
• Haptic feedback to provide gentle vibrations for breathing rhythm (iOS only)
• Screen wake lock to keep the screen active during sessions
• Device orientation for responsive layout across screen sizes

Android permissions:
• WAKE_LOCK to prevent the screen from sleeping during sessions
• VIBRATE to provide haptic feedback for breathing rhythm

iOS capabilities:
• Background audio playback for breathing session sounds
• Haptic feedback through standard iOS APIs

Data Storage and Security
Local storage only:
• All user preferences are stored locally on your device using standard app storage
• No data is synchronized to cloud services
• No user accounts or external databases are used
• Data remains on your device and is not accessible to us or third parties

Data security measures:
• Local storage uses standard iOS and Android security frameworks
• No network transmission of personal data
• The app does not require internet connectivity for core functionality
• No external analytics or tracking SDKs are integrated

Data Sharing and Third Parties
No data sharing:
We do not share, sell, rent, or disclose any user data to third parties because we do not collect personal or identifying information, all app data remains local on your device, and no third-party services are integrated that access user data.

Third-party services used by the app:
• Expo Framework for cross‑platform development
• React Native for mobile app functionality
• Expo Audio for background sound playback
These frameworks do not transmit your personal data.

Data Retention and Deletion
Automatic data management:
• Session preferences are automatically reset to defaults after each completed breathing session
• App settings persist locally until you reset them or uninstall the app
• No historical session data or usage patterns are stored

User control:
• Use the Reset to Defaults button in the app to clear all preferences
• Uninstalling the app removes all locally stored data
• No account deletion process is required because no accounts are created

Children’s Privacy
Bhakti Breath Pacer is suitable for users of all ages and complies with COPPA (Children’s Online Privacy Protection Act). We do not collect personal information from users of any age, there are no online communication features or social elements, there is no advertising or in‑app purchasing, and the app is safe for children to use without privacy concerns.

International Users
This app is available worldwide. Because the app does not process personal data, GDPR obligations are not applicable. The app does not collect or sell personal information under the CCPA. A privacy‑by‑design approach protects all users equally.

Changes to This Privacy Policy
We may update this Privacy Policy to reflect changes in app functionality, updates to legal requirements, or improvements to privacy practices. Updated versions will be posted in the same location. Material changes will be highlighted in app update notes. Continued use of the app after an update constitutes acceptance of the updated policy.

App Store Compliance
Our privacy practices comply with Google Play Store Developer Policy, Apple App Store Review Guidelines, platform‑specific privacy requirements, and the disclosures you provide in app store listings (including the Data Safety form).

Your Rights and Choices
Because we do not collect personal data, traditional data rights such as access, correction, and deletion are not applicable. You maintain complete control over all app settings stored on your device, may reset them at any time, and can remove all data by uninstalling the app.

Contact Information
Email: [Your Email Address]
Response time: We aim to respond within 48 hours.
For technical support or app‑related questions, please use the same contact information.

Legal Compliance
This Privacy Policy is governed by applicable privacy laws and regulations. If your concerns cannot be resolved through direct contact, you may have the right to contact the relevant privacy authority in your jurisdiction.

Document label: This document serves as the official Privacy Policy for Bhakti Breath Pacer.
Effective Date: This policy is effective as of October 28, 2025 and applies to all current and future versions of the app unless superseded by an updated policy.`;

const DATA_SAFETY_MD = `Google Play Console Data Safety Form Guide

Overview
This guide describes the answers to select in the Google Play Console Data Safety form for Bhakti Breath Pacer, based on the app’s actual data practices.

Data Safety form responses

Section 1 — Data collection and sharing
Does your app collect or share any of the required user data types?
Answer: No.
Reason: The app does not collect, store, or share personal or sensitive user data. All preferences are stored locally on the device.

Section 2 — Data types (for reference)
Because the answer above is No, these sections will not appear. For clarity: personal information, financial information, health and fitness, messages, photos and videos, audio files, files and documents, calendar, contacts, app activity, web browsing, app info and performance (including crash logs and diagnostics), and device or other IDs are not collected.
Important note: Although this is a breathing and wellness app, no health data is collected. The app provides guidance only and does not record or store health metrics.

Section 3 — Security practices
Is all of the user data collected by your app encrypted in transit?
Not applicable. No user data is transmitted.
Do you provide a way for users to request that their data is deleted?
Not applicable. No user data is collected.

Section 4 — Data usage and handling
Not applicable. No data is collected.

Additional compliance information

App store listing requirements
Privacy Policy URL: Host your privacy policy at a publicly accessible, non‑editable URL (for example, https://yourdomain.com/privacy-policy) and add it in Google Play Console under Store presence → App content → Privacy Policy.

Target audience and content
Age rating: Suitable for all ages. There is no violent, sexual, or otherwise inappropriate content.
Complete the content rating questionnaire accordingly.

Advertising and monetization
Ads: None at this time. If ads are added later, update the Data Safety form to reflect any data collection by ad networks.
In‑app purchases: None at this time. If purchases are added later, update the form to reflect any payment data collection.

Implementation checklist before submitting to Google Play
1) Privacy policy created and included in your project (for example, PRIVACY_POLICY.md).
2) In‑app link added to the privacy policy.
3) Privacy policy hosted at a public URL.
4) The in‑app link updated to the final URL.
5) Data Safety form completed with the answers in this guide.
6) Privacy policy URL added in Google Play Console.

Code updates you may want to make
Update the privacy policy link in the app so it points to your final hosted URL (for example, change the placeholder in components/BreathPacer.tsx).
Optionally, use Expo WebBrowser to open the policy in the device browser for a better experience.

Hosting options for the privacy policy
• Your own website at a dedicated path such as https://yourdomain.com/privacy-policy
• GitHub Pages
• Google Sites or a similar static hosting service

Review process tips
• Keep your Data Safety answers consistent with the privacy policy and actual app behavior.
• Ensure the privacy policy URL you provide is publicly accessible.
• Update both the policy and the Data Safety form if features change.
• Google may test your app to verify that no unexpected data collection occurs.

Common rejection reasons to avoid
• Missing privacy policy URL in the console
• Inconsistent answers between the Data Safety form and actual behavior
• Privacy policy not accessible at the given URL
• Missing in‑app disclosure for apps with sensitive permissions

Future considerations
If you later add user accounts, cloud sync, analytics or crash reporting, advertising, in‑app purchases, social features, or health data recording, you must update both the privacy policy and the Data Safety form.

Legal disclaimer
This guide reflects the implementation of Bhakti Breath Pacer as of October 2025. Review your app before submitting, consult legal counsel when needed, stay current with Google Play policy changes, and test the app to ensure that practices match your declarations.`;

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
