# Running RadioGlobe App Locally

## Current Status
✅ **Expo development server is already running** on port 8081

## How to Access the App

### Option 1: Expo Go on Physical Device (Recommended)
1. Install **Expo Go** app from App Store (iOS) or Play Store (Android)
2. Scan the QR code from the terminal running `npm start`
3. The app will load on your device with hot reload

### Option 2: Android Emulator
1. Ensure Android Studio is installed with an emulator set up
2. Run:
   ```bash
   npm run android
   ```
3. The app will launch in the Android emulator

### Option 3: iOS Simulator (macOS only)
1. Ensure Xcode is installed
2. Run:
   ```bash
   npm run ios
   ```
3. The app will launch in the iOS simulator

### Option 4: Web Browser
1. Run:
   ```bash
   npm run web
   ```
2. Open browser to `http://localhost:19006`

## Testing Week 9-10 Features

### 1. CarPlay & Android Auto Integration
- The service is initialized automatically on app start
- Check console logs for "CarPlay/Android Auto service initialized"
- Mock implementation works without real hardware

### 2. Chromecast / Google Cast
- The service is initialized automatically
- Check console logs for "Chromecast/Cast service initialized"
- Mock devices appear in the UI (when implemented)
- Try casting to mock devices like "Living Room Chromecast"

### 3. Shared "Radio Garden" Links
- **Share Button**: Look for the 🔗 icon in:
  - Utility buttons section (top-right of PlayerScreen)
  - Each station in the stations list
- **Deep Linking**: Test with URL:
  ```
  radioglobe://station/test-station-id?name=Test%20Station
  ```
- **Share Functionality**: Click any share button to test native sharing

## Troubleshooting

### If server is not running:
```bash
cd radio-app
npm start
```

### Clear cache if needed:
```bash
npx expo start --clear
```

### Check TypeScript compilation:
```bash
npx tsc --noEmit
```

## Development Notes
- All Week 9-10 features use mock implementations
- No physical hardware required for testing
- TypeScript compilation passes without errors
- Hot reload is enabled for quick development

## Next Steps for Real Hardware Testing
1. **CarPlay/Android Auto**: Connect to real car system or simulator
2. **Chromecast**: Configure real Google Cast SDK
3. **Deep Links**: Configure Firebase Dynamic Links for production