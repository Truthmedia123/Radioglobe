import React, { useEffect, useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    ScrollView,
    ActivityIndicator,
    Dimensions,
} from 'react-native';
import { CommuteCity, getCommutingCities, getCurrentHourInTimezone, getTimeOfDayGradient } from '../constants/commuteCities';
import { COLORS, TYPOGRAPHY } from '../constants/theme';
import { Station } from '../api/radioBrowser';
import { audioService } from '../services/audioService';
import { usePlayerStore } from '../store/playerStore';
import { useNavigationStore } from '../store/navigationStore';

const { width: screenWidth } = Dimensions.get('window');
const CARD_WIDTH = screenWidth * 0.7;
const CARD_MARGIN = 12;

interface CommuteCarouselProps {
    onStationSelect?: () => void;
}

export const CommuteCarousel: React.FC<CommuteCarouselProps> = ({ onStationSelect }) => {
    const [commutingCities, setCommutingCities] = useState<CommuteCity[]>([]);
    const [cityStations, setCityStations] = useState<Record<string, Station[]>>({});
    const [loading, setLoading] = useState<Record<string, boolean>>({});
    const { setCurrentStation } = usePlayerStore();
    const { setActiveTab } = useNavigationStore();

    useEffect(() => {
        const cities = getCommutingCities();
        setCommutingCities(cities);

        // Fetch stations for each city
        cities.forEach(city => {
            fetchStationsForCity(city);
        });
    }, []);

    const fetchStationsForCity = async (city: CommuteCity) => {
        setLoading(prev => ({ ...prev, [city.city]: true }));
        try {
            // In a real implementation, we would call radioBrowser.searchStations
            // For now, we'll simulate with a timeout and mock data
            await new Promise(resolve => setTimeout(resolve, 500));

            const mockStations: Station[] = [
                {
                    stationuuid: `${city.city}-1`,
                    name: `${city.city} News Radio`,
                    url: 'https://stream.example.com/1',
                    url_resolved: 'https://stream.example.com/1',
                    homepage: '',
                    favicon: '',
                    tags: 'news,talk',
                    country: city.country,
                    countrycode: city.countryCode,
                    state: '',
                    language: 'English',
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
                    stationuuid: `${city.city}-2`,
                    name: `${city.city} Morning Show`,
                    url: 'https://stream.example.com/2',
                    url_resolved: 'https://stream.example.com/2',
                    homepage: '',
                    favicon: '',
                    tags: 'morning show,music',
                    country: city.country,
                    countrycode: city.countryCode,
                    state: '',
                    language: 'English',
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
            ];

            setCityStations(prev => ({
                ...prev,
                [city.city]: mockStations,
            }));
        } catch (error) {
            console.error(`Failed to fetch stations for ${city.city}:`, error);
        } finally {
            setLoading(prev => ({ ...prev, [city.city]: false }));
        }
    };

    const handleCityPress = (city: CommuteCity) => {
        const stations = cityStations[city.city];
        if (stations && stations.length > 0) {
            const firstStation = stations[0];
            setCurrentStation(firstStation);
            setActiveTab(1); // Switch to Player tab
            audioService.play(firstStation.url_resolved);
            if (onStationSelect) onStationSelect();
        }
    };

    const handleStationPress = (station: Station) => {
        setCurrentStation(station);
        setActiveTab(1);
        audioService.play(station.url_resolved);
        if (onStationSelect) onStationSelect();
    };

    if (commutingCities.length === 0) {
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>
                    No cities are currently in commute hours.
                </Text>
                <Text style={styles.emptySubtext}>
                    Check back during morning (7‑9) or evening (17‑19) local time.
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.carouselContent}
                snapToInterval={CARD_WIDTH + CARD_MARGIN * 2}
                decelerationRate="fast"
            >
                {commutingCities.map(city => {
                    const hour = getCurrentHourInTimezone(city.timeZone);
                    const gradient = getTimeOfDayGradient(hour);
                    const stations = cityStations[city.city] || [];
                    const isLoading = loading[city.city];

                    return (
                        <TouchableOpacity
                            key={city.city}
                            style={styles.cityCard}
                            onPress={() => handleCityPress(city)}
                            activeOpacity={0.9}
                        >
                            <View style={[styles.cardContent, { backgroundColor: gradient.start }]}>
                                <View style={styles.cityHeader}>
                                    <Text style={styles.cityName}>{city.city}</Text>
                                    <Text style={styles.cityCountry}>{city.country}</Text>
                                    <Text style={styles.cityTime}>
                                        {hour.toString().padStart(2, '0')}:00
                                        <Text style={styles.timePeriod}>
                                            {hour >= 12 ? ' PM' : ' AM'}
                                        </Text>
                                    </Text>
                                </View>

                                <View style={styles.stationsContainer}>
                                    {isLoading ? (
                                        <ActivityIndicator size="small" color="white" />
                                    ) : stations.length > 0 ? (
                                        stations.map(station => (
                                            <TouchableOpacity
                                                key={station.stationuuid}
                                                style={styles.stationChip}
                                                onPress={(e) => {
                                                    e.stopPropagation();
                                                    handleStationPress(station);
                                                }}
                                            >
                                                <Text style={styles.stationChipText} numberOfLines={1}>
                                                    {station.name}
                                                </Text>
                                            </TouchableOpacity>
                                        ))
                                    ) : (
                                        <Text style={styles.noStationsText}>No stations available</Text>
                                    )}
                                </View>
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </ScrollView>

            {/* Dots indicator */}
            <View style={styles.dotsContainer}>
                {commutingCities.map((_, index) => (
                    <View key={index} style={styles.dot} />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginVertical: 16,
    },
    carouselContent: {
        paddingHorizontal: CARD_MARGIN,
        paddingVertical: 8,
    },
    cityCard: {
        width: CARD_WIDTH,
        marginHorizontal: CARD_MARGIN,
        borderRadius: 20,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    cardContent: {
        padding: 20,
        minHeight: 180,
        justifyContent: 'space-between',
    },
    cityHeader: {
        marginBottom: 16,
    },
    cityName: {
        fontFamily: 'PlayfairDisplay_700Bold',
        fontSize: 24,
        color: 'white',
        marginBottom: 4,
    },
    cityCountry: {
        fontFamily: 'Inter_400Regular',
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.8)',
        marginBottom: 8,
    },
    cityTime: {
        fontFamily: 'JetBrainsMono_400Regular',
        fontSize: 16,
        color: 'white',
    },
    timePeriod: {
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.7)',
    },
    stationsContainer: {
        minHeight: 60,
    },
    stationChip: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        borderRadius: 20,
        paddingVertical: 8,
        paddingHorizontal: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.2)',
    },
    stationChipText: {
        fontFamily: 'Inter_500Medium',
        fontSize: 12,
        color: 'white',
        textAlign: 'center',
    },
    noStationsText: {
        fontFamily: 'Inter_400Regular',
        fontSize: 12,
        color: 'rgba(255, 255, 255, 0.6)',
        textAlign: 'center',
        paddingVertical: 16,
    },
    dotsContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 16,
    },
    dot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: COLORS.primary,
        opacity: 0.5,
        marginHorizontal: 3,
    },
    emptyContainer: {
        padding: 32,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        marginVertical: 16,
    },
    emptyText: {
        ...TYPOGRAPHY.body,
        textAlign: 'center',
        marginBottom: 8,
    },
    emptySubtext: {
        ...TYPOGRAPHY.caption,
        textAlign: 'center',
        color: COLORS.secondaryText,
    },
});