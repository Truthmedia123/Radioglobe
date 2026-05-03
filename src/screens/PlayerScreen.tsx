import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Bell, Bug, DownloadCloud, Mic2, Pause, Play, Radio, RotateCcw, RotateCw, Settings2, Share2, Users, Volume2, Info } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { AUDIO_EVENTS, audioService } from '../services/audioService';
import { AlarmModal } from '../components/AlarmModal';
import { BufferBar } from '../components/BufferBar';
import { ClockFace } from '../components/ClockFace';
import { EQModal } from '../components/EQModal';
import { QualityIndicator } from '../components/QualityIndicator';
import { ScheduleRecordingModal } from '../components/ScheduleRecordingModal';
import { StationInfoModal } from '../components/StationInfoModal';
import { SleepTimerButton } from '../components/SleepTimerButton';
import { SongIdentifier } from '../components/SongIdentifier';
import { fetchTopStations, Station } from '../api/radioBrowser';
import { adAwareService } from '../services/adAwareService';
import { foundSoundService } from '../services/foundSoundService';
import { listeningRoomService } from '../services/listeningRoomService';
import { useHaptics } from '../services/hapticService';
import { useNetworkMonitor } from '../services/networkMonitor';
import { COLORS, RADIUS, TYPOGRAPHY } from '../constants/theme';
import { useAlarmStore } from '../store/alarmStore';
import { useEQStore } from '../store/eqStore';
import { useNavigationStore } from '../store/navigationStore';
import { usePlayerStore } from '../store/playerStore';
import { usePodcastStore } from '../store/podcastStore';
import { useRecordingStore } from '../store/recordingStore';
import { useStationTime } from '../hooks/useStationTime';
import { DevConnectScreen } from './DevConnectScreen';

export const PlayerScreen: React.FC = () => {
  const { currentStation, currentPodcastEpisode, isPlaying, isLoading, setCurrentStation } = usePlayerStore();
  const { setActiveTab } = useNavigationStore();
  const { isRecordingModalOpen, setRecordingModalOpen } = useRecordingStore();
  const { isAlarmModalOpen, setAlarmModalOpen } = useAlarmStore();
  const { isEQModalOpen, setEQModalOpen } = useEQStore();
  const { stationChange, recordingToggle, soundClipCaptured, adBreakDetected } = useHaptics();

  const [stations, setStations] = useState<Station[]>([]);
  const [loadingStations, setLoadingStations] = useState(true);
  const [isRecordingClip, setIsRecordingClip] = useState(false);
  const [adBreakActive, setAdBreakActive] = useState(false);
  const [isDevConnectVisible, setIsDevConnectVisible] = useState(false);
  const [isStationInfoOpen, setIsStationInfoOpen] = useState(false);
  const [showResumeToast, setShowResumeToast] = useState(false);
  const [resumePosition, setResumePosition] = useState(0);
  const [playbackPosition, setPlaybackPosition] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);

  useNetworkMonitor();
  const stationTime = useStationTime(currentStation?.countrycode);

  useEffect(() => {
    loadStations();
    audioService.init();

    const onBufferUpdate = (data: any) => {
      if (data.positionMillis !== undefined) setPlaybackPosition(data.positionMillis);
      if (data.durationMillis !== undefined) setPlaybackDuration(data.durationMillis);
    };

    audioService.on(AUDIO_EVENTS.BUFFER_UPDATE, onBufferUpdate);
    return () => {
      audioService.off(AUDIO_EVENTS.BUFFER_UPDATE, onBufferUpdate);
    };
  }, []);

  useEffect(() => {
    if (!currentPodcastEpisode) {
      setShowResumeToast(false);
      return;
    }

    const progress = usePodcastStore.getState().getProgress(currentPodcastEpisode.guid);
    if (progress && progress.positionMillis > 0 && progress.positionMillis < progress.durationMillis * 0.95) {
      setResumePosition(progress.positionMillis);
      setShowResumeToast(true);
      const timer = setTimeout(() => setShowResumeToast(false), 10000);
      return () => clearTimeout(timer);
    }

    setShowResumeToast(false);
  }, [currentPodcastEpisode]);

  const loadStations = async () => {
    setLoadingStations(true);
    const data = await fetchTopStations(12);
    setStations(data);
    setLoadingStations(false);
  };

  const playStation = async (station: Station) => {
    if (currentStation?.stationuuid === station.stationuuid && isPlaying) {
      await audioService.pause();
      return;
    }

    setCurrentStation(station);
    stationChange();
    await audioService.play(station.url_resolved || station.url);
  };

  const handlePlayPause = async () => {
    if (isPlaying) {
      await audioService.pause();
    } else if (currentStation || currentPodcastEpisode) {
      await audioService.resume();
    } else if (stations[0]) {
      await playStation(stations[0]);
    } else {
      setActiveTab(0);
    }
  };

  const handleFoundSoundPress = async () => {
    if (!currentStation || isRecordingClip) return;
    recordingToggle();
    setIsRecordingClip(true);

    try {
      const success = await foundSoundService.startRecording();
      if (success) {
        setTimeout(async () => {
          const clip = await foundSoundService.stopRecording();
          if (clip) soundClipCaptured();
          setIsRecordingClip(false);
        }, 30000);
      } else {
        setIsRecordingClip(false);
      }
    } catch (error) {
      console.error('Failed to record clip:', error);
      setIsRecordingClip(false);
    }
  };

  const handleAdBreakPress = () => {
    if (!currentStation) return;

    if (adBreakActive) {
      adAwareService.stopAdBreak();
      setAdBreakActive(false);
      return;
    }

    adBreakDetected();
    adAwareService.startManualAdBreak(currentStation, 2);
    setAdBreakActive(true);
    setTimeout(() => {
      adAwareService.stopAdBreak();
      setAdBreakActive(false);
    }, 120000);
  };

  const handleListeningRoomPress = async () => {
    if (!currentStation) return;
    const rooms = await listeningRoomService.getAvailableRooms();
    if (rooms.length === 0) {
      await listeningRoomService.createRoom(`Room for ${currentStation.name}`, currentStation);
    }
  };

  const formatTime = (millis: number) => {
    if (!millis) return '0:00';
    const totalSeconds = Math.floor(millis / 1000);
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercent = playbackDuration > 0 ? Math.min(100, (playbackPosition / playbackDuration) * 100) : 0;
  const activeTitle = currentPodcastEpisode?.title || currentStation?.name || 'Choose something to play';
  const activeMeta = currentPodcastEpisode?.podcastTitle || [currentStation?.country, currentStation?.language].filter(Boolean).join('  /  ') || 'Explore stations and podcasts';

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topBar}>
          <View>
            <Text style={styles.kicker}>Now Playing</Text>
            <Text style={styles.screenTitle}>RadioGlobe</Text>
          </View>
          <TouchableOpacity style={styles.iconButton} onPress={() => setIsDevConnectVisible(true)}>
            <Bug size={20} color={COLORS.secondaryText} />
          </TouchableOpacity>
        </View>

        <View style={styles.nowPlaying}>
          <View style={styles.artwork}>
            <View style={styles.artworkOrbit} />
            <Radio size={54} color={COLORS.text} />
          </View>

          <View style={styles.activeTitleContainer}>
            <Text style={styles.activeTitle} numberOfLines={3}>{activeTitle}</Text>
            {!currentPodcastEpisode && currentStation && (
              <TouchableOpacity onPress={() => setIsStationInfoOpen(true)} accessibilityLabel="View station info" style={styles.infoIcon}>
                <Info size={22} color={COLORS.secondaryText} strokeWidth={2} />
              </TouchableOpacity>
            )}
          </View>
          <Text style={styles.activeMeta} numberOfLines={1}>{activeMeta}</Text>

          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${progressPercent}%` }]} />
          </View>
          <View style={styles.progressLabels}>
            <Text style={styles.progressLabel}>{formatTime(playbackPosition)}</Text>
            <Text style={styles.progressLabel}>{currentPodcastEpisode ? formatTime(playbackDuration) : 'Live'}</Text>
          </View>

          <View style={styles.controls}>
            {currentPodcastEpisode && (
              <TouchableOpacity style={styles.secondaryControl} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); audioService.skipBackward(); }}>
                <RotateCcw size={22} color={COLORS.text} />
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.playButton} onPress={handlePlayPause} disabled={isLoading}>
              {isLoading ? (
                <ActivityIndicator color={COLORS.black} />
              ) : isPlaying ? (
                <Pause size={30} color={COLORS.black} fill={COLORS.black} />
              ) : (
                <Play size={30} color={COLORS.black} fill={COLORS.black} />
              )}
            </TouchableOpacity>
            {currentPodcastEpisode && (
              <TouchableOpacity style={styles.secondaryControl} onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); audioService.skipForward(); }}>
                <RotateCw size={22} color={COLORS.text} />
              </TouchableOpacity>
            )}
          </View>

          {showResumeToast && currentPodcastEpisode && (
            <View style={styles.resumeToast}>
              <Text style={styles.resumeText}>Resume from {formatTime(resumePosition)}</Text>
              <View style={styles.resumeActions}>
                <TouchableOpacity style={styles.resumeButton} onPress={() => { audioService.seekTo(resumePosition); setShowResumeToast(false); }}>
                  <Text style={styles.resumeButtonText}>Resume</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.resumeGhost} onPress={() => { audioService.seekTo(0); setShowResumeToast(false); }}>
                  <Text style={styles.resumeGhostText}>Restart</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>

        <BufferBar />

        {!currentPodcastEpisode && currentStation && (
          <View style={styles.stationPanel}>
            <ClockFace timeInfo={stationTime} size={84} showDigital={false} />
            <View style={styles.stationPanelCopy}>
              <Text style={styles.panelLabel}>Station local time</Text>
              <Text style={styles.panelTitle}>{stationTime.isUnknown ? 'Unknown timezone' : stationTime.timeString}</Text>
              <Text style={styles.panelMeta}>{currentStation.countrycode ? `${currentStation.countrycode}  /  ${stationTime.timeZone}` : 'Location unavailable'}</Text>
              <QualityIndicator />
            </View>
          </View>
        )}

        <View style={styles.toolGrid}>
          <ToolButton label="Record" Icon={Mic2} onPress={() => setRecordingModalOpen(true)} />
          <ToolButton label="Alarm" Icon={Bell} onPress={() => setAlarmModalOpen(true)} />
          <ToolButton label="EQ" Icon={Settings2} onPress={() => setEQModalOpen(true)} />
          <ToolButton label={adBreakActive ? 'Ad break' : 'Ad aware'} Icon={Volume2} onPress={handleAdBreakPress} disabled={!currentStation} active={adBreakActive} />
          <ToolButton label={isRecordingClip ? 'Capturing' : 'Found sound'} Icon={DownloadCloud} onPress={handleFoundSoundPress} disabled={!currentStation || isRecordingClip} active={isRecordingClip} />
          <ToolButton label="Rooms" Icon={Users} onPress={handleListeningRoomPress} disabled={!currentStation} />
          <ToolButton label="Share" Icon={Share2} onPress={() => console.log('Share action')} disabled={!currentStation} />
          <View style={styles.sleepWrap}>
            <SleepTimerButton />
          </View>
        </View>

        {!currentPodcastEpisode && <SongIdentifier />}

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Trending Stations</Text>
          <TouchableOpacity onPress={() => setActiveTab(0)}>
            <Text style={styles.sectionAction}>Explore</Text>
          </TouchableOpacity>
        </View>

        {loadingStations ? (
          <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
        ) : (
          stations.map((station) => (
            <TouchableOpacity
              key={station.stationuuid}
              style={[styles.stationItem, currentStation?.stationuuid === station.stationuuid && styles.activeStationItem]}
              onPress={() => playStation(station)}
              activeOpacity={0.84}
            >
              <View style={styles.stationIcon}>
                <Radio size={20} color={currentStation?.stationuuid === station.stationuuid ? COLORS.black : COLORS.secondaryText} />
              </View>
              <View style={styles.stationCopy}>
                <Text style={styles.stationName} numberOfLines={1}>{station.name}</Text>
                <Text style={styles.stationMeta} numberOfLines={1}>
                  {[station.country, station.language].filter(Boolean).join('  /  ')}
                </Text>
              </View>
              {currentStation?.stationuuid === station.stationuuid && isPlaying ? (
                <Pause size={18} color={COLORS.primary} />
              ) : (
                <Play size={18} color={COLORS.secondaryText} />
              )}
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      <ScheduleRecordingModal
        visible={isRecordingModalOpen}
        onClose={() => setRecordingModalOpen(false)}
        station={currentStation || undefined}
      />
      <AlarmModal
        visible={isAlarmModalOpen}
        onClose={() => setAlarmModalOpen(false)}
        station={currentStation || undefined}
      />
      <EQModal visible={isEQModalOpen} onClose={() => setEQModalOpen(false)} />
      <DevConnectScreen visible={isDevConnectVisible} onClose={() => setIsDevConnectVisible(false)} />
      <StationInfoModal visible={isStationInfoOpen} onClose={() => setIsStationInfoOpen(false)} station={currentStation} />
    </SafeAreaView>
  );
};

const ToolButton = ({
  label,
  Icon,
  onPress,
  disabled,
  active,
}: {
  label: string;
  Icon: React.ComponentType<{ size: number; color: string }>;
  onPress: () => void;
  disabled?: boolean;
  active?: boolean;
}) => (
  <TouchableOpacity
    style={[styles.toolButton, active && styles.toolButtonActive, disabled && styles.toolButtonDisabled]}
    onPress={onPress}
    disabled={disabled}
    activeOpacity={0.82}
  >
    <Icon size={20} color={active ? COLORS.black : disabled ? COLORS.mutedText : COLORS.text} />
    <Text style={[styles.toolLabel, active && styles.toolLabelActive, disabled && styles.toolLabelDisabled]} numberOfLines={1}>{label}</Text>
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 28,
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  kicker: {
    ...TYPOGRAPHY.data,
    textTransform: 'uppercase',
    color: COLORS.primary,
  },
  screenTitle: {
    ...TYPOGRAPHY.h1,
    marginTop: 2,
  },
  iconButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  nowPlaying: {
    alignItems: 'center',
    padding: 22,
    borderRadius: RADIUS.xl,
    backgroundColor: COLORS.surfaceElevated,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  artwork: {
    width: 190,
    height: 190,
    borderRadius: 32,
    backgroundColor: COLORS.accent,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    marginBottom: 22,
  },
  artworkOrbit: {
    position: 'absolute',
    width: 142,
    height: 142,
    borderRadius: 71,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.34)',
  },
  activeTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    width: '100%',
    paddingHorizontal: 10,
  },
  infoIcon: {
    padding: 4,
  },
  activeTitle: {
    ...TYPOGRAPHY.h1,
    fontSize: 30,
    lineHeight: 35,
    textAlign: 'center',
  },
  activeMeta: {
    ...TYPOGRAPHY.body,
    color: COLORS.secondaryText,
    marginTop: 8,
    textAlign: 'center',
  },
  progressTrack: {
    width: '100%',
    height: 5,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.surfaceMuted,
    marginTop: 24,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
  },
  progressLabels: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  progressLabel: {
    ...TYPOGRAPHY.data,
    color: COLORS.mutedText,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 18,
    marginTop: 22,
  },
  playButton: {
    width: 74,
    height: 74,
    borderRadius: 37,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryControl: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.surfaceMuted,
  },
  resumeToast: {
    width: '100%',
    marginTop: 18,
    padding: 14,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.primarySoft,
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  resumeText: {
    ...TYPOGRAPHY.body,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  },
  resumeActions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginTop: 12,
  },
  resumeButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.round,
    backgroundColor: COLORS.primary,
  },
  resumeButtonText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.black,
    fontFamily: 'Inter_600SemiBold',
  },
  resumeGhost: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: RADIUS.round,
    borderWidth: 1,
    borderColor: COLORS.borderStrong,
  },
  resumeGhostText: {
    ...TYPOGRAPHY.caption,
    color: COLORS.text,
    fontFamily: 'Inter_600SemiBold',
  },
  stationPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: RADIUS.lg,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  stationPanelCopy: {
    flex: 1,
  },
  panelLabel: {
    ...TYPOGRAPHY.data,
    color: COLORS.mutedText,
    textTransform: 'uppercase',
  },
  panelTitle: {
    ...TYPOGRAPHY.h2,
    fontSize: 24,
    marginTop: 4,
  },
  panelMeta: {
    ...TYPOGRAPHY.caption,
    marginBottom: 8,
  },
  toolGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 16,
  },
  toolButton: {
    width: '23%',
    minWidth: 78,
    height: 74,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  toolButtonActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  toolButtonDisabled: {
    opacity: 0.45,
  },
  toolLabel: {
    ...TYPOGRAPHY.caption,
    color: COLORS.secondaryText,
    marginTop: 7,
    textAlign: 'center',
  },
  toolLabelActive: {
    color: COLORS.black,
    fontFamily: 'Inter_600SemiBold',
  },
  toolLabelDisabled: {
    color: COLORS.mutedText,
  },
  sleepWrap: {
    width: '23%',
    minWidth: 78,
    height: 74,
    borderRadius: RADIUS.md,
    backgroundColor: COLORS.surface,
    borderWidth: 1,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 24,
    marginBottom: 12,
  },
  sectionTitle: {
    ...TYPOGRAPHY.h2,
    fontSize: 23,
  },
  sectionAction: {
    ...TYPOGRAPHY.caption,
    color: COLORS.primary,
    fontFamily: 'Inter_600SemiBold',
  },
  loader: {
    marginVertical: 32,
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
    width: 44,
    height: 44,
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
    marginTop: 3,
  },
});
