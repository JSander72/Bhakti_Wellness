# Google Play Console Data Safety Form Guide

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
- Example: `https://yourdomain.com/privacy-policy`
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

1. **✅ Privacy Policy Created:** Located at `/PRIVACY_POLICY.md` in your project
2. **✅ In-App Link Added:** Privacy policy link added to app footer
3. **⚠️ Host Privacy Policy:** Upload your privacy policy to a public URL (required)
4. **⚠️ Update App Link:** Replace the placeholder URL in the app with your actual privacy policy URL
5. **⚠️ Complete Data Safety Form:** Use the responses provided in this guide
6. **⚠️ Add Policy URL to Console:** Add the privacy policy URL in Google Play Console

### Code Updates Needed:

1. **Update Privacy Policy Link in App:**
   
   In `components/BreathPacer.tsx`, replace:
   ```tsx
   const privacyUrl = "https://your-website.com/privacy-policy";
   ```
   
   With your actual URL:
   ```tsx
   const privacyUrl = "https://yourdomain.com/privacy-policy";
   ```

2. **Consider Using Expo WebBrowser:**
   
   For a better user experience, consider opening the privacy policy in a web browser:
   ```tsx
   import * as WebBrowser from 'expo-web-browser';
   
   // In the onPress handler:
   WebBrowser.openBrowserAsync(privacyUrl);
   ```

### Hosting Your Privacy Policy

You can host your privacy policy using:

1. **GitHub Pages (Free):**
   - Create a repository with your privacy policy as `index.html`
   - Enable GitHub Pages in repository settings
   - URL will be: `https://yourusername.github.io/repository-name`

2. **Your Website:**
   - Upload as a dedicated page: `https://yourdomain.com/privacy-policy`

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
- Test your app to ensure data practices match your declarations