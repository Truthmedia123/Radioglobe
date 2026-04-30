import React from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Clock3, CloudSun, Languages, Play, Radio, Search } from 'lucide-react-native';
import { CommuteCarousel } from '../components/CommuteCarousel';
import { LanguageImmersion } from '../components/LanguageImmersion';
import { PodcastCard } from '../components/PodcastCard';
import { WeatherWheel } from '../components/WeatherWheel';
import { searchStations, Station } from '../api/radioBrowser';
import { searchAllProviders } from '../services/podcast/searchOrchestrator';
import { PodcastSearchResult } from '../types/podcast';
import { audioService } from '../services/audioService';
import { COLORS, RADIUS, TYPOGRAPHY } from '../constants/theme';
import { useNavigationStore } from '../store/navigationStore';
import { usePlayerStore } from '../store/playerStore';
import { usePodcastStore } from '../store/podcastStore';

type UnifiedResult =
  | { type: 'radio'; data: Station }
  | { type: 'podcast'; data: PodcastSearchResult };

export const DiscoveryScreen: React.FC = () => {
  const [query, setQuery] = React.useState('');
  const [debouncedQuery, setDebouncedQuery] = React.useState('');
  const [results, setResults] = React.useState<UnifiedResult[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const { setCurrentStation } = usePlayerStore();
  const { setSelectedFeedUrl } = usePodcastStore();
  const { setActiveTab } = useNavigationStore();

  React.useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(query), 350);
    return () => clearTimeout(handler);
  }, [query]);

  React.useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        const [radioData, podcastData] = await Promise.all([
          searchStations(debouncedQuery, 16),
          searchAllProviders(debouncedQuery, 10),
        ]);

        setResults([
          ...radioData.map((data): UnifiedResult => ({ type: 'radio', data })),
          ...podcastData.map((data): UnifiedResult => ({ type: 'podcast', data })),
        ]);
      } catch (error) {
        console.error('Blended search error:', error);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery]);

  const handleRadioPress = (station: Station) => {
    setCurrentStation(station);
    audioService.play(station.url_resolved || station.url);
    setActiveTab(1);
  };

  const handlePodcastPress = (podcast: PodcastSearchResult) => {
    setSelectedFeedUrl(podcast.feedUrl);
    setActiveTab(3);
  };

  const renderResult = ({ item }: { item: UnifiedResult }) => {
    if (item.type === 'podcast') {
      const podcast = item.data;
      return (
        <View style={styles.resultBlock}>
          <Text style={styles.resultType}>Podcast</Text>
          <PodcastCard podcast={podcast} onPress={() => handlePodcastPress(podcast)} />
        </View>
      );
    }

    const station = item.data;
    return (
      <TouchableOpacity style={styles.stationResult} onPress={() => handleRadioPress(station)} activeOpacity={0.84}>
        <View style={styles.stationAvatar}>
          <Radio size={22} color={COLORS.text} />
        </View>
        <View style={styles.stationCopy}>
          <Text style={styles.stationName} numberOfLines={1}>{station.name}</Text>
          <Text style={styles.stationMeta} numberOfLines={1}>
            {[station.country, station.language].filter(Boolean).join('  /  ')}
          </Text>
        </View>
        <View style={styles.playPill}>
          <Play size={16} color={COLORS.black} fill={COLORS.black} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.searchShell}>
        <Search size={18} color={COLORS.secondaryText} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search radio, cities, podcasts"
          placeholderTextColor={COLORS.mutedText}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      {debouncedQuery.trim() ? (
        isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color={COLORS.primary} />
          </View>
        ) : (
          <FlatList
            data={results}
            keyExtractor={(item, index) => item.type === 'radio' ? item.data.stationuuid : `${item.data.feedUrl}-${index}`}
            renderItem={renderResult}
            contentContainerStyle={styles.resultsContent}
            keyboardShouldPersistTaps="handled"
            ListEmptyComponent={<Text style={styles.emptyText}>No stations or podcasts found</Text>}
          />
        )
      ) : (
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <View style={styles.heroCopy}>
              <Text style={styles.kicker}>RadioGlobe Explore</Text>
              <Text style={styles.title}>Tune into the world as it is happening.</Text>
              <Text style={styles.subtitle}>Search fast, then drift through stations by city rhythm, weather, and language.</Text>
            </View>
            <View style={styles.globe}>
              <View style={styles.globeRing} />
              <View style={styles.globeLine} />
              <View style={[styles.globeDot, styles.dotOne]} />
              <View style={[styles.globeDot, styles.dotTwo]} />
              <View style={[styles.globeDot, styles.dotThree]} />
            </View>
          </View>

          <View style={styles.modeGrid}>
            <View style={styles.modeCard}>
              <Clock3 size={20} color={COLORS.primary} />
              <Text style={styles.modeTitle}>Commute</Text>
              <Text style={styles.modeMeta}>Morning and evening cities</Text>
            </View>
            <View style={styles.modeCard}>
              <CloudSun size={20} color={COLORS.warning} />
              <Text style={styles.modeTitle}>Weather</Text>
              <Text style={styles.modeMeta}>Stations matched to mood</Text>
            </View>
            <View style={styles.modeCard}>
              <Languages size={20} color={COLORS.accent} />
              <Text style={styles.modeTitle}>Language</Text>
              <Text style={styles.modeMeta}>Immersion through live radio</Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>City Rhythm</Text>
              <Text style={styles.sectionMeta}>Live commute windows</Text>
            </View>
            <CommuteCarousel />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Weather Sync</Text>
              <Text style={styles.sectionMeta}>Use local conditions</Text>
            </View>
            <WeatherWheel />
          </View>

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Language Immersion</Text>
              <Text style={styles.sectionMeta}>Discover by voice and region</Text>
            </View>
            <LanguageImmersion />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  searchShell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 20,
    marginTop: 14,
    marginBottom: 12,
    paddingHorizontal: 14,
    height: 48,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  searchInput: {
    flex: 1,
    color: COLORS.text,
    fontSize: 15,
    fontFamily: 'Inter_400Regular',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  hero: {
    minHeight: 250,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: 22,
    overflow: 'hidden',
    flexDirection: 'row',
    alignItems: 'center',
  },
  heroCopy: {
    flex: 1,
    zIndex: 2,
  },
  kicker: {
    ...TYPOGRAPHY.data,
    color: COLORS.primary,
    marginBottom: 10,
    textTransform: 'uppercase',
  },
  title: {
    ...TYPOGRAPHY.display,
    fontSize: 34,
    lineHeight: 40,
  },
  subtitle: {
    ...TYPOGRAPHY.body,
    color: COLORS.secondaryText,
    fontSize: 14,
    lineHeight: 21,
    marginTop: 12,
  },
  globe: {
    width: 132,
    height: 132,
    borderRadius: 66,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
    backgroundColor: COLORS.accentSoft,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: -18,
  },
  globeRing: {
    position: 'absolute',
    width: 92,
    height: 132,
    borderRadius: 46,
    borderWidth: 1,
    borderColor: COLORS.primary,
    opacity: 0.65,
  },
  globeLine: {
    width: 126,
    height: 1,
    backgroundColor: COLORS.borderStrong,
  },
  globeDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.primary,
  },
  dotOne: {
    top: 34,
    left: 38,
  },
  dotTwo: {
    right: 32,
    top: 58,
    backgroundColor: COLORS.warning,
  },
  dotThree: {
    left: 58,
    bottom: 30,
    backgroundColor: COLORS.accent,
  },
  modeGrid: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 14,
  },
  modeCard: {
    flex: 1,
    minHeight: 112,
    padding: 14,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  modeTitle: {
    ...TYPOGRAPHY.h3,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    marginTop: 14,
  },
  modeMeta: {
    ...TYPOGRAPHY.caption,
    lineHeight: 16,
    marginTop: 4,
  },
  section: {
    marginTop: 22,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h2,
    fontSize: 23,
  },
  sectionMeta: {
    ...TYPOGRAPHY.caption,
    color: COLORS.mutedText,
  },
  resultsContent: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  resultBlock: {
    marginBottom: 14,
  },
  resultType: {
    ...TYPOGRAPHY.data,
    color: COLORS.mutedText,
    marginBottom: 6,
    textTransform: 'uppercase',
  },
  stationResult: {
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
  stationAvatar: {
    width: 50,
    height: 50,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
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
  playPill: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...TYPOGRAPHY.body,
    color: COLORS.secondaryText,
    textAlign: 'center',
    marginTop: 40,
  },
});
