import React, { useEffect } from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Switch,
} from 'react-native';
import { ArrowLeft, Clock, Trash2, Plus } from 'lucide-react-native';
import { COLORS, TYPOGRAPHY, RADIUS } from '../constants/theme';
import { useAlarmStore } from '../store/alarmStore';

interface AlarmListScreenProps {
  visible: boolean;
  onClose: () => void;
}

const THEME = {
  surfacePrimary: '#0B0E14',
  textPrimary: '#F0F2F5',
  surfaceSecondary: '#141A24',
  accentPrimary: '#F5A623',
  danger: '#FF6B6B',
  surfaceTertiary: '#232B3D',
};

const DAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export const AlarmListScreen: React.FC<AlarmListScreenProps> = ({ visible, onClose }) => {
  const { 
    alarms, 
    loadAlarms, 
    deleteAlarm, 
    toggleAlarm, 
    setAlarmModalOpen, 
    setEditingAlarm 
  } = useAlarmStore();

  useEffect(() => {
    if (visible) {
      loadAlarms();
    }
  }, [visible]);

  const handleCreate = () => {
    setEditingAlarm(null);
    setAlarmModalOpen(true);
  };

  const handleEdit = (alarm: any) => {
    setEditingAlarm(alarm);
    setAlarmModalOpen(true);
  };

  const formatTime = (dateObj: Date | string) => {
    const d = new Date(dateObj);
    let hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const minutesStr = minutes < 10 ? '0' + minutes : minutes;
    return `${hours}:${minutesStr} ${ampm}`;
  };

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
          <Text style={styles.title}>Alarms</Text>
          <View style={styles.placeholder} />
        </View>

        <ScrollView contentContainerStyle={styles.content}>
          {alarms.length === 0 ? (
            <View style={styles.emptyState}>
              <Clock size={64} color={THEME.accentPrimary} />
              <Text style={styles.emptyTitle}>No alarms set</Text>
              <Text style={styles.emptySub}>Wake up to your favorite stations.</Text>
            </View>
          ) : (
            alarms.map((alarm) => (
              <TouchableOpacity 
                key={alarm.id} 
                style={styles.alarmCard}
                onPress={() => handleEdit(alarm)}
                accessibilityLabel={`Edit alarm ${alarm.name}`}
                accessibilityRole="button"
              >
                <View style={styles.alarmInfo}>
                  <Text style={styles.alarmTime}>{formatTime(alarm.time)}</Text>
                  {alarm.name ? <Text style={styles.alarmLabel}>{alarm.name}</Text> : null}
                  <View style={styles.daysContainer}>
                    {DAYS.map((d, i) => {
                      const isActive = alarm.days.includes(i);
                      return (
                        <Text 
                          key={i} 
                          style={[styles.dayText, isActive && styles.dayTextActive]}
                        >
                          {d}
                        </Text>
                      );
                    })}
                  </View>
                </View>

                <View style={styles.alarmActions}>
                  <Switch
                    value={alarm.enabled}
                    onValueChange={() => { toggleAlarm(alarm.id); }}
                    trackColor={{ false: THEME.surfaceTertiary, true: THEME.accentPrimary }}
                    accessibilityRole="switch"
                    accessibilityLabel={`Toggle alarm ${alarm.name || formatTime(alarm.time)}`}
                  />
                  <TouchableOpacity 
                    style={styles.deleteButton}
                    onPress={() => deleteAlarm(alarm.id)}
                    accessibilityLabel="Delete alarm"
                    accessibilityRole="button"
                  >
                    <Trash2 size={20} color={THEME.danger} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.createButton} 
            onPress={handleCreate}
            accessibilityLabel="Create Alarm"
            accessibilityRole="button"
          >
            <Plus size={20} color={COLORS.black} />
            <Text style={styles.createButtonText}>Create Alarm</Text>
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
    fontSize: 24,
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
  alarmCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    backgroundColor: THEME.surfaceSecondary,
    borderRadius: RADIUS.lg,
    marginBottom: 12,
  },
  alarmInfo: {
    flex: 1,
  },
  alarmTime: {
    fontFamily: TYPOGRAPHY.h1.fontFamily,
    fontSize: 32,
    color: THEME.textPrimary,
  },
  alarmLabel: {
    fontFamily: TYPOGRAPHY.body.fontFamily,
    fontSize: 14,
    color: COLORS.secondaryText,
    marginTop: 4,
  },
  daysContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  dayText: {
    fontFamily: TYPOGRAPHY.caption.fontFamily,
    color: COLORS.mutedText,
    fontSize: 12,
  },
  dayTextActive: {
    color: THEME.accentPrimary,
    fontWeight: 'bold',
  },
  alarmActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  deleteButton: {
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
