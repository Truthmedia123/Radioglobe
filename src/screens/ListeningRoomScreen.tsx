import React, { useState, useEffect } from 'react';
import {
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { ArrowLeft, Users, Share2, Plus, Radio, LogOut } from 'lucide-react-native';
import * as Clipboard from 'expo-clipboard';
import { COLORS, TYPOGRAPHY, RADIUS } from '../constants/theme';
import { useListeningRoomStore } from '../store/listeningRoomStore';
import { listeningRoomService } from '../services/listeningRoomService';
import { usePlayerStore } from '../store/playerStore';

interface ListeningRoomScreenProps {
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

export const ListeningRoomScreen: React.FC<ListeningRoomScreenProps> = ({ visible, onClose }) => {
  const { currentRoom, availableRooms, participants, isHost } = useListeningRoomStore();
  const { currentStation } = usePlayerStore();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible && !currentRoom) {
      loadRooms();
    }
  }, [visible, currentRoom]);

  const loadRooms = async () => {
    setLoading(true);
    await listeningRoomService.getAvailableRooms();
    setLoading(false);
  };

  const handleJoinRoom = async (roomId: string) => {
    setLoading(true);
    try {
      await listeningRoomService.joinRoom(roomId);
    } catch (e) {
      Alert.alert('Error', 'Failed to join room');
    }
    setLoading(false);
  };

  const handleLeaveRoom = async () => {
    setLoading(true);
    await listeningRoomService.leaveRoom();
    setLoading(false);
  };

  const handleCreateRoom = () => {
    Alert.prompt(
      'Create Room',
      'Enter a name for your listening room:',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Create', 
          onPress: async (name?: string) => {
            if (name) {
              setLoading(true);
              try {
                if (currentStation) {
                  await listeningRoomService.createRoom(name, currentStation);
                } else {
                  Alert.alert('Notice', 'Play a station first to create a room for it.');
                }
              } catch (e) {
                Alert.alert('Error', 'Failed to create room');
              }
              setLoading(false);
            }
          }
        }
      ],
      'plain-text'
    );
  };

  const handleShareRoom = async () => {
    if (!currentRoom) return;
    const url = `radioglobe://room/${currentRoom.id}`;
    await Clipboard.setStringAsync(url);
    Alert.alert('Copied!', 'Room link copied to clipboard.');
  };

  const handlePickStation = () => {
    // For now, if host has a current station, just set it
    if (currentStation) {
      // Assuming setStation signature: (stationId, stationName, stationUrl)
      // or setStation(station)
      // I'll call a hypothetical method or update via store/service
      if ('setRoomStation' in listeningRoomService) {
        (listeningRoomService as any).setRoomStation(currentStation);
      } else {
        Alert.alert('Notice', 'Mini station search to be implemented. Change station in Player to update room if supported.');
      }
    } else {
      Alert.alert('Notice', 'Play a station first, then it can be broadcast to the room.');
    }
  };

  if (currentRoom) {
    return (
      <Modal animationType="slide" transparent={false} visible={visible} onRequestClose={onClose}>
        <SafeAreaView style={styles.container}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={1}>{currentRoom.name}</Text>
            <TouchableOpacity 
              style={styles.leaveButton} 
              onPress={handleLeaveRoom}
              accessibilityLabel="Leave room"
              accessibilityRole="button"
            >
              <LogOut size={20} color={THEME.danger} />
              <Text style={styles.leaveText}>Leave</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.insideContent}>
            <View style={styles.stationCard}>
              <Radio size={48} color={THEME.accentPrimary} />
              <Text style={styles.stationName}>
                {currentRoom.stationName || 'No station selected'}
              </Text>
              
              {isHost && (
                <TouchableOpacity style={styles.pickStationButton} onPress={handlePickStation}>
                  <Text style={styles.pickStationText}>Pick Station</Text>
                </TouchableOpacity>
              )}
            </View>

            <View style={styles.participantsContainer}>
              <Text style={styles.sectionTitle}>Listeners ({participants.length || 1})</Text>
              <ScrollView style={styles.participantsList}>
                {(participants.length > 0 ? participants : [{ userId: 'me', userName: 'You (Host)' }]).map((p, i) => (
                  <View key={i} style={styles.participantRow}>
                    <View style={styles.pulseDot} />
                    <Text style={styles.participantName}>{p.userName || p.userId}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            <TouchableOpacity 
              style={styles.shareButton} 
              onPress={handleShareRoom}
              accessibilityLabel="Share Room"
              accessibilityRole="button"
            >
              <Share2 size={20} color={COLORS.black} />
              <Text style={styles.shareButtonText}>Share Room</Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    );
  }

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
          <Text style={styles.title}>Listening Rooms</Text>
          <View style={styles.placeholder} />
        </View>

        {loading ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={THEME.accentPrimary} />
          </View>
        ) : (
          <ScrollView contentContainerStyle={styles.content}>
            {availableRooms.length === 0 ? (
              <View style={styles.emptyState}>
                <Users size={64} color={COLORS.secondaryText} />
                <Text style={styles.emptyTitle}>No active rooms</Text>
                <Text style={styles.emptySub}>Create one to listen together.</Text>
              </View>
            ) : (
              availableRooms.map((room) => (
                <TouchableOpacity 
                  key={room.id} 
                  style={styles.roomCard}
                  onPress={() => handleJoinRoom(room.id)}
                  accessibilityLabel={`Join room ${room.name}`}
                  accessibilityRole="button"
                >
                  <View style={styles.roomIcon}>
                    <Users size={24} color={THEME.textPrimary} />
                  </View>
                  <View style={styles.roomInfo}>
                    <Text style={styles.roomName}>{room.name}</Text>
                    <Text style={styles.roomStation}>{room.stationName || 'No station'}</Text>
                  </View>
                  <View style={styles.roomStats}>
                    <Text style={styles.roomCount}>{room.listenerCount || 0}</Text>
                    <View style={styles.pulseDot} />
                  </View>
                </TouchableOpacity>
              ))
            )}
          </ScrollView>
        )}

        <View style={styles.footer}>
          <TouchableOpacity 
            style={styles.createButton} 
            onPress={handleCreateRoom}
            accessibilityLabel="Create Room"
            accessibilityRole="button"
          >
            <Plus size={20} color={COLORS.black} />
            <Text style={styles.createButtonText}>Create Room</Text>
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
  leaveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    backgroundColor: 'rgba(255, 107, 107, 0.1)',
    borderRadius: RADIUS.round,
    gap: 4,
  },
  leaveText: {
    fontFamily: TYPOGRAPHY.body.fontFamily,
    color: THEME.danger,
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 100,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
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
  roomCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: THEME.surfaceSecondary,
    borderRadius: RADIUS.lg,
    marginBottom: 12,
  },
  roomIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  roomInfo: {
    flex: 1,
  },
  roomName: {
    fontFamily: TYPOGRAPHY.body.fontFamily,
    fontWeight: '600',
    fontSize: 16,
    color: THEME.textPrimary,
  },
  roomStation: {
    fontFamily: TYPOGRAPHY.caption.fontFamily,
    color: COLORS.secondaryText,
    marginTop: 4,
  },
  roomStats: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  roomCount: {
    fontFamily: TYPOGRAPHY.data.fontFamily,
    color: THEME.accentPrimary,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: THEME.accentPrimary,
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
  insideContent: {
    flex: 1,
    padding: 20,
  },
  stationCard: {
    alignItems: 'center',
    padding: 32,
    backgroundColor: THEME.surfaceSecondary,
    borderRadius: RADIUS.xl,
    marginTop: 20,
  },
  stationName: {
    fontFamily: TYPOGRAPHY.h2.fontFamily,
    fontSize: 24,
    color: THEME.textPrimary,
    marginTop: 16,
    textAlign: 'center',
  },
  pickStationButton: {
    marginTop: 24,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: THEME.accentPrimary,
    borderRadius: RADIUS.round,
  },
  pickStationText: {
    color: THEME.accentPrimary,
    fontFamily: TYPOGRAPHY.body.fontFamily,
    fontWeight: '600',
  },
  participantsContainer: {
    flex: 1,
    marginTop: 32,
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY.h2.fontFamily,
    fontSize: 18,
    color: COLORS.secondaryText,
    marginBottom: 16,
  },
  participantsList: {
    flex: 1,
  },
  participantRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    gap: 12,
  },
  participantName: {
    fontFamily: TYPOGRAPHY.body.fontFamily,
    color: THEME.textPrimary,
    fontSize: 16,
  },
  shareButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: THEME.accentPrimary,
    paddingVertical: 16,
    borderRadius: RADIUS.round,
    gap: 8,
    marginTop: 20,
    marginBottom: 20,
  },
  shareButtonText: {
    fontFamily: TYPOGRAPHY.body.fontFamily,
    fontWeight: '600',
    fontSize: 16,
    color: COLORS.black,
  },
});
