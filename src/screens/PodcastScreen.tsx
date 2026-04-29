import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, FlatList, ActivityIndicator, Modal } from 'react-native';
import { PodcastCard } from '../components/PodcastCard';
import { searchAllProviders } from '../services/podcast/searchOrchestrator';
import { PodcastSearchResult } from '../types/podcast';
import { COLORS } from '../constants/theme';
import { usePodcastStore } from '../store/podcastStore';
import { PodcastDetailScreen } from './PodcastDetailScreen';

export const PodcastScreen: React.FC = () => {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState<PodcastSearchResult[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [debouncedQuery, setDebouncedQuery] = useState('');
    const { selectedFeedUrl, setSelectedFeedUrl } = usePodcastStore();

    // Debounce the query
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedQuery(query);
        }, 400);

        return () => {
            clearTimeout(handler);
        };
    }, [query]);

    useEffect(() => {
        const performSearch = async () => {
            if (!debouncedQuery.trim()) {
                setResults([]);
                return;
            }

            setIsLoading(true);
            try {
                const data = await searchAllProviders(debouncedQuery);
                setResults(data);
            } catch (error) {
                console.error('Search failed', error);
            } finally {
                setIsLoading(false);
            }
        };

        performSearch();
    }, [debouncedQuery]);

    const handleCardPress = (podcast: PodcastSearchResult) => {
        console.log('Podcast pressed:', podcast.title);
        setSelectedFeedUrl(podcast.feedUrl);
    };

    const handleCloseDetail = () => {
        setSelectedFeedUrl(null);
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search podcasts..."
                    placeholderTextColor={COLORS.secondaryText}
                    value={query}
                    onChangeText={setQuery}
                    autoCapitalize="none"
                    autoCorrect={false}
                />
            </View>

            {isLoading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color={COLORS.primary} />
                </View>
            ) : results.length > 0 ? (
                <FlatList
                    data={results}
                    keyExtractor={(item) => item.feedUrl || item.title + item.source}
                    renderItem={({ item }) => (
                        <PodcastCard podcast={item} onPress={() => handleCardPress(item)} />
                    )}
                    contentContainerStyle={styles.listContent}
                    keyboardShouldPersistTaps="handled"
                />
            ) : debouncedQuery.trim() !== '' ? (
                <View style={styles.centerContainer}>
                    <Text style={styles.emptyText}>No podcasts found</Text>
                </View>
            ) : null}

            <Modal
                visible={!!selectedFeedUrl}
                animationType="slide"
                presentationStyle="fullScreen"
                onRequestClose={handleCloseDetail}
            >
                {selectedFeedUrl && (
                    <PodcastDetailScreen
                        feedUrl={selectedFeedUrl}
                        onClose={handleCloseDetail}
                    />
                )}
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background, // #0B0E14
    },
    header: {
        paddingHorizontal: 20,
        paddingTop: 60, // Adjust depending on status bar
        paddingBottom: 20,
    },
    searchInput: {
        backgroundColor: COLORS.surface,
        color: COLORS.text,
        fontSize: 16,
        fontFamily: 'Inter_400Regular',
        borderRadius: 24, // rounded-full
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderWidth: 1,
        borderColor: 'transparent', // focused state could be handled with onFocus
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 100, // accommodate bottom nav
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        fontSize: 16,
        fontFamily: 'Inter_400Regular',
        color: COLORS.secondaryText,
    },
});
