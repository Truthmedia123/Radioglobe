import React, { useState, useEffect } from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Switch,
  Alert,
} from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Linking from 'expo-linking';
import { COLORS, TYPOGRAPHY } from '../constants/theme';
import { usePlayerStore } from '../store/playerStore';
import { usePodcastStore } from '../store/podcastStore';
import { useEQStore } from '../store/eqStore';

interface SettingsScreenProps {
  visible: boolean;
  onClose: () => void;
}

const THEME = {
  surfacePrimary: '#0B0E14',
  textPrimary: '#F0F2F5',
  surfaceTertiary: '#232B3D',
  accentPrimary: '#F5A623',
};

export const SettingsScreen: React.FC<SettingsScreenProps> = ({ visible, onClose }) => {
  const { isEcoMode, setIsEcoMode } = usePlayerStore();
  const { setEQModalOpen } = useEQStore();
  
  const [hapticFeedback, setHapticFeedback] = useState(true);
  const [alarmNotifications, setAlarmNotifications] = useState(true);
  const [recordingReminders, setRecordingReminders] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const haptic = await AsyncStorage.getItem('@haptic-feedback');
        if (haptic !== null) setHapticFeedback(haptic === 'true');

        const alarms = await AsyncStorage.getItem('@alarm-notifications');
        if (alarms !== null) setAlarmNotifications(alarms === 'true');

        const recordings = await AsyncStorage.getItem('@recording-reminders');
        if (recordings !== null) setRecordingReminders(recordings === 'true');
      } catch (e) {
        console.error('Failed to load settings', e);
      }
    };
    if (visible) {
      loadSettings();
    }
  }, [visible]);

  const toggleEcoMode = () => {
    const newVal = !isEcoMode;
    setIsEcoMode(newVal);
    AsyncStorage.setItem('@eco-mode', newVal.toString());
  };

  const toggleHaptic = () => {
    const newVal = !hapticFeedback;
    setHapticFeedback(newVal);
    AsyncStorage.setItem('@haptic-feedback', newVal.toString());
  };

  const toggleAlarms = () => {
    const newVal = !alarmNotifications;
    setAlarmNotifications(newVal);
    AsyncStorage.setItem('@alarm-notifications', newVal.toString());
  };

  const toggleRecordings = () => {
    const newVal = !recordingReminders;
    setRecordingReminders(newVal);
    AsyncStorage.setItem('@recording-reminders', newVal.toString());
  };

  const clearPodcastCache = () => {
    Alert.alert(
      'Clear Cache',
      'Are you sure you want to delete all downloaded podcast episodes?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear', 
          style: 'destructive',
          onPress: async () => {
            const state = usePodcastStore.getState();
            if ((state as any).clearDownloads) {
              await (state as any).clearDownloads();
            } else {
              // Fallback if clearDownloads isn't implemented
              const keys = await AsyncStorage.getAllKeys();
              const podcastKeys = keys.filter(k => k.startsWith('@podcast-'));
              if (podcastKeys.length > 0) {
                await AsyncStorage.multiRemove(podcastKeys);
              }
            }
            Alert.alert('Success', 'Podcast cache cleared');
          }
        }
      ]
    );
  };

  const openPrivacyPolicy = () => {
    Linking.openURL('https://radioglobe.app/privacy');
  };

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity 
            style={styles.backButton} 
            onPress={onClose}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <ArrowLeft size={24} color={THEME.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.title}>Settings</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          
          <Text style={styles.sectionTitle}>Audio</Text>
          <View style={styles.row}>
            <Text style={styles.rowText}>Eco Mode</Text>
            <Switch 
              value={isEcoMode} 
              onValueChange={toggleEcoMode} 
              trackColor={{ false: THEME.surfaceTertiary, true: THEME.accentPrimary }}
              accessibilityRole="switch"
              accessibilityLabel="Toggle Eco Mode"
            />
          </View>
          <View style={styles.divider} />
          
          <View style={styles.row}>
            <Text style={styles.rowText}>Haptic Feedback</Text>
            <Switch 
              value={hapticFeedback} 
              onValueChange={toggleHaptic} 
              trackColor={{ false: THEME.surfaceTertiary, true: THEME.accentPrimary }}
              accessibilityRole="switch"
              accessibilityLabel="Toggle Haptic Feedback"
            />
          </View>
          <View style={styles.divider} />

          <TouchableOpacity 
            style={styles.row} 
            onPress={() => setEQModalOpen(true)}
            accessibilityRole="button"
            accessibilityLabel="Open Equalizer"
          >
            <Text style={styles.rowText}>Equalizer</Text>
          </TouchableOpacity>

          <Text style={styles.sectionTitle}>Notifications</Text>
          <View style={styles.row}>
            <Text style={styles.rowText}>Alarm Notifications</Text>
            <Switch 
              value={alarmNotifications} 
              onValueChange={toggleAlarms} 
              trackColor={{ false: THEME.surfaceTertiary, true: THEME.accentPrimary }}
              accessibilityRole="switch"
              accessibilityLabel="Toggle Alarm Notifications"
            />
          </View>
          <View style={styles.divider} />
          
          <View style={styles.row}>
            <Text style={styles.rowText}>Recording Reminders</Text>
            <Switch 
              value={recordingReminders} 
              onValueChange={toggleRecordings} 
              trackColor={{ false: THEME.surfaceTertiary, true: THEME.accentPrimary }}
              accessibilityRole="switch"
              accessibilityLabel="Toggle Recording Reminders"
            />
          </View>

          <Text style={styles.sectionTitle}>Data & Privacy</Text>
          <TouchableOpacity 
            style={styles.row} 
            onPress={clearPodcastCache}
            accessibilityRole="button"
            accessibilityLabel="Clear podcast download cache"
          >
            <Text style={styles.rowText}>Clear podcast download cache</Text>
          </TouchableOpacity>
          <View style={styles.divider} />
          
          <TouchableOpacity 
            style={styles.row} 
            onPress={openPrivacyPolicy}
            accessibilityRole="button"
            accessibilityLabel="Privacy Policy"
          >
            <Text style={styles.rowText}>Privacy Policy</Text>
          </TouchableOpacity>
          <View style={styles.divider} />

          <View style={styles.row}>
            <Text style={styles.rowText}>About</Text>
            <Text style={styles.versionText}>Version 1.0.0</Text>
          </View>

        </ScrollView>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: THEME.surfacePrimary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: THEME.textPrimary,
    borderRadius: 22,
  },
  title: {
    fontFamily: 'PlayfairDisplay_600SemiBold',
    fontSize: 28,
    color: THEME.textPrimary,
    textAlign: 'center',
  },
  placeholder: {
    width: 44,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY.h2.fontFamily,
    fontSize: 20,
    color: THEME.accentPrimary,
    marginTop: 32,
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
  },
  rowText: {
    fontFamily: TYPOGRAPHY.body.fontFamily,
    fontSize: 16,
    color: THEME.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: THEME.surfaceTertiary,
  },
  versionText: {
    fontFamily: TYPOGRAPHY.caption.fontFamily,
    fontSize: 14,
    color: COLORS.secondaryText,
  },
});