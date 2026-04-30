import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { CheckCircle2, Download, Heart, HeartOff, Play, XCircle } from 'lucide-react-native';
import { audioService } from '../services/audioService';
import { COLORS, RADIUS, TYPOGRAPHY } from '../constants/theme';
import { PodcastEpisode } from '../types/podcast';
import { usePlayerStore } from '../store/playerStore';
import { usePodcastStore } from '../store/podcastStore';

interface PodcastDetailScreenProps {
  feedUrl: string;
  onClose: () => void;
}

export const PodcastDetailScreen: React.FC<PodcastDetailScreenProps> = ({ feedUrl, onClose }) => {
  const {
    subscribedFeeds,
    episodes,
    loading,
    subscribe,
    unsubscribe,
    fetchEpisodes,
    downloadEpisode,
    removeDownload,
    getDownloadPath,
    downloadedEpisodes,
  } = usePodcastStore();
  const { setCurrentPodcastEpisode } = usePlayerStore();
  const [localEpisodes, setLocalEpisodes] = useState<PodcastEpisode[]>([]);
  const [podcastTitle, setPodcastTitle] = useState('');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const isSubscribed = subscribedFeeds.includes(feedUrl);

  useEffect(() => {
    const loadEpisodes = async () => {
      const stored = episodes[feedUrl];
      if (stored && stored.length > 0) {
        setLocalEpisodes(stored);
        setPodcastTitle(stored[0]?.podcastTitle || '');
        return;
      }

      const fetched = await fetchEpisodes(feedUrl);
      setLocalEpisodes(fetched);
      setPodcastTitle(fetched[0]?.podcastTitle || '');
    };

    loadEpisodes();
  }, [episodes, feedUrl, fetchEpisodes]);

  const handleSubscribe = async () => {
    if (isSubscribed) {
      await unsubscribe(feedUrl);
    } else {
      await subscribe(feedUrl);
    }
  };

  const handlePlayEpisode = async (episode: PodcastEpisode) => {
    setCurrentPodcastEpisode(episode);
    const localPath = getDownloadPath(episode.guid);
    await audioService.play(localPath || episode.audioUrl);
  };

  const handleDownloadToggle = async (episode: PodcastEpisode) => {
    const downloadInfo = downloadedEpisodes[episode.guid];
    if (downloadInfo?.status === 'complete') {
      await removeDownload(episode.guid);
      return;
    }

    await downloadEpisode(episode);
    const newInfo = usePodcastStore.getState().downloadedEpisodes[episode.guid];
    if (newInfo?.status === 'error') {
      setToastMessage('Download failed. Tap download to retry.');
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  const formatDuration = (seconds: number) => {
    if (!seconds) return '--:--';
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return hrs > 0
      ? `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
      : `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return 'Unknown date';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderEpisodeItem = ({ item }: { item: PodcastEpisode }) => {
    const downloadInfo = downloadedEpisodes[item.guid];
    const isDownloading = downloadInfo?.status === 'downloading';
    const isDownloaded = downloadInfo?.status === 'complete';
    const hasError = downloadInfo?.status === 'error';

    return (
      <View style={styles.episodeItem}>
        <TouchableOpacity style={styles.episodeCopy} onPress={() => handlePlayEpisode(item)} activeOpacity={0.84}>
          <Text style={styles.episodeTitle} numberOfLines={2}>{item.title}</Text>
          <Text style={styles.episodeMeta}>
            {formatDate(item.publishDate)}  /  {formatDuration(item.durationSeconds)}
          </Text>
          <Text style={styles.episodeDescription} numberOfLines={2}>{item.description}</Text>
        </TouchableOpacity>

        <View style={styles.episodeActions}>
          <TouchableOpacity
            style={styles.smallAction}
            onPress={() => handleDownloadToggle(item)}
            disabled={isDownloading}
            activeOpacity={0.82}
          >
            {isDownloading ? (
              <ActivityIndicator size="small" color={COLORS.primary} />
            ) : isDownloaded ? (
              <CheckCircle2 size={22} color={COLORS.primary} />
            ) : hasError ? (
              <XCircle size={22} color={COLORS.error} />
            ) : (
              <Download size={22} color={COLORS.secondaryText} />
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.playButton} onPress={() => handlePlayEpisode(item)} activeOpacity={0.82}>
            <Play size={22} color={COLORS.black} fill={COLORS.black} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.roundButton}>
          <XCircle size={24} color={COLORS.text} />
        </TouchableOpacity>
        <View style={styles.headerCopy}>
          <Text style={styles.kicker}>Podcast</Text>
          <Text style={styles.headerTitle} numberOfLines={1}>{podcastTitle || 'Loading show'}</Text>
        </View>
        <TouchableOpacity onPress={handleSubscribe} style={[styles.roundButton, isSubscribed && styles.subscribedButton]}>
          {isSubscribed ? <HeartOff size={22} color={COLORS.black} /> : <Heart size={22} color={COLORS.text} />}
        </TouchableOpacity>
      </View>

      {toastMessage && (
        <View style={styles.toastContainer}>
          <Text style={styles.toastText}>{toastMessage}</Text>
        </View>
      )}

      {loading && localEpisodes.length === 0 ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : localEpisodes.length > 0 ? (
        <FlatList
          data={localEpisodes}
          renderItem={renderEpisodeItem}
          keyExtractor={(item) => item.guid}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={
            <View style={styles.showHero}>
              <Text style={styles.showTitle}>{podcastTitle || 'Episodes'}</Text>
              <Text style={styles.showMeta}>{localEpisodes.length} episodes loaded</Text>
            </View>
          }
        />
      ) : (
        <View style={styles.centerContainer}>
          <Text style={styles.emptyText}>No episodes available</Text>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  roundButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  subscribedButton: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  headerCopy: {
    flex: 1,
    minWidth: 0,
  },
  kicker: {
    ...TYPOGRAPHY.data,
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  headerTitle: {
    ...TYPOGRAPHY.body,
    fontFamily: 'Inter_600SemiBold',
    marginTop: 2,
  },
  listContent: {
    padding: 20,
    paddingBottom: 34,
  },
  showHero: {
    padding: 20,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 18,
  },
  showTitle: {
    ...TYPOGRAPHY.h1,
    fontSize: 30,
    lineHeight: 35,
  },
  showMeta: {
    ...TYPOGRAPHY.caption,
    marginTop: 8,
  },
  episodeItem: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: 12,
  },
  episodeCopy: {
    flex: 1,
    minWidth: 0,
  },
  episodeTitle: {
    ...TYPOGRAPHY.body,
    fontFamily: 'Inter_600SemiBold',
    lineHeight: 22,
  },
  episodeMeta: {
    ...TYPOGRAPHY.data,
    color: COLORS.mutedText,
    marginTop: 6,
  },
  episodeDescription: {
    ...TYPOGRAPHY.caption,
    lineHeight: 18,
    marginTop: 8,
  },
  episodeActions: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  smallAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceMuted,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    ...TYPOGRAPHY.body,
    color: COLORS.secondaryText,
  },
  toastContainer: {
    backgroundColor: COLORS.primarySoft,
    borderColor: COLORS.primary,
    borderWidth: 1,
    padding: 12,
    marginHorizontal: 20,
    marginTop: 12,
    borderRadius: RADIUS.md,
    alignItems: 'center',
  },
  toastText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    fontFamily: 'Inter_600SemiBold',
  },
});
