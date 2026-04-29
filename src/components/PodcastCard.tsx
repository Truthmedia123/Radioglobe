import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import * as Haptics from 'expo-haptics';
import { PodcastSearchResult } from '../types/podcast';
import { COLORS } from '../constants/theme';

interface PodcastCardProps {
    podcast: PodcastSearchResult;
    onPress: () => void;
}

export const PodcastCard: React.FC<PodcastCardProps> = ({ podcast, onPress }) => {
    const handlePress = () => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onPress();
    };

    const getSourceColor = () => {
        switch (podcast.source) {
            case 'itunes': return '#ff2d55'; // iTunes red/pink
            case 'podcastindex': return '#e11122'; // PI red
            case 'gpodder': return '#4da828'; // Gpodder green
            default: return COLORS.primary;
        }
    };

    return (
        <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.8}>
            <Image
                source={podcast.artworkUrl ? { uri: podcast.artworkUrl } : undefined}
                style={styles.artwork}
                contentFit="cover"
                transition={200}
            />
            
            <View style={styles.contentContainer}>
                <Text style={styles.title} numberOfLines={1}>
                    {podcast.title}
                </Text>
                
                {podcast.author ? (
                    <Text style={styles.author} numberOfLines={1}>
                        {podcast.author}
                    </Text>
                ) : null}

                <View style={styles.footerRow}>
                    <View style={[styles.sourceBadge, { backgroundColor: getSourceColor() + '20' }]}>
                        <Text style={[styles.sourceText, { color: getSourceColor() }]}>
                            {podcast.source.toUpperCase()}
                        </Text>
                    </View>
                    
                    {podcast.episodeCount !== undefined && (
                        <Text style={styles.episodeCount}>
                            {podcast.episodeCount} eps
                        </Text>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: COLORS.surface, // #1A1F2E usually based on theme
        borderRadius: 12,
        padding: 16,
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    artwork: {
        width: 48,
        height: 48,
        borderRadius: 8,
        backgroundColor: '#2A3040', // Placeholder color
    },
    contentContainer: {
        flex: 1,
        marginLeft: 16,
        justifyContent: 'center',
    },
    title: {
        fontSize: 18,
        fontFamily: 'Inter_600SemiBold',
        color: COLORS.text,
        marginBottom: 4,
    },
    author: {
        fontSize: 15,
        fontFamily: 'Inter_400Regular',
        color: COLORS.textSecondary,
        marginBottom: 8,
    },
    footerRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    sourceBadge: {
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 4,
    },
    sourceText: {
        fontSize: 10,
        fontFamily: 'Inter_600SemiBold',
    },
    episodeCount: {
        fontSize: 12,
        fontFamily: 'JetBrainsMono_400Regular',
        color: COLORS.textSecondary,
    },
});
