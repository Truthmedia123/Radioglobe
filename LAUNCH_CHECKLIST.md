# RadioGlobe App Launch Checklist

## Phase 1: Development Client Build

### Prerequisites
1. Expo account (create at https://expo.dev if you don't have one)
2. EAS CLI installed (`npm install -g eas-cli`)
3. Android Studio/Xcode for local builds (optional, EAS cloud builds recommended)

### Steps to Build Development Client

1. **Login to Expo**:
   ```bash
   cd radio-app
   eas login
   ```
   Follow the prompts to authenticate with your Expo account.

2. **Configure EAS Project** (first time only):
   ```bash
   eas init
   ```
   This will create a project on Expo servers.

3. **Build Development Client for Android**:
   ```bash
   eas build --platform android --profile development
   ```
   - This will create a development build with full native capabilities
   - Build time: ~15-20 minutes
   - Cost: Free for development builds

4. **Build Development Client for iOS** (if you have Apple Developer account):
   ```bash
   eas build --platform ios --profile development
   ```

5. **Install Development Client**:
   - After build completes, EAS will output a QR code and install URL
   - Scan QR code with your phone camera to install
   - On Android, you may need to enable "Install from unknown sources"

6. **Test Development Client**:
   ```bash
   npx expo start --dev-client
   ```
   - Open the RadioGlobe Dev Client on your phone
   - Scan the QR code from Metro bundler
   - Verify all features work without Expo Go guards

## Phase 2: Store Beta Preparation

### App Store Configuration
1. **Update Bundle Identifiers** (if needed):
   - iOS: `com.radioglobe.app` (update in app.json)
   - Android: `com.radioglobe.app` (update in app.json)

2. **Build Preview Builds** (for internal testing):
   ```bash
   # Android preview build
   eas build --platform android --profile preview
   
   # iOS preview build (requires Apple Developer account)
   eas build --platform ios --profile preview
   ```

3. **TestFlight Submission** (iOS):
   ```bash
   eas submit --platform ios
   ```
   - Requires App Store Connect access
   - Add internal testers in App Store Connect
   - Wait for beta review (usually 24-48 hours)

4. **Google Play Closed Testing** (Android):
   ```bash
   eas submit --platform android
   ```
   - Requires Google Play Console access
   - Create Closed Testing track
   - Add at least 12 testers (required for 14-day test)
   - Upload to Internal Testing track first

## Phase 3: Store Submission

### App Store Assets
1. **Screenshots** (required for both stores):
   - iPhone: 6.5" (1242x2688) and 5.5" (1242x2208)
   - iPad: 12.9" (2048x2732) and 10.5" (1668x2224)
   - Android: 7" (1024x600) and 10" (1280x800)
   - Show dark theme, amber accents, globe visuals

2. **App Description**:
   - Title: RadioGlobe
   - Subtitle: Global Radio, Local Discovery
   - Description: 4000+ radio stations worldwide with smart discovery, alarms, recordings, and social features
   - Keywords: radio, streaming, music, discovery, global, local, alarm, recording

3. **Privacy Policy**:
   - Required for both stores
   - Create at https://app.privacypolicies.com
   - Include data collection details (location, microphone usage)

4. **App Icon**:
   - Already in assets/icon.png and assets/adaptive-icon.png
   - Ensure no transparency issues

### Final Submission Checklist
- [ ] All Expo Go guards removed from code
- [ ] Development client tested with all features
- [ ] CarPlay functionality verified (simulator or real device)
- [ ] Chromecast discovery working
- [ ] Push notifications working in dev client
- [ ] Alarm and recording features functional
- [ ] No console errors in dev client
- [ ] App Store screenshots prepared
- [ ] Privacy policy URL ready
- [ ] App description finalized
- [ ] TestFlight/Play Console testers added
- [ ] App reviewed by at least 3 testers

## Troubleshooting

### Common Issues

1. **EAS Build Fails**:
   - Check internet connection
   - Verify eas.json configuration
   - Ensure all dependencies are in package.json

2. **Development Client Won't Install**:
   - Android: Enable "Install from unknown sources"
   - iOS: Trust developer certificate in Settings > General > Device Management

3. **Native Features Not Working**:
   - Ensure you're using dev client, not Expo Go
   - Check that native modules are properly imported
   - Verify permissions are requested at runtime

4. **Metro Connection Issues**:
   - Ensure phone and computer are on same network
   - Try `npx expo start --dev-client --lan`
   - Use `--tunnel` if on different networks

## Post-Launch Tasks

1. **Monitor Crash Reports**:
   - Set up Sentry or Firebase Crashlytics
   - Monitor EAS build logs

2. **Gather User Feedback**:
   - Use TestFlight/Play Console feedback
   - Monitor app store reviews

3. **Plan Updates**:
   - Bug fixes based on user reports
   - Feature enhancements
   - Performance improvements

## Support Contacts
- Expo Support: https://expo.dev/support
- Apple Developer Support: https://developer.apple.com/support/
- Google Play Console Help: https://support.google.com/googleplay/

---

**Estimated Timeline**:
- Development Client Build: 1-2 hours
- Internal Testing: 2-3 days
- Store Review: 1-3 days (iOS), 1-2 days (Android)
- Total Time to Launch: 5-7 days