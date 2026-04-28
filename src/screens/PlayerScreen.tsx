import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    SafeAreaView,
    ActivityIndicator,
    ScrollView
} from 'react-native';
import { audioService } from '../services/audioService';
import { usePlayerStore } from '../store/playerStore';
import { fetchTopStations, Station } from '../api/radioBrowser';
import { COLORS, TYPOGRAPHY } from '../constants/theme';
import { useNavigationStore } from '../store/navigationStore';
import { useStationTime } from '../hooks/useStationTime';
import { ClockFace } from '../components/ClockFace';
import { BufferBar } from '../components/BufferBar';
import { SongIdentifier } from '../components/SongIdentifier';
import { QualityIndicator } from '../components/QualityIndicator';
import { useNetworkMonitor } from '../services/networkMonitor';
import { SleepTimerButton } from '../components/SleepTimerButton';
import { ShareButton } from '../components/ShareButton';
import { AlarmModal } from '../components/AlarmModal';
import { EQModal } from '../components/EQModal';
import { ScheduleRecordingModal } from '../components/ScheduleRecordingModal';
import { useRecordingStore } from '../store/recordingStore';
import { useAlarmStore } from '../store/alarmStore';
import { useEQStore } from '../store/eqStore';
// Week 11-12 Features
import { VintageDial } from '../components/VintageDial';
import { useHaptics } from '../services/hapticService';
import { listeningRoomService } from '../services/listeningRoomService';
import { foundSoundService } from '../services/foundSoundService';
import { adAwareService } from '../services/adAwareService';
import { useAccessibility } from '../services/accessibilityService';
// Debugging Feature
import { DevConnectScreen } from './DevConnectScreen';

export const PlayerScreen: React.FC = () => {
    const { currentStation, isPlaying, isLoading, setCurrentStation } = usePlayerStore();
    const { setActiveTab } = useNavigationStore();
    const { isRecordingModalOpen, setRecordingModalOpen } = useRecordingStore();
    const { isAlarmModalOpen, setAlarmModalOpen } = useAlarmStore();
    const { isEQModalOpen, setEQModalOpen } = useEQStore();

    const [stations, setStations] = useState<Station[]>([]);
    const [loadingStations, setLoadingStations] = useState(true);
    // Week 11-12 State
    const [isRecordingClip, setIsRecordingClip] = useState(false);
    const [adBreakActive, setAdBreakActive] = useState(false);
    const [listeningRooms, setListeningRooms] = useState<any[]>([]);
    // Debugging Feature State
    const [isDevConnectVisible, setIsDevConnectVisible] = useState(false);

    // Initialize network monitoring
    useNetworkMonitor();
    // Week 11-12 Hooks
    const { stationChange, recordingToggle, soundClipCaptured, adBreakDetected } = useHaptics();
    const { getButtonProps } = useAccessibility();

    const stationTime = useStationTime(currentStation?.countrycode);

    useEffect(() => {
        loadStations();
        // Initialize audio service
        audioService.init();

        // Cleanup on unmount
        return () => {
            audioService.cleanup();
        };
    }, []);

    const loadStations = async () => {
        setLoadingStations(true);
        const data = await fetchTopStations(10);
        setStations(data);
        setLoadingStations(false);
    };

    const handlePlayStation = async (station: Station) => {
        if (currentStation?.stationuuid === station.stationuuid && isPlaying) {
            await audioService.pause();
        } else {
            setCurrentStation(station);
            // Add haptic feedback for station change
            stationChange();
            // Wait a moment for state to update, then play
            setTimeout(() => {
                audioService.play(station.url_resolved);
            }, 100);
        }
    };

    const handlePlayPause = async () => {
        if (isPlaying) {
            await audioService.pause();
        } else if (currentStation) {
            await audioService.resume();
        }
    };

    const handleRecordPress = () => {
        setRecordingModalOpen(true);
    };

    const handleAlarmPress = () => {
        setAlarmModalOpen(true);
    };

    const handleEQPress = () => {
        setEQModalOpen(true);
    };

    // Week 11-12 Feature Handlers
    const handleFoundSoundPress = async () => {
        if (!currentStation) return;

        recordingToggle();
        setIsRecordingClip(true);

        try {
            // Start recording a 30-second clip
            const success = await foundSoundService.startRecording();
            if (success) {
                // Simulate recording for 30 seconds
                setTimeout(async () => {
                    const clip = await foundSoundService.stopRecording();
                    if (clip) {
                        soundClipCaptured();
                        // Show success message
                        console.log('Found Sound clip recorded:', clip);
                    }
                    setIsRecordingClip(false);
                }, 30000); // 30 seconds
            }
        } catch (error) {
            console.error('Failed to record clip:', error);
            setIsRecordingClip(false);
        }
    };

    const handleAdBreakPress = () => {
        if (adBreakActive) {
            // Stop ad break
            adAwareService.stopAdBreak();
            setAdBreakActive(false);
        } else {
            // Start manual ad break
            adBreakDetected();
            if (currentStation) {
                adAwareService.startManualAdBreak(currentStation, 2); // 2 minutes
            }
            setAdBreakActive(true);

            // Auto-stop after 2 minutes (simulated)
            setTimeout(() => {
                adAwareService.stopAdBreak();
                setAdBreakActive(false);
            }, 120000);
        }
    };

    const handleListeningRoomPress = async () => {
        if (!currentStation) return;

        try {
            const rooms = await listeningRoomService.getAvailableRooms();
            setListeningRooms(rooms);

            // For demo, create a room if none exist
            if (rooms.length === 0) {
                const room = await listeningRoomService.createRoom(
                    `Room for ${currentStation.name}`,
                    currentStation
                );
                if (room) {
                    console.log('Created listening room:', room);
                }
            }
        } catch (error) {
            console.error('Failed to handle listening rooms:', error);
        }
    };

    const handleVintageDialChange = (frequency: number) => {
        // Simulate tuning with haptic feedback
        stationChange();
        console.log('Tuned to frequency:', frequency);
    };

    // Debugging Feature Handler
    const handleDevConnectPress = () => {
        setIsDevConnectVisible(true);
    };

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
                {/* Buffer Guardian - Shows audio buffer status */}
                <BufferBar />

                <View style={styles.header}>
                    <Text style={styles.clock}>17:14</Text>
                    <View style={styles.titleRow}>
                        <Text style={styles.title}>RadioWorld</Text>
                        <TouchableOpacity
                            style={styles.devButton}
                            onPress={handleDevConnectPress}
                            accessibilityLabel="Developer connection"
                        >
                            <Text style={styles.devIcon}>⚙️</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.dialContainer}>
                    <View style={styles.dialRing}>
                        <Text style={styles.stationName}>
                            {currentStation ? currentStation.name : 'Select a Station'}
                        </Text>

                        {currentStation && (
                            <View style={styles.timeZoneSection}>
                                <View style={styles.clockContainer}>
                                    <ClockFace timeInfo={stationTime} size={100} showDigital={false} />
                                </View>
                                <View style={styles.timeZoneInfo}>
                                    <Text style={styles.timeZoneLabel}>Local time at station</Text>
                                    <Text style={styles.timeZoneText}>
                                        {stationTime.isUnknown ? 'Unknown timezone' : stationTime.timeString}
                                    </Text>
                                    <Text style={styles.timeZoneDetail}>
                                        {currentStation.countrycode ? `${currentStation.countrycode} • ${stationTime.timeZone}` : 'Unknown location'}
                                    </Text>
                                </View>
                            </View>
                        )}

                        {currentStation && (
                            <View style={styles.stationMeta}>
                                <Text style={styles.stationCountry}>{currentStation.country}</Text>
                                <Text style={styles.stationLanguage}>{currentStation.language}</Text>
                                <QualityIndicator />
                            </View>
                        )}
                    </View>
                </View>

                <View style={styles.controls}>
                    <TouchableOpacity
                        style={styles.playButton}
                        onPress={handlePlayPause}
                        disabled={!currentStation}
                    >
                        <Text style={styles.playButtonText}>
                            {isPlaying ? 'PAUSE' : 'PLAY'}
                        </Text>
                    </TouchableOpacity>

                    {/* AI Song Identifier */}
                    <SongIdentifier />
                </View>

                {/* Utility Buttons */}
                <View style={styles.utilityButtons}>
                    <TouchableOpacity style={styles.utilityButton} onPress={handleRecordPress}>
                        <Text style={styles.utilityIcon}>⏺️</Text>
                        <Text style={styles.utilityLabel}>Record</Text>
                    </TouchableOpacity>

                    <SleepTimerButton />

                    <TouchableOpacity style={styles.utilityButton} onPress={handleAlarmPress}>
                        <Text style={styles.utilityIcon}>⏰</Text>
                        <Text style={styles.utilityLabel}>Alarm</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.utilityButton} onPress={handleEQPress}>
                        <Text style={styles.utilityIcon}>🎛️</Text>
                        <Text style={styles.utilityLabel}>EQ</Text>
                    </TouchableOpacity>

                    {currentStation && (
                        <ShareButton station={currentStation} compact={true} />
                    )}
                </View>

                {/* Week 11-12 Feature Buttons */}
                <View style={styles.weekFeaturesContainer}>
                    <Text style={styles.weekFeaturesTitle}>Week 11-12 Features</Text>
                    <View style={styles.weekFeaturesGrid}>
                        {/* Found Sound Archive */}
                        <TouchableOpacity
                            style={[
                                styles.featureButton,
                                isRecordingClip && styles.featureButtonActive
                            ]}
                            onPress={handleFoundSoundPress}
                            disabled={!currentStation || isRecordingClip}
                        >
                            <Text style={styles.featureIcon}>🎵</Text>
                            <Text style={styles.featureLabel}>
                                {isRecordingClip ? 'Recording...' : 'Found Sound'}
                            </Text>
                            <Text style={styles.featureSubtext}>30s clip</Text>
                        </TouchableOpacity>

                        {/* Ad-Aware Listener */}
                        <TouchableOpacity
                            style={[
                                styles.featureButton,
                                adBreakActive && styles.featureButtonActive
                            ]}
                            onPress={handleAdBreakPress}
                            disabled={!currentStation}
                        >
                            <Text style={styles.featureIcon}>🔇</Text>
                            <Text style={styles.featureLabel}>
                                {adBreakActive ? 'Ad Break' : 'Ad Aware'}
                            </Text>
                            <Text style={styles.featureSubtext}>Volume -50%</Text>
                        </TouchableOpacity>

                        {/* Listening Rooms */}
                        <TouchableOpacity
                            style={styles.featureButton}
                            onPress={handleListeningRoomPress}
                            disabled={!currentStation}
                        >
                            <Text style={styles.featureIcon}>👥</Text>
                            <Text style={styles.featureLabel}>Rooms</Text>
                            <Text style={styles.featureSubtext}>Social listening</Text>
                        </TouchableOpacity>

                        {/* Vintage Dial Visualizer */}
                        <TouchableOpacity
                            style={styles.featureButton}
                            onPress={() => console.log('Open visualizer')}
                        >
                            <Text style={styles.featureIcon}>📻</Text>
                            <Text style={styles.featureLabel}>Visualizer</Text>
                            <Text style={styles.featureSubtext}>FM Dial</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                <View style={styles.stationsList}>
                    <Text style={[styles.sectionTitle, { color: COLORS.secondaryText }]}>
                        Top Stations
                    </Text>
                    {loadingStations ? (
                        <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
                    ) : (
                        stations.map(station => (
                            <TouchableOpacity
                                key={station.stationuuid}
                                style={[
                                    styles.stationItem,
                                    currentStation?.stationuuid === station.stationuuid && styles.activeStationItem
                                ]}
                                onPress={() => handlePlayStation(station)}
                            >
                                <View style={styles.stationInfo}>
                                    <Text style={styles.stationItemText} numberOfLines={1}>
                                        {station.name}
                                    </Text>
                                    <Text style={styles.stationSubtext} numberOfLines={1}>
                                        {station.country} • {station.language}
                                    </Text>
                                </View>
                                <View style={styles.stationIndicators}>
                                    {currentStation?.stationuuid === station.stationuuid && isPlaying && (
                                        <ActivityIndicator size="small" color={COLORS.primary} />
                                    )}
                                    {currentStation?.stationuuid === station.stationuuid && isLoading && (
                                        <ActivityIndicator size="small" color={COLORS.record} />
                                    )}
                                    <ShareButton station={station} compact={true} />
                                </View>
                            </TouchableOpacity>
                        ))
                    )}
                </View>
            </ScrollView>

            {/* Modals */}
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
            <EQModal
                visible={isEQModalOpen}
                onClose={() => setEQModalOpen(false)}
            />
            {/* Debugging Feature Modal */}
            <DevConnectScreen
                visible={isDevConnectVisible}
                onClose={() => setIsDevConnectVisible(false)}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    scrollView: {
        flex: 1,
    },
    content: {
        paddingBottom: 100,
    },
    header: {
        padding: 24,
        alignItems: 'center',
        marginTop: 40,
    },
    clock: {
        fontFamily: 'PlayfairDisplay_400Regular',
        fontSize: 48,
        color: COLORS.text,
    },
    title: {
        fontFamily: 'Inter_400Regular',
        fontSize: 16,
        color: COLORS.primary,
        marginTop: 8,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    dialContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 300,
    },
    dialRing: {
        width: 300,
        height: 300,
        borderRadius: 150,
        borderWidth: 2,
        borderColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    stationName: {
        fontFamily: 'PlayfairDisplay_700Bold',
        fontSize: 24,
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: 16,
    },
    timeZoneSection: {
        flexDirection: 'row',
        alignItems: 'center',
        marginVertical: 16,
    },
    clockContainer: {
        marginRight: 16,
    },
    timeZoneInfo: {
        flex: 1,
    },
    timeZoneLabel: {
        ...TYPOGRAPHY.caption,
        color: COLORS.secondaryText,
        marginBottom: 4,
    },
    timeZoneText: {
        ...TYPOGRAPHY.body,
        fontFamily: 'PlayfairDisplay_400Regular',
        fontSize: 20,
        color: COLORS.text,
        marginBottom: 2,
    },
    timeZoneDetail: {
        ...TYPOGRAPHY.caption,
        color: COLORS.secondaryText,
        fontSize: 10,
    },
    stationMeta: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 8,
    },
    stationCountry: {
        ...TYPOGRAPHY.caption,
        color: COLORS.secondaryText,
        marginRight: 8,
    },
    stationLanguage: {
        ...TYPOGRAPHY.caption,
        color: COLORS.primary,
    },
    controls: {
        padding: 32,
        alignItems: 'center',
    },
    playButton: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: COLORS.surface,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: COLORS.primary,
    },
    playButtonText: {
        fontFamily: 'JetBrainsMono_400Regular',
        fontSize: 12,
        color: COLORS.primary,
    },
    stationsList: {
        padding: 24,
        flex: 1,
    },
    sectionTitle: {
        fontFamily: 'JetBrainsMono_400Regular',
        fontSize: 12,
        textTransform: 'uppercase',
        marginBottom: 16,
    },
    stationItem: {
        paddingVertical: 16,
        paddingHorizontal: 20,
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        marginBottom: 12,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    activeStationItem: {
        borderColor: COLORS.primary,
        borderWidth: 1,
    },
    stationInfo: {
        flex: 1,
        marginRight: 16,
    },
    stationItemText: {
        fontFamily: 'Inter_500Medium',
        fontSize: 16,
        color: COLORS.text,
        marginBottom: 4,
    },
    stationSubtext: {
        fontFamily: 'Inter_400Regular',
        fontSize: 12,
        color: COLORS.secondaryText,
    },
    stationIndicators: {
        width: 24,
        alignItems: 'center',
    },
    loader: {
        marginVertical: 40,
    },
    utilityButtons: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.1)',
        backgroundColor: COLORS.surface,
    },
    utilityButton: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 8,
        minWidth: 60,
    },
    utilityIcon: {
        fontSize: 24,
        marginBottom: 4,
    },
    utilityLabel: {
        ...TYPOGRAPHY.caption,
        fontSize: 10,
        color: COLORS.secondaryText,
    },
    // Week 11-12 Feature Styles
    weekFeaturesContainer: {
        marginTop: 20,
        paddingHorizontal: 20,
        paddingVertical: 16,
        backgroundColor: 'rgba(26, 31, 46, 0.8)',
        borderRadius: 12,
        marginHorizontal: 20,
    },
    weekFeaturesTitle: {
        ...TYPOGRAPHY.caption,
        fontSize: 11,
        color: COLORS.primary,
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 12,
        textAlign: 'center',
    },
    weekFeaturesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
        gap: 12,
    },
    featureButton: {
        flex: 1,
        minWidth: 80,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 8,
        backgroundColor: COLORS.surface,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    featureButtonActive: {
        backgroundColor: 'rgba(245, 166, 35, 0.2)',
        borderColor: COLORS.primary,
    },
    featureIcon: {
        fontSize: 24,
        marginBottom: 6,
    },
    featureLabel: {
        ...TYPOGRAPHY.caption,
        fontSize: 11,
        color: COLORS.text,
        textAlign: 'center',
        marginBottom: 2,
    },
    featureSubtext: {
        ...TYPOGRAPHY.caption,
        fontSize: 9,
        color: COLORS.secondaryText,
        textAlign: 'center',
    },
    // Debugging Feature Styles
    titleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 8,
    },
    devButton: {
        marginLeft: 12,
        padding: 6,
        borderRadius: 20,
        backgroundColor: COLORS.surface,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    devIcon: {
        fontSize: 16,
        color: COLORS.primary,
    },
});