import React from 'react';
import { StyleSheet, View, Text, SafeAreaView, FlatList, TouchableOpacity } from 'react-native';
import { COLORS, TYPOGRAPHY } from '../constants/theme';
import { usePlayerStore } from '../store/playerStore';
import { useNavigationStore } from '../store/navigationStore';
import { audioService } from '../services/audioService';

// Mock favourite stations for now
const MOCK_FAVOURITES = [
    { stationuuid: '1', name: 'BBC Radio 1', country: 'United Kingdom', language: 'English' },
    { stationuuid: '2', name: 'Radio France Internationale', country: 'France', language: 'French' },
    { stationuuid: '3', name: 'NHK World Radio Japan', country: 'Japan', language: 'Japanese' },
    { stationuuid: '4', name: 'Deutschlandfunk', country: 'Germany', language: 'German' },
    { stationuuid: '5', name: 'Radio Nacional de España', country: 'Spain', language: 'Spanish' },
    { stationuuid: '6', name: 'Radio Swiss Pop', country: 'Switzerland', language: 'Multiple' },
    { stationuuid: '7', name: 'KEXP 90.3 FM', country: 'United States', language: 'English' },
    { stationuuid: '8', name: 'Triple J', country: 'Australia', language: 'English' },
];

export const ArchiveScreen: React.FC = () => {
    const { currentStation, isPlaying, setCurrentStation } = usePlayerStore();
    const { setActiveTab } = useNavigationStore();

    const handlePlayStation = async (station: any) => {
        // In a real app, we would have the station URL
        // For now, just set as current and switch to player tab
        setCurrentStation({
            stationuuid: station.stationuuid,
            name: station.name,
            url: '',
            url_resolved: 'https://stream.example.com', // placeholder
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
        setActiveTab(1); // Switch to Player tab
        // In a real implementation, we would call audioService.play with actual URL
    };

    const renderStationItem = ({ item }: { item: any }) => (
        <TouchableOpacity
            style={[
                styles.stationItem,
                currentStation?.stationuuid === item.stationuuid && styles.activeStationItem,
            ]}
            onPress={() => handlePlayStation(item)}
        >
            <View style={styles.stationInfo}>
                <Text style={styles.stationName} numberOfLines={1}>
                    {item.name}
                </Text>
                <Text style={styles.stationMeta}>
                    {item.country} • {item.language}
                </Text>
            </View>
            {currentStation?.stationuuid === item.stationuuid && isPlaying && (
                <View style={styles.playingIndicator} />
            )}
        </TouchableOpacity>
    );

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.title}>Archive</Text>
                <Text style={styles.subtitle}>Your favourite stations</Text>
            </View>

            <FlatList
                data={MOCK_FAVOURITES}
                renderItem={renderStationItem}
                keyExtractor={(item) => item.stationuuid}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            />

            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    {MOCK_FAVOURITES.length} stations saved
                </Text>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    header: {
        padding: 24,
        paddingBottom: 16,
    },
    title: {
        ...TYPOGRAPHY.h1,
        fontFamily: 'PlayfairDisplay_700Bold',
        fontSize: 36,
        marginBottom: 8,
    },
    subtitle: {
        ...TYPOGRAPHY.caption,
        fontSize: 14,
        color: COLORS.secondaryText,
    },
    listContent: {
        paddingHorizontal: 24,
        paddingBottom: 100,
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
    },
    stationName: {
        ...TYPOGRAPHY.body,
        fontFamily: 'Inter_500Medium',
        fontSize: 16,
        marginBottom: 4,
    },
    stationMeta: {
        ...TYPOGRAPHY.caption,
        color: COLORS.secondaryText,
    },
    playingIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: COLORS.primary,
    },
    footer: {
        padding: 24,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
        alignItems: 'center',
    },
    footerText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.secondaryText,
    },
});