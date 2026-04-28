import React, { useState, useEffect } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    FlatList,
} from 'react-native';
import { LANGUAGES, Language } from '../constants/languages';
import { COLORS, TYPOGRAPHY } from '../constants/theme';
import { Station } from '../api/radioBrowser';
import { audioService } from '../services/audioService';
import { usePlayerStore } from '../store/playerStore';
import { useNavigationStore } from '../store/navigationStore';

export const LanguageImmersion: React.FC = () => {
    const [selectedLanguage, setSelectedLanguage] = useState<Language | null>(null);
    const [stations, setStations] = useState<Station[]>([]);
    const [loading, setLoading] = useState(false);
    const { setCurrentStation } = usePlayerStore();
    const { setActiveTab } = useNavigationStore();

    useEffect(() => {
        // Auto-select first language
        if (LANGUAGES.length > 0 && !selectedLanguage) {
            handleLanguageSelect(LANGUAGES[0]);
        }
    }, []);

    const handleLanguageSelect = async (language: Language) => {
        setSelectedLanguage(language);
        setLoading(true);

        try {
            // In a real implementation, we would call radioBrowser.searchStations with language
            await new Promise(resolve => setTimeout(resolve, 800));

            const mockStations: Station[] = [
                {
                    stationuuid: `${language.code}-1`,
                    name: `${language.label} Radio International`,
                    url: `https://stream.example.com/${language.code}1`,
                    url_resolved: `https://stream.example.com/${language.code}1`,
                    homepage: '',
                    favicon: '',
                    tags: `language,${language.code},news`,
                    country: 'Various',
                    countrycode: 'WW',
                    state: '',
                    language: language.label,
                    votes: 100,
                    lastcheckok: 1,
                    lastchecktime: '',
                    lastcheckoktime: '',
                    lastlocalchecktime: '',
                    clicktimestamp: '',
                    clickcount: 1000,
                    clicktrend: 10,
                    ssl_error: 0,
                    geo_lat: null,
                    geo_long: null,
                    has_extended_info: false,
                },
                {
                    stationuuid: `${language.code}-2`,
                    name: `${language.nativeName || language.label} Music`,
                    url: `https://stream.example.com/${language.code}2`,
                    url_resolved: `https://stream.example.com/${language.code}2`,
                    homepage: '',
                    favicon: '',
                    tags: `language,${language.code},music`,
                    country: 'Various',
                    countrycode: 'WW',
                    state: '',
                    language: language.label,
                    votes: 80,
                    lastcheckok: 1,
                    lastchecktime: '',
                    lastcheckoktime: '',
                    lastlocalchecktime: '',
                    clicktimestamp: '',
                    clickcount: 800,
                    clicktrend: 5,
                    ssl_error: 0,
                    geo_lat: null,
                    geo_long: null,
                    has_extended_info: false,
                },
                {
                    stationuuid: `${language.code}-3`,
                    name: `${language.label} News Network`,
                    url: `https://stream.example.com/${language.code}3`,
                    url_resolved: `https://stream.example.com/${language.code}3`,
                    homepage: '',
                    favicon: '',
                    tags: `language,${language.code},talk`,
                    country: 'Various',
                    countrycode: 'WW',
                    state: '',
                    language: language.label,
                    votes: 60,
                    lastcheckok: 1,
                    lastchecktime: '',
                    lastcheckoktime: '',
                    lastlocalchecktime: '',
                    clicktimestamp: '',
                    clickcount: 600,
                    clicktrend: 3,
                    ssl_error: 0,
                    geo_lat: null,
                    geo_long: null,
                    has_extended_info: false,
                },
                {
                    stationuuid: `${language.code}-4`,
                    name: `${language.label} Cultural Radio`,
                    url: `https://stream.example.com/${language.code}4`,
                    url_resolved: `https://stream.example.com/${language.code}4`,
                    homepage: '',
                    favicon: '',
                    tags: `language,${language.code},culture`,
                    country: 'Various',
                    countrycode: 'WW',
                    state: '',
                    language: language.label,
                    votes: 40,
                    lastcheckok: 1,
                    lastchecktime: '',
                    lastcheckoktime: '',
                    lastlocalchecktime: '',
                    clicktimestamp: '',
                    clickcount: 400,
                    clicktrend: 2,
                    ssl_error: 0,
                    geo_lat: null,
                    geo_long: null,
                    has_extended_info: false,
                },
            ];

            setStations(mockStations);
        } catch (error) {
            console.error(`Failed to fetch stations for ${language.label}:`, error);
        } finally {
            setLoading(false);
        }
    };

    const handleStationPress = (station: Station) => {
        setCurrentStation(station);
        setActiveTab(1);
        audioService.play(station.url_resolved);
    };

    const renderLanguageChip = ({ item }: { item: Language }) => {
        const isSelected = selectedLanguage?.code === item.code;

        return (
            <TouchableOpacity
                style={[
                    styles.languageChip,
                    isSelected && styles.languageChipSelected,
                ]}
                onPress={() => handleLanguageSelect(item)}
            >
                <Text style={[
                    styles.languageChipText,
                    isSelected && styles.languageChipTextSelected,
                ]}>
                    {item.label}
                </Text>
                {item.nativeName && item.nativeName !== item.label && (
                    <Text style={[
                        styles.languageNativeText,
                        isSelected && styles.languageNativeTextSelected,
                    ]}>
                        {item.nativeName}
                    </Text>
                )}
            </TouchableOpacity>
        );
    };

    const renderStationItem = ({ item }: { item: Station }) => (
        <TouchableOpacity
            style={styles.stationItem}
            onPress={() => handleStationPress(item)}
        >
            <View style={styles.stationInfo}>
                <Text style={styles.stationName} numberOfLines={2}>
                    {item.name}
                </Text>
                <Text style={styles.stationMeta}>
                    {item.language} • {item.country}
                </Text>
            </View>
            <View style={styles.stationIndicator}>
                <View style={styles.playIndicator}>
                    <Text style={styles.playIndicatorText}>▶</Text>
                </View>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.languagesSection}>
                <Text style={styles.sectionTitle}>Select a Language</Text>
                <FlatList
                    data={LANGUAGES}
                    renderItem={renderLanguageChip}
                    keyExtractor={(item) => item.code}
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.languagesList}
                />
            </View>

            <View style={styles.stationsSection}>
                <View style={styles.stationsHeader}>
                    <Text style={styles.stationsTitle}>
                        {selectedLanguage
                            ? `Stations in ${selectedLanguage.label}`
                            : 'Select a language'
                        }
                    </Text>
                    {selectedLanguage && (
                        <Text style={styles.stationsCount}>
                            {stations.length} stations
                        </Text>
                    )}
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
                ) : selectedLanguage ? (
                    <FlatList
                        data={stations}
                        renderItem={renderStationItem}
                        keyExtractor={(item) => item.stationuuid}
                        scrollEnabled={false}
                        contentContainerStyle={styles.stationsList}
                    />
                ) : (
                    <Text style={styles.noSelectionText}>
                        Choose a language to see radio stations
                    </Text>
                )}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 16,
    },
    languagesSection: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    sectionTitle: {
        ...TYPOGRAPHY.h2,
        fontSize: 20,
        marginBottom: 16,
    },
    languagesList: {
        paddingBottom: 4,
    },
    languageChip: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 20,
        paddingVertical: 10,
        paddingHorizontal: 16,
        marginRight: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        alignItems: 'center',
        minWidth: 80,
    },
    languageChipSelected: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    languageChipText: {
        ...TYPOGRAPHY.body,
        fontSize: 14,
        color: COLORS.text,
    },
    languageChipTextSelected: {
        color: COLORS.background,
        fontWeight: '600',
    },
    languageNativeText: {
        ...TYPOGRAPHY.caption,
        fontSize: 10,
        color: COLORS.secondaryText,
        marginTop: 2,
    },
    languageNativeTextSelected: {
        color: 'rgba(11, 14, 20, 0.8)',
    },
    stationsSection: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 20,
    },
    stationsHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 16,
    },
    stationsTitle: {
        ...TYPOGRAPHY.body,
        fontSize: 16,
        flex: 1,
    },
    stationsCount: {
        ...TYPOGRAPHY.caption,
        color: COLORS.primary,
    },
    stationsList: {
        paddingBottom: 4,
    },
    stationItem: {
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    stationInfo: {
        flex: 1,
        marginRight: 12,
    },
    stationName: {
        ...TYPOGRAPHY.body,
        fontSize: 14,
        marginBottom: 4,
    },
    stationMeta: {
        ...TYPOGRAPHY.caption,
        color: COLORS.secondaryText,
    },
    stationIndicator: {
        width: 40,
        alignItems: 'center',
    },
    playIndicator: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: COLORS.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    playIndicatorText: {
        color: COLORS.background,
        fontSize: 12,
        marginLeft: 2,
    },
    loader: {
        marginVertical: 40,
    },
    noSelectionText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.secondaryText,
        textAlign: 'center',
        paddingVertical: 40,
    },
});