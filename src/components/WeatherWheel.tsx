import React, { useState } from 'react';
import {
    StyleSheet,
    View,
    Text,
    TouchableOpacity,
    ActivityIndicator,
    ScrollView,
} from 'react-native';
import Svg, { Circle, Path, G, Text as SvgText } from 'react-native-svg';
import { useWeatherSync } from '../hooks/useWeatherSync';
import { COLORS, TYPOGRAPHY } from '../constants/theme';
import { Station } from '../api/radioBrowser';
import { audioService } from '../services/audioService';
import { usePlayerStore } from '../store/playerStore';
import { useNavigationStore } from '../store/navigationStore';

const WEATHER_SEGMENTS = [
    { code: 0, label: 'Clear', icon: '☀️', tags: ['pop', 'tropical house'] },
    { code: 1, label: 'Cloudy', icon: '⛅', tags: ['ambient', 'chillout'] },
    { code: 45, label: 'Fog', icon: '🌫️', tags: ['experimental', 'ambient'] },
    { code: 61, label: 'Rain', icon: '🌧️', tags: ['jazz', 'lounge'] },
    { code: 71, label: 'Snow', icon: '❄️', tags: ['classical', 'lullaby'] },
    { code: 95, label: 'Storm', icon: '⛈️', tags: ['ambient', 'dark'] },
];

export const WeatherWheel: React.FC = () => {
    const weatherInfo = useWeatherSync();
    const [selectedSegment, setSelectedSegment] = useState<number | null>(null);
    const [stations, setStations] = useState<Station[]>([]);
    const [loadingStations, setLoadingStations] = useState(false);
    const { setCurrentStation } = usePlayerStore();
    const { setActiveTab } = useNavigationStore();

    const handleSegmentPress = (segmentCode: number, tags: string[]) => {
        setSelectedSegment(segmentCode);
        fetchStationsForTags(tags);
    };

    const fetchStationsForTags = async (tags: string[]) => {
        setLoadingStations(true);
        try {
            // In a real implementation, we would call radioBrowser.searchStations with tags
            await new Promise(resolve => setTimeout(resolve, 800));

            const mockStations: Station[] = [
                {
                    stationuuid: `weather-${tags[0]}-1`,
                    name: `${tags[0]} Radio`,
                    url: 'https://stream.example.com/weather1',
                    url_resolved: 'https://stream.example.com/weather1',
                    homepage: '',
                    favicon: '',
                    tags: tags.join(','),
                    country: 'Global',
                    countrycode: 'WW',
                    state: '',
                    language: 'English',
                    votes: 50,
                    lastcheckok: 1,
                    lastchecktime: '',
                    lastcheckoktime: '',
                    lastlocalchecktime: '',
                    clicktimestamp: '',
                    clickcount: 500,
                    clicktrend: 5,
                    ssl_error: 0,
                    geo_lat: null,
                    geo_long: null,
                    has_extended_info: false,
                },
                {
                    stationuuid: `weather-${tags[0]}-2`,
                    name: `${tags[1]} Station`,
                    url: 'https://stream.example.com/weather2',
                    url_resolved: 'https://stream.example.com/weather2',
                    homepage: '',
                    favicon: '',
                    tags: tags.join(','),
                    country: 'Global',
                    countrycode: 'WW',
                    state: '',
                    language: 'English',
                    votes: 30,
                    lastcheckok: 1,
                    lastchecktime: '',
                    lastcheckoktime: '',
                    lastlocalchecktime: '',
                    clicktimestamp: '',
                    clickcount: 300,
                    clicktrend: 3,
                    ssl_error: 0,
                    geo_lat: null,
                    geo_long: null,
                    has_extended_info: false,
                },
            ];

            setStations(mockStations);
        } catch (error) {
            console.error('Failed to fetch weather stations:', error);
        } finally {
            setLoadingStations(false);
        }
    };

    const handleStationPress = (station: Station) => {
        setCurrentStation(station);
        setActiveTab(1);
        audioService.play(station.url_resolved);
    };

    const wheelSize = 200;
    const center = wheelSize / 2;
    const radius = wheelSize * 0.4;
    const segmentAngle = (2 * Math.PI) / WEATHER_SEGMENTS.length;

    return (
        <View style={styles.container}>
            <View style={styles.wheelSection}>
                <View style={styles.wheelHeader}>
                    <Text style={styles.wheelTitle}>Weather Sync</Text>
                    {weatherInfo.isLoading ? (
                        <ActivityIndicator size="small" color={COLORS.primary} />
                    ) : (
                        <Text style={styles.currentWeather}>
                            {weatherInfo.location?.city || 'Unknown'}: {weatherInfo.temperature}°C • {weatherInfo.description}
                        </Text>
                    )}
                </View>

                <View style={styles.wheelContainer}>
                    <Svg width={wheelSize} height={wheelSize}>
                        {/* Background circle */}
                        <Circle
                            cx={center}
                            cy={center}
                            r={radius}
                            fill={COLORS.surface}
                            stroke={COLORS.secondaryText}
                            strokeWidth={1}
                        />

                        {/* Segments */}
                        {WEATHER_SEGMENTS.map((segment, index) => {
                            const startAngle = index * segmentAngle - Math.PI / 2;
                            const endAngle = startAngle + segmentAngle;
                            const isSelected = selectedSegment === segment.code ||
                                (!selectedSegment && weatherInfo.weatherCode === segment.code);

                            // Calculate arc path for segment
                            const x1 = center + radius * Math.cos(startAngle);
                            const y1 = center + radius * Math.sin(startAngle);
                            const x2 = center + radius * Math.cos(endAngle);
                            const y2 = center + radius * Math.sin(endAngle);

                            const largeArcFlag = segmentAngle > Math.PI ? 1 : 0;

                            const pathData = [
                                `M ${center} ${center}`,
                                `L ${x1} ${y1}`,
                                `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
                                'Z',
                            ].join(' ');

                            // Label position
                            const labelAngle = startAngle + segmentAngle / 2;
                            const labelRadius = radius * 0.7;
                            const labelX = center + labelRadius * Math.cos(labelAngle);
                            const labelY = center + labelRadius * Math.sin(labelAngle);

                            return (
                                <G key={segment.code}>
                                    <Path
                                        d={pathData}
                                        fill={isSelected ? COLORS.primary : 'rgba(255, 255, 255, 0.05)'}
                                        stroke={COLORS.secondaryText}
                                        strokeWidth={1}
                                        onPress={() => handleSegmentPress(segment.code, segment.tags)}
                                    />
                                    <SvgText
                                        x={labelX}
                                        y={labelY}
                                        textAnchor="middle"
                                        alignmentBaseline="middle"
                                        fontSize="16"
                                        fill={isSelected ? COLORS.background : COLORS.text}
                                        onPress={() => handleSegmentPress(segment.code, segment.tags)}
                                    >
                                        {segment.icon}
                                    </SvgText>
                                </G>
                            );
                        })}

                        {/* Center circle */}
                        <Circle
                            cx={center}
                            cy={center}
                            r={radius * 0.3}
                            fill={COLORS.background}
                            stroke={COLORS.primary}
                            strokeWidth={2}
                        />

                        {/* Current weather indicator */}
                        {!weatherInfo.isLoading && (
                            <Circle
                                cx={center}
                                cy={center}
                                r={radius * 0.15}
                                fill={COLORS.primary}
                            />
                        )}
                    </Svg>

                    <TouchableOpacity
                        style={styles.currentButton}
                        onPress={() => {
                            setSelectedSegment(null);
                            fetchStationsForTags(weatherInfo.moodTags);
                        }}
                    >
                        <Text style={styles.currentButtonText}>Use Current Weather</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Stations list */}
            <View style={styles.stationsSection}>
                <Text style={styles.stationsTitle}>
                    {selectedSegment !== null
                        ? `Stations for ${WEATHER_SEGMENTS.find(s => s.code === selectedSegment)?.label || 'Selected Weather'}`
                        : `Stations for Current Weather (${weatherInfo.description})`
                    }
                </Text>

                {loadingStations ? (
                    <ActivityIndicator size="large" color={COLORS.primary} style={styles.loader} />
                ) : stations.length > 0 ? (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {stations.map(station => (
                            <TouchableOpacity
                                key={station.stationuuid}
                                style={styles.stationCard}
                                onPress={() => handleStationPress(station)}
                            >
                                <Text style={styles.stationCardName} numberOfLines={2}>
                                    {station.name}
                                </Text>
                                <Text style={styles.stationCardTags}>
                                    {station.tags}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                ) : (
                    <Text style={styles.noStationsText}>
                        Select a weather type to see matching stations
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
    wheelSection: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 20,
        marginBottom: 16,
    },
    wheelHeader: {
        marginBottom: 16,
    },
    wheelTitle: {
        ...TYPOGRAPHY.h2,
        fontSize: 20,
        marginBottom: 8,
    },
    currentWeather: {
        ...TYPOGRAPHY.caption,
        color: COLORS.secondaryText,
    },
    wheelContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
    },
    currentButton: {
        marginTop: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: COLORS.primary,
        borderRadius: 20,
    },
    currentButtonText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.background,
        fontWeight: '600',
    },
    stationsSection: {
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 20,
    },
    stationsTitle: {
        ...TYPOGRAPHY.body,
        fontSize: 16,
        marginBottom: 16,
    },
    loader: {
        marginVertical: 20,
    },
    stationCard: {
        width: 140,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderRadius: 12,
        padding: 16,
        marginRight: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
    },
    stationCardName: {
        ...TYPOGRAPHY.body,
        fontSize: 14,
        marginBottom: 8,
        minHeight: 40,
    },
    stationCardTags: {
        ...TYPOGRAPHY.caption,
        color: COLORS.primary,
        fontSize: 10,
    },
    noStationsText: {
        ...TYPOGRAPHY.caption,
        color: COLORS.secondaryText,
        textAlign: 'center',
        paddingVertical: 20,
    },
});