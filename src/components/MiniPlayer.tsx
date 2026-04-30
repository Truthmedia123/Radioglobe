import React from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Pause, Play, Radio, Waves } from 'lucide-react-native';
import { audioService } from '../services/audioService';
import { COLORS, RADIUS, TYPOGRAPHY } from '../constants/theme';
import { useNavigationStore } from '../store/navigationStore';
import { usePlayerStore } from '../store/playerStore';

export const MiniPlayer: React.FC = () => {
  const { currentStation, currentPodcastEpisode, isPlaying, isLoading } = usePlayerStore();
  const { setActiveTab } = useNavigationStore();
  const activeTitle = currentPodcastEpisode?.title || currentStation?.name || 'No station selected';
  const activeMeta = currentPodcastEpisode?.podcastTitle || currentStation?.country || 'Search radio and podcasts';
  const hasMedia = !!currentStation || !!currentPodcastEpisode;

  const handlePlayPause = async () => {
    if (!hasMedia) {
      setActiveTab(0);
      return;
    }

    if (isPlaying) {
      await audioService.pause();
    } else {
      await audioService.resume();
    }
  };

  return (
    <TouchableOpacity
      style={styles.container}
      activeOpacity={0.88}
      onPress={() => setActiveTab(hasMedia ? 1 : 0)}
    >
      <View style={styles.artwork}>
        {currentPodcastEpisode ? (
          <Waves size={22} color={COLORS.text} />
        ) : (
          <Radio size={22} color={COLORS.text} />
        )}
      </View>

      <View style={styles.copy}>
        <Text style={styles.title} numberOfLines={1}>{activeTitle}</Text>
        <Text style={styles.meta} numberOfLines={1}>{activeMeta}</Text>
      </View>

      <TouchableOpacity style={styles.control} onPress={handlePlayPause} activeOpacity={0.8}>
        {isLoading ? (
          <ActivityIndicator size="small" color={COLORS.black} />
        ) : isPlaying ? (
          <Pause size={18} color={COLORS.black} fill={COLORS.black} />
        ) : (
          <Play size={18} color={COLORS.black} fill={COLORS.black} />
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 16,
    marginBottom: 10,
    padding: 10,
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: RADIUS.lg,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  artwork: {
    width: 46,
    height: 46,
    borderRadius: RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.accent,
  },
  copy: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    ...TYPOGRAPHY.body,
    fontFamily: 'Inter_600SemiBold',
    fontSize: 14,
  },
  meta: {
    ...TYPOGRAPHY.caption,
    marginTop: 2,
  },
  control: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
  },
});
