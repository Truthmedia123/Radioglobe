import React from 'react';
import { FlatList, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Download, Heart, History, Play, Radio } from 'lucide-react-native';
import { audioService } from '../services/audioService';
import { COLORS, RADIUS, TYPOGRAPHY } from '../constants/theme';
import { useNavigationStore } from '../store/navigationStore';
import { usePlayerStore } from '../store/playerStore';
import { usePodcastStore } from '../store/podcastStore';

const MOCK_FAVOURITES = [
  { stationuuid: '1', name: 'BBC Radio 1', country: 'United Kingdom', language: 'English' },
  { stationuuid: '2', name: 'Radio France Internationale', country: 'France', language: 'French' },
  { stationuuid: '3', name: 'NHK World Radio Japan', country: 'Japan', language: 'Japanese' },
  { stationuuid: '4', name: 'Deutschlandfunk', country: 'Germany', language: 'German' },
  { stationuuid: '5', name: 'Radio Nacional de Espana', country: 'Spain', language: 'Spanish' },
  { stationuuid: '6', name: 'Radio Swiss Pop', country: 'Switzerland', language: 'Multiple' },
  { stationuuid: '7', name: 'KEXP 90.3 FM', country: 'United States', language: 'English' },
  { stationuuid: '8', name: 'Triple J', country: 'Australia', language: 'English' },
];

export const ArchiveScreen: React.FC = () => {
  const { currentStation, isPlaying, setCurrentStation } = usePlayerStore();
  const { setActiveTab } = useNavigationStore();
  const { episodeProgress, downloadedEpisodes, subscribedFeeds } = usePodcastStore();

  const continueListening = Object.values(episodeProgress)
    .sort((a, b) => new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime())
    .slice(0, 4);

  const downloadedCount = Object.values(downloadedEpisodes).filter((episode) => episode.status === 'complete').length;

  const handleStationPress = async (station: any) => {
    setCurrentStation({
      stationuuid: station.stationuuid,
      name: station.name,
      url: '',
      url_resolved: 'https://stream.example.com',
      homepage: '',
      favicon: '',
      tags: '',
      country: station.country,
      countrycode: '',
      state: '',
      language: station.language,
      votes: 0,
      lastcheckok: 1,
      lastchecktime: '',
      lastcheckoktime: '',
      lastlocalchecktime: '',
      clicktimestamp: '',
      clickcount: 0,
      clicktrend: 0,
      ssl_error: 0,
      geo_lat: null,
      geo_long: null,
      has_extended_info: false,
    });
    setActiveTab(1);
  };

  const playEpisode = async (progress: any) => {
    usePlayerStore.getState().setCurrentPodcastEpisode(progress.episode);
    await audioService.play(progress.episode.audioUrl);
    await audioService.seekTo(progress.positionMillis);
    setActiveTab(1);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.kicker}>Library</Text>
          <Text style={styles.title}>Saved sounds</Text>
        </View>

        <View style={styles.statsRow}>
          <StatCard label="Stations" value={MOCK_FAVOURITES.length.toString()} Icon={Heart} color={COLORS.primary} />
          <StatCard label="Podcasts" value={subscribedFeeds.length.toString()} Icon={Radio} color={COLORS.accent} />
          <StatCard label="Downloads" value={downloadedCount.toString()} Icon={Download} color={COLORS.warning} />
        </View>

        {continueListening.length > 0 && (
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Continue Listening</Text>
              <History size={18} color={COLORS.secondaryText} />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.continueList}>
              {continueListening.map((progress) => (
                <TouchableOpacity key={progress.episode.guid} style={styles.continueCard} onPress={() => playEpisode(progress)} activeOpacity={0.84}>
                  <View style={styles.episodeArt}>
                    <Play size={24} color={COLORS.black} fill={COLORS.black} />
                  </View>
                  <Text style={styles.continueTitle} numberOfLines={2}>{progress.episode.title}</Text>
                  <Text style={styles.continueMeta} numberOfLines={1}>{progress.episode.podcastTitle}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Favorite Stations</Text>
            <Text style={styles.sectionCount}>{MOCK_FAVOURITES.length}</Text>
          </View>
          <FlatList
            data={MOCK_FAVOURITES}
            scrollEnabled={false}
            keyExtractor={(item) => item.stationuuid}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[styles.stationItem, currentStation?.stationuuid === item.stationuuid && styles.activeStationItem]}
                onPress={() => handleStationPress(item)}
                activeOpacity={0.84}
              >
                <View style={[styles.stationIcon, currentStation?.stationuuid === item.stationuuid && styles.stationIconActive]}>
                  <Radio size={20} color={currentStation?.stationuuid === item.stationuuid ? COLORS.black : COLORS.secondaryText} />
                </View>
                <View style={styles.stationCopy}>
                  <Text style={styles.stationName} numberOfLines={1}>{item.name}</Text>
                  <Text style={styles.stationMeta}>{item.country}  /  {item.language}</Text>
                </View>
                {currentStation?.stationuuid === item.stationuuid && isPlaying ? (
                  <View style={styles.livePill}>
                    <Text style={styles.liveText}>Live</Text>
                  </View>
                ) : (
                  <Play size={18} color={COLORS.secondaryText} />
                )}
              </TouchableOpacity>
            )}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const StatCard = ({
  label,
  value,
  Icon,
  color,
}: {
  label: string;
  value: string;
  Icon: React.ComponentType<{ size: number; color: string }>;
  color: string;
}) => (
  <View style={styles.statCard}>
    <Icon size={18} color={color} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statLabel}>{label}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 28,
  },
  header: {
    marginBottom: 18,
  },
  kicker: {
    ...TYPOGRAPHY.data,
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  title: {
    ...TYPOGRAPHY.h1,
    marginTop: 2,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  statCard: {
    flex: 1,
    minHeight: 104,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
    justifyContent: 'space-between',
  },
  statValue: {
    ...TYPOGRAPHY.h2,
    fontSize: 28,
  },
  statLabel: {
    ...TYPOGRAPHY.caption,
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h2,
    fontSize: 23,
  },
  sectionCount: {
    ...TYPOGRAPHY.data,
    color: COLORS.mutedText,
  },
  continueList: {
    gap: 10,
    paddingRight: 20,
  },
  continueCard: {
    width: 174,
    minHeight: 166,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 14,
  },
  episodeArt: {
    width: 56,
    height: 56,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  continueTitle: {
    ...TYPOGRAPHY.body,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    lineHeight: 19,
  },
  continueMeta: {
    ...TYPOGRAPHY.caption,
    marginTop: 6,
  },
  stationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 10,
  },
  activeStationItem: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primarySoft,
  },
  stationIcon: {
    width: 46,
    height: 46,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stationIconActive: {
    backgroundColor: COLORS.primary,
  },
  stationCopy: {
    flex: 1,
    minWidth: 0,
  },
  stationName: {
    ...TYPOGRAPHY.body,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 15,
  },
  stationMeta: {
    ...TYPOGRAPHY.caption,
    marginTop: 4,
  },
  livePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.primary,
  },
  liveText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.black,
    fontFamily: 'Inter_600SemiBold',
  },
});
