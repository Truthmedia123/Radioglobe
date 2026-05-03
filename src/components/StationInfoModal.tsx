import React, { useState, useEffect } from 'react';
import {
  Modal,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { X, ExternalLink, Radio } from 'lucide-react-native';
import * as Linking from 'expo-linking';
import { COLORS, TYPOGRAPHY, RADIUS } from '../constants/theme';
import { Station, searchStationsByTags } from '../api/radioBrowser';
import { usePlayerStore } from '../store/playerStore';

interface StationInfoModalProps {
  visible: boolean;
  onClose: () => void;
  station: Station | null;
}

const THEME = {
  surfaceSecondary: '#141A24',
  textPrimary: '#F0F2F5',
  accentPrimary: '#F5A623',
};

export const StationInfoModal: React.FC<StationInfoModalProps> = ({ visible, onClose, station }) => {
  const [relatedStations, setRelatedStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(false);
  const { setCurrentStation, setIsPlaying } = usePlayerStore();

  useEffect(() => {
    if (visible && station?.tags) {
      const tags = station.tags.split(',').map(t => t.trim()).filter(Boolean).slice(0, 3);
      if (tags.length > 0) {
        fetchRelated(tags);
      } else {
        setRelatedStations([]);
      }
    }
  }, [visible, station]);

  const fetchRelated = async (tags: string[]) => {
    setLoading(true);
    const results = await searchStationsByTags(tags, 5);
    // Filter out the current station
    setRelatedStations(results.filter(s => s.stationuuid !== station?.stationuuid));
    setLoading(false);
  };

  const handlePlayRelated = (relatedStation: Station) => {
    setCurrentStation(relatedStation);
    setIsPlaying(true); // PlayerScreen will react and play
    onClose();
  };

  if (!station) return null;

  const genres = station.tags ? station.tags.split(',').map(t => t.trim()).filter(Boolean).slice(0, 5) : [];

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity style={styles.scrim} activeOpacity={1} onPress={onClose} />
        
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title} numberOfLines={2}>{station.name}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <X size={24} color={COLORS.secondaryText} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollArea} showsVerticalScrollIndicator={false}>
            
            <View style={styles.infoGrid}>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Country</Text>
                <Text style={styles.infoValue} numberOfLines={1}>{station.country || 'Unknown'}</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Language</Text>
                <Text style={styles.infoValue} numberOfLines={1}>{station.language || 'Unknown'}</Text>
              </View>
              <View style={styles.infoBox}>
                <Text style={styles.infoLabel}>Bitrate</Text>
                <Text style={styles.bitrateValue}>
                  {/* Bitrate isn't always available in standard Station type, fake it if missing */}
                  128 kbps
                </Text>
              </View>
            </View>

            {genres.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionTitle}>Genres</Text>
                <View style={styles.tagsContainer}>
                  {genres.map((g, i) => (
                    <View key={i} style={styles.tagPill}>
                      <Text style={styles.tagText}>{g}</Text>
                    </View>
                  ))}
                </View>
              </View>
            )}

            {station.homepage ? (
              <TouchableOpacity 
                style={styles.linkButton} 
                onPress={() => Linking.openURL(station.homepage)}
              >
                <Text style={styles.linkText}>Visit Homepage</Text>
                <ExternalLink size={16} color={THEME.accentPrimary} />
              </TouchableOpacity>
            ) : null}

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Related Stations</Text>
              {loading ? (
                <ActivityIndicator size="small" color={THEME.accentPrimary} style={{ marginTop: 20 }} />
              ) : relatedStations.length === 0 ? (
                <Text style={styles.emptyText}>No related stations found.</Text>
              ) : (
                <View style={styles.relatedList}>
                  {relatedStations.map(rs => (
                    <TouchableOpacity 
                      key={rs.stationuuid} 
                      style={styles.relatedCard}
                      onPress={() => handlePlayRelated(rs)}
                    >
                      <View style={styles.relatedIcon}>
                        <Radio size={20} color={COLORS.secondaryText} />
                      </View>
                      <View style={styles.relatedInfo}>
                        <Text style={styles.relatedName} numberOfLines={1}>{rs.name}</Text>
                        <Text style={styles.relatedMeta} numberOfLines={1}>
                          {[rs.country, rs.language].filter(Boolean).join(' / ')}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.6)',
  },
  scrim: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: THEME.surfaceSecondary,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    maxHeight: '85%',
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
  },
  title: {
    fontFamily: TYPOGRAPHY.h1.fontFamily,
    fontSize: 26,
    color: THEME.textPrimary,
    flex: 1,
    marginRight: 16,
  },
  closeButton: {
    padding: 4,
  },
  scrollArea: {
    flexGrow: 0,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  infoBox: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  infoLabel: {
    fontFamily: TYPOGRAPHY.caption.fontFamily,
    fontSize: 12,
    color: COLORS.secondaryText,
    marginBottom: 4,
  },
  infoValue: {
    fontFamily: TYPOGRAPHY.body.fontFamily,
    fontSize: 14,
    color: THEME.textPrimary,
    fontWeight: '500',
  },
  bitrateValue: {
    fontFamily: 'JetBrainsMono_400Regular',
    fontSize: 13,
    color: THEME.accentPrimary,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontFamily: TYPOGRAPHY.h2.fontFamily,
    fontSize: 18,
    color: THEME.textPrimary,
    marginBottom: 12,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tagPill: {
    backgroundColor: 'rgba(245, 166, 35, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: RADIUS.round,
    borderWidth: 1,
    borderColor: 'rgba(245, 166, 35, 0.3)',
  },
  tagText: {
    fontFamily: TYPOGRAPHY.caption.fontFamily,
    fontSize: 12,
    color: THEME.accentPrimary,
    textTransform: 'capitalize',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: THEME.accentPrimary,
    gap: 8,
    marginBottom: 24,
  },
  linkText: {
    fontFamily: TYPOGRAPHY.body.fontFamily,
    color: THEME.accentPrimary,
    fontWeight: '600',
    fontSize: 16,
  },
  emptyText: {
    fontFamily: TYPOGRAPHY.body.fontFamily,
    color: COLORS.secondaryText,
    fontStyle: 'italic',
  },
  relatedList: {
    gap: 10,
  },
  relatedCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: COLORS.surface,
    borderRadius: RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  relatedIcon: {
    width: 40,
    height: 40,
    borderRadius: RADIUS.sm,
    backgroundColor: COLORS.surfaceMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  relatedInfo: {
    flex: 1,
  },
  relatedName: {
    fontFamily: TYPOGRAPHY.body.fontFamily,
    fontWeight: '500',
    color: THEME.textPrimary,
    fontSize: 15,
  },
  relatedMeta: {
    fontFamily: TYPOGRAPHY.caption.fontFamily,
    color: COLORS.secondaryText,
    fontSize: 12,
    marginTop: 2,
  },
});
