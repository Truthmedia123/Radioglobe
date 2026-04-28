import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator } from 'react-native';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { PlayfairDisplay_400Regular, PlayfairDisplay_700Bold } from '@expo-google-fonts/playfair-display';
import { JetBrainsMono_400Regular } from '@expo-google-fonts/jetbrains-mono';
import { audioService } from './src/services/audioService';
import { carPlayService } from './src/services/carPlayService';
import { castService } from './src/services/castService';
import { deepLinkService } from './src/services/deepLinkService';
// Week 11-12 Services
import { hapticService } from './src/services/hapticService';
import { performanceService } from './src/services/performanceService';
import { accessibilityService } from './src/services/accessibilityService';
import { launchService } from './src/services/launchService';
import { listeningRoomService } from './src/services/listeningRoomService';
import { foundSoundService } from './src/services/foundSoundService';
import { adAwareService } from './src/services/adAwareService';
import { COLORS } from './src/constants/theme';
import { TriDial } from './src/navigation/TriDial';
import { DiscoveryScreen } from './src/screens/DiscoveryScreen';
import { PlayerScreen } from './src/screens/PlayerScreen';
import { ArchiveScreen } from './src/screens/ArchiveScreen';

export default function App() {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    PlayfairDisplay_400Regular,
    PlayfairDisplay_700Bold,
    JetBrainsMono_400Regular,
  });

  useEffect(() => {
    // Initialize core services
    audioService.init();

    // Initialize Week 9-10 features
    carPlayService.init().then(success => {
      if (success) {
        console.log('CarPlay/Android Auto service initialized');
      }
    });

    castService.init().then(success => {
      if (success) {
        console.log('Chromecast/Cast service initialized');
      }
    });

    deepLinkService.init().then(success => {
      if (success) {
        console.log('Deep linking service initialized');
      }
    });

    // Initialize Week 11-12 features
    console.log('Initializing Week 11-12 features...');

    // Initialize listening rooms
    listeningRoomService.init().then(success => {
      if (success) {
        console.log('Listening rooms service initialized');
      }
    });

    // Initialize found sound service
    foundSoundService.init().then(success => {
      if (success) {
        console.log('Found Sound archive service initialized');
      }
    });

    // Initialize ad-aware service
    adAwareService.init().then(success => {
      if (success) {
        console.log('Ad-aware listener service initialized');
      }
    });

    // Initialize polish features
    console.log('Haptic service ready');
    console.log('Performance service ready');
    console.log('Accessibility service ready');

    // Generate launch report in development
    if (__DEV__) {
      launchService.generateLaunchReport().then(report => {
        console.log('Launch report generated');
        console.log(report.substring(0, 500) + '...'); // Log first 500 chars
      });
    }
  }, []);

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.background, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.background }}>
      <StatusBar style="light" />
      <TriDial
        discoveryScreen={<DiscoveryScreen />}
        playerScreen={<PlayerScreen />}
        archiveScreen={<ArchiveScreen />}
      />
    </View>
  );
}
