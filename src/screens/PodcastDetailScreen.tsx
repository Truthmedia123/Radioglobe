import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
    SafeAreaView,
} from 'react-native';
import { usePodcastStore } from '../store/podcastStore';
import { PodcastEpisode } from '../types/podcast';
import { COLORS, TYPOGRAPHY } from '../constants/theme';
import { usePlayerStore } from '../store/playerStore';
import { audioService } from '../services/audioService';
import Icon from 'react-native-vector-icons/MaterialIcons';

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
    } = usePodcastStore();
    const { setCurrentPodcastEpisode } = usePlayerStore();
    const [localEpisodes, setLocalEpisodes] = useState<PodcastEpisode[]>([]);
    const [podcastTitle, setPodcastTitle] = useState('');

    const isSubscribed = subscribedFeeds.includes(feedUrl);

    useEffect(() => {
        const loadEpisodes = async () => {
            const stored = episodes[feedUrl];
            if (stored && stored.length > 0) {
                setLocalEpisodes(stored);
                if (stored[0]?.podcastTitle) {
                    setPodcastTitle(stored[0].podcastTitle);
                }
            } else {
                const fetched = await fetchEpisodes(feedUrl);
                setLocalEpisodes(fetched);
                if (fetched[0]?.podcastTitle) {
                    setPodcastTitle(fetched[0].podcastTitle);
                }
            }
        };
        loadEpisodes();
    }, [feedUrl]);

    const handleSubscribe = async () => {
        if (isSubscribed) {
            await unsubscribe(feedUrl);
        } else {
            await subscribe(feedUrl);
        }
    };

    const handlePlayEpisode = async (episode: PodcastEpisode) => {
        // Set current podcast episode in player store
        setCurrentPodcastEpisode(episode);
        // Play audio via audioService
        await audioService.play(episode.audioUrl);
    };

    const formatDuration = (seconds: number) => {
        if (!seconds) return '--:--';
        const hrs = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds % 3600) / 60);
        const secs = Math.floor(seconds % 60);
        if (hrs > 0) {
            return `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
        }
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    const renderEpisodeItem = ({ item }: { item: PodcastEpisode }) => (
        <TouchableOpacity style={styles.episodeItem} onPress={() => handlePlayEpisode(item)}>
            <View style={styles.episodeInfo}>
                <Text style={styles.episodeTitle} numberOfLines={2}>{item.title}</Text>
                <View style={styles.episodeMeta}>
                    <Text style={styles.episodeMetaText}>{formatDate(item.publishDate)}</Text>
                    <Text style={styles.episodeMetaText}>•</Text>
                    <Text style={styles.episodeMetaText}>{formatDuration(item.durationSeconds)}</Text>
                </View>
                <Text style={styles.episodeDescription} numberOfLines={2}>{item.description}</Text>
            </View>
            <TouchableOpacity
                style={styles.playButton}
                onPress={() => handlePlayEpisode(item)}
            >
                <Icon name="play-arrow" size={24} color={COLORS.primary} />
            </TouchableOpacity>
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                    <Icon name="close" size={24} color={COLORS.text} />
                </TouchableOpacity>
                <Text style={styles.headerTitle} numberOfLines={1}>{podcastTitle || 'Podcast'}</Text>
                <TouchableOpacity onPress={handleSubscribe} style={styles.subscribeButton}>
                    <Icon
                        name={isSubscribed ? 'favorite' : 'favorite-border'}
                        size={24}
                        color={isSubscribed ? COLORS.primary : COLORS.text}
                    />
                </TouchableOpacity>
            </View>

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
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: COLORS.surface,
    },
    closeButton: {
        padding: 8,
    },
    headerTitle: {
        ...TYPOGRAPHY.h2,
        flex: 1,
        textAlign: 'center',
        marginHorizontal: 12,
    },
    subscribeButton: {
        padding: 8,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
        paddingBottom: 40,
    },
    episodeItem: {
        flexDirection: 'row',
        backgroundColor: COLORS.surface,
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        alignItems: 'center',
    },
    episodeInfo: {
        flex: 1,
        marginRight: 12,
    },
    episodeTitle: {
        ...TYPOGRAPHY.body,
        fontWeight: '600',
        marginBottom: 4,
        color: COLORS.text,
    },
    episodeMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    episodeMetaText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.secondaryText,
        marginRight: 8,
    },
    episodeDescription: {
        ...TYPOGRAPHY.caption,
        color: COLORS.secondaryText,
    },
    playButton: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: 'rgba(245, 166, 35, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        ...TYPOGRAPHY.body,
        color: COLORS.secondaryText,
    },
});