import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { Podcast, Search } from 'lucide-react-native';
import { PodcastCard } from '../components/PodcastCard';
import { audioService } from '../services/audioService';
import { searchAllProviders } from '../services/podcast/searchOrchestrator';
import { COLORS, RADIUS, TYPOGRAPHY } from '../constants/theme';
import { PodcastSearchResult } from '../types/podcast';
import { usePlayerStore } from '../store/playerStore';
import { usePodcastStore } from '../store/podcastStore';
import { PodcastDetailScreen } from './PodcastDetailScreen';

export const PodcastScreen: React.FC = () => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<PodcastSearchResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const { selectedFeedUrl, setSelectedFeedUrl, episodeProgress, subscribedFeeds } = usePodcastStore();
  const { setCurrentPodcastEpisode } = usePlayerStore();

  const continueListening = Object.values(episodeProgress)
    .filter((progress) => progress.positionMillis > 0 && progress.positionMillis < progress.durationMillis * 0.9)
    .sort((a, b) => new Date(b.lastPlayed).getTime() - new Date(a.lastPlayed).getTime())
    .slice(0, 6);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(query), 350);
    return () => clearTimeout(handler);
  }, [query]);

  useEffect(() => {
    const performSearch = async () => {
      if (!debouncedQuery.trim()) {
        setResults([]);
        return;
      }

      setIsLoading(true);
      try {
        setResults(await searchAllProviders(debouncedQuery));
      } catch (error) {
        console.error('Search failed', error);
      } finally {
        setIsLoading(false);
      }
    };

    performSearch();
  }, [debouncedQuery]);

  const handleContinueListening = async (progress: any) => {
    setCurrentPodcastEpisode(progress.episode);
    await audioService.play(progress.episode.audioUrl);
    await audioService.seekTo(progress.positionMillis);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.kicker}>Podcasts</Text>
        <Text style={styles.title}>Shows and episodes</Text>
        <View style={styles.searchShell}>
          <Search size={18} color={COLORS.secondaryText} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search podcasts"
            placeholderTextColor={COLORS.mutedText}
            value={query}
            onChangeText={setQuery}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      </View>

      {isLoading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : results.length > 0 ? (
        <FlatList
          data={results}
          keyExtractor={(item) => item.feedUrl || `${item.title}-${item.source}`}
          renderItem={({ item }) => <PodcastCard podcast={item} onPress={() => setSelectedFeedUrl(item.feedUrl)} />}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          ListHeaderComponent={<Text style={styles.resultLabel}>Search Results</Text>}
        />
      ) : debouncedQuery.trim() !== '' ? (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No podcasts found</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.heroCard}>
            <View style={styles.heroIcon}>
              <Podcast size={34} color={COLORS.black} />
            </View>
            <View style={styles.heroCopy}>
              <Text style={styles.heroTitle}>Your audio queue, rebuilt for listening.</Text>
              <Text style={styles.heroMeta}>{subscribedFeeds.length} subscriptions saved</Text>
            </View>
          </View>

          {continueListening.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Continue Listening</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.continueRow}>
                {continueListening.map((progress) => (
                  <TouchableOpacity
                    key={progress.episode.guid}
                    style={styles.continueCard}
                    onPress={() => handleContinueListening(progress)}
                    activeOpacity={0.84}
                  >
                    <Image
                      source={progress.episode.artworkUrl ? { uri: progress.episode.artworkUrl } : undefined}
                      style={styles.continueArtwork}
                      contentFit="cover"
                    />
                    <Text style={styles.continueTitle} numberOfLines={2}>{progress.episode.title}</Text>
                    <Text style={styles.continuePodcast} numberOfLines={1}>{progress.episode.podcastTitle}</Text>
                    <View style={styles.progressBarContainer}>
                      <View style={[styles.progressBar, { width: `${Math.min(100, (progress.positionMillis / progress.durationMillis) * 100)}%` }]} />
                    </View>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Subscriptions</Text>
            {subscribedFeeds.length > 0 ? (
              subscribedFeeds.map((feedUrl) => (
                <TouchableOpacity key={feedUrl} style={styles.feedRow} onPress={() => setSelectedFeedUrl(feedUrl)} activeOpacity={0.84}>
                  <View style={styles.feedIcon}>
                    <Podcast size={20} color={COLORS.primary} />
                  </View>
                  <Text style={styles.feedText} numberOfLines={1}>{feedUrl}</Text>
                </TouchableOpacity>
              ))
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>No subscriptions yet</Text>
                <Text style={styles.emptyText}>Search for a show and save it to build your podcast shelf.</Text>
              </View>
            )}
          </View>
        </ScrollView>
      )}

      <Modal visible={!!selectedFeedUrl} animationType="slide" presentationStyle="fullScreen" onRequestClose={() => setSelectedFeedUrl(null)}>
        {selectedFeedUrl && <PodcastDetailScreen feedUrl={selectedFeedUrl} onClose={() => setSelectedFeedUrl(null)} />}
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 14,
    paddingBottom: 14,
  },
  kicker: {
    ...TYPOGRAPHY.data,
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  title: {
    ...TYPOGRAPHY.h1,
    marginTop: 2,
    marginBottom: 16,
  },
  searchShell: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    height: 48,
    borderRadius: RADIUS.round,
    paddingHorizontal: 14,
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
  content: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  heroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    minHeight: 132,
    padding: 18,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  heroIcon: {
    width: 72,
    height: 72,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  heroCopy: {
    flex: 1,
  },
  heroTitle: {
    ...TYPOGRAPHY.h2,
    fontSize: 24,
    lineHeight: 29,
  },
  heroMeta: {
    ...TYPOGRAPHY.caption,
    marginTop: 8,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h2,
    fontSize: 23,
    marginBottom: 12,
  },
  continueRow: {
    gap: 10,
    paddingRight: 20,
  },
  continueCard: {
    width: 166,
    minHeight: 218,
    padding: 12,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  continueArtwork: {
    width: '100%',
    height: 118,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surfaceMuted,
    marginBottom: 10,
  },
  continueTitle: {
    ...TYPOGRAPHY.body,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
    lineHeight: 19,
  },
  continuePodcast: {
    ...TYPOGRAPHY.caption,
    marginTop: 4,
  },
  progressBarContainer: {
    height: 3,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.surfaceMuted,
    overflow: 'hidden',
    marginTop: 10,
  },
  progressBar: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  feedRow: {
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
  feedIcon: {
    width: 44,
    height: 44,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.primarySoft,
    alignItems: 'center',
    justifyContent: 'center',
  },
  feedText: {
    ...TYPOGRAPHY.body,
    flex: 1,
    color: COLORS.secondaryText,
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 28,
  },
  resultLabel: {
    ...TYPOGRAPHY.data,
    color: COLORS.mutedText,
    textTransform: 'uppercase',
    marginBottom: 10,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  emptyState: {
    padding: 18,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  emptyTitle: {
    ...TYPOGRAPHY.body,
    fontFamily: 'Inter_600SemiBold',
    marginBottom: 6,
  },
  emptyText: {
    ...TYPOGRAPHY.body,
    color: COLORS.secondaryText,
    textAlign: 'center',
  },
});
