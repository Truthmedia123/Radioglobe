import React from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { ArrowLeft, Mic, Trash2, Play, Plus } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, RADIUS } from '../constants/theme';
import { useRecordingStore } from '../store/recordingStore';
import { audioService } from '../services/audioService';
import { recordingService } from '../services/recordingService';

interface RecordingListScreenProps {
  visible: boolean;
  onClose: () => void;
}

const THEME = {
  surfacePrimary: '#0B0E14',
  textPrimary: '#F0F2F5',
  surfaceSecondary: '#141A24',
  accentPrimary: '#F5A623',
  danger: '#FF6B6B',
};

export const RecordingListScreen: React.FC<RecordingListScreenProps> = ({ visible, onClose }) => {
  const { 
    scheduledRecordings, 
    completedRecordings, 
    removeScheduledRecording, 
    removeCompletedRecording,
    setRecordingModalOpen
  } = useRecordingStore();

  const handlePlay = async (uri: string) => {
    try {
      await audioService.play(uri);
    } catch (e) {
      console.error('Failed to play recording', e);
    }
  };

  const handleDeleteScheduled = async (id: string) => {
    await recordingService.cancelRecording(id);
    removeScheduledRecording(id);
  };

  const handleDeleteCompleted = async (id: string) => {
    await recordingService.deleteRecording(id);
    removeCompletedRecording(id);
  };

  const formatDate = (dateObj: Date | string) => {
    const d = new Date(dateObj);
    return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isEmpty = scheduledRecordings.length === 0 && completedRecordings.length === 0;

  return (
    <Modal animationType="slide" transparent={false} visible={visible} onRequestClose={onClose}>
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
          <Text style={styles.title}>Scheduled Recordings</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {isEmpty ? (
            <View style={styles.emptyState}>
              <Mic size={64} color={THEME.accentPrimary} />
              <Text style={styles.emptyTitle}>No recordings yet</Text>
              <Text style={styles.emptySub}>Schedule a recording to listen later.</Text>
            </View>
          ) : (
            <>
              {scheduledRecordings.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Upcoming</Text>
                  {scheduledRecordings.map((rec) => (
                    <View key={rec.id} style={styles.card}>
                      <View style={styles.cardInfo}>
                        <Text style={styles.cardTitle}>{rec.title}</Text>
                        <Text style={styles.cardSub}>{rec.station.name}</Text>
                        <Text style={styles.cardTime}>{formatDate(rec.startTime)} ({rec.duration} min)</Text>
                      </View>
                      <TouchableOpacity 
                        style={styles.actionButton}
                        onPress={() => handleDeleteScheduled(rec.id)}
                        accessibilityLabel="Delete scheduled recording"
                        accessibilityRole="button"
                      >
                        <Trash2 size={20} color={THEME.danger} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}

              {completedRecordings.length > 0 && (
                <View style={styles.section}>
                  <Text style={styles.sectionTitle}>Past</Text>
                  {completedRecordings.map((rec) => (
                    <View key={rec.id} style={styles.card}>
                      <View style={styles.cardInfo}>
                        <Text style={styles.cardTitle}>{rec.title}</Text>
                        <Text style={styles.cardSub}>{rec.station.name}</Text>
                        <Text style={styles.cardTime}>{formatDate(rec.recordedAt)}</Text>
                      </View>
                      <View style={styles.actions}>
                        <TouchableOpacity 
                          style={styles.playButton}
                          onPress={() => handlePlay(rec.fileUri)}
                          accessibilityLabel="Play recording"
                          accessibilityRole="button"
                        >
                          <Play size={18} color={THEME.accentPrimary} fill={THEME.accentPrimary} />
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={styles.actionButton}
                          onPress={() => handleDeleteCompleted(rec.id)}
                          accessibilityLabel="Delete recording"
                          accessibilityRole="button"
                        >
                          <Trash2 size={20} color={THEME.danger} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </>
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.createButton} 
            onPress={() => setRecordingModalOpen(true)}
            accessibilityLabel="Schedule Recording"
            accessibilityRole="button"
          >
            <Plus size={20} color={COLORS.black} />
            <Text style={styles.createButtonText}>Schedule Recording</Text>
          </TouchableOpacity>
        </View>
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
    fontFamily: TYPOGRAPHY.h1.fontFamily,
    fontSize: 20,
    color: THEME.textPrimary,
    flex: 1,
    textAlign: 'center',
  },
  placeholder: {
    width: 44,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 80,
  },
  emptyTitle: {
    fontFamily: TYPOGRAPHY.h2.fontFamily,
    fontSize: 22,
    color: THEME.textPrimary,
    marginTop: 16,
  },
  emptySub: {
    fontFamily: TYPOGRAPHY.body.fontFamily,
    color: COLORS.secondaryText,
    marginTop: 8,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY.h2.fontFamily,
    fontSize: 18,
    color: THEME.accentPrimary,
    marginBottom: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: THEME.surfaceSecondary,
    borderRadius: RADIUS.lg,
    marginBottom: 12,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontFamily: TYPOGRAPHY.body.fontFamily,
    fontWeight: '600',
    fontSize: 16,
    color: THEME.textPrimary,
  },
  cardSub: {
    fontFamily: TYPOGRAPHY.body.fontFamily,
    fontSize: 14,
    color: COLORS.secondaryText,
    marginTop: 4,
  },
  cardTime: {
    fontFamily: TYPOGRAPHY.caption.fontFamily,
    color: COLORS.mutedText,
    marginTop: 8,
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  playButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(245, 166, 35, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionButton: {
    padding: 8,
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20,
    backgroundColor: THEME.surfacePrimary,
  },
  createButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.accentPrimary,
    paddingVertical: 16,
    borderRadius: RADIUS.round,
    gap: 8,
  },
  createButtonText: {
    fontFamily: TYPOGRAPHY.body.fontFamily,
    fontWeight: '600',
    fontSize: 16,
    color: COLORS.black,
  },
});
