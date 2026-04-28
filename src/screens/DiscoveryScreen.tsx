import React from 'react';
import { StyleSheet, View, Text, SafeAreaView, ScrollView } from 'react-native';
import { COLORS, TYPOGRAPHY } from '../constants/theme';
import { CommuteCarousel } from '../components/CommuteCarousel';
import { WeatherWheel } from '../components/WeatherWheel';
import { LanguageImmersion } from '../components/LanguageImmersion';

export const DiscoveryScreen: React.FC = () => {
    return (
        <SafeAreaView style={styles.container}>
            <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
                <View style={styles.header}>
                    <Text style={styles.title}>Discovery</Text>
                    <Text style={styles.subtitle}>Explore radio by time, weather, and language</Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Morning Commute Mode</Text>
                    <Text style={styles.sectionDescription}>
                        Stations from cities where it's currently morning or evening rush hour.
                    </Text>
                    <CommuteCarousel />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Weather Sync</Text>
                    <Text style={styles.sectionDescription}>
                        Filter stations based on your local weather mood.
                    </Text>
                    <WeatherWheel />
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Language Immersion</Text>
                    <Text style={styles.sectionDescription}>
                        Listen to stations in a language you're learning.
                    </Text>
                    <LanguageImmersion />
                </View>
            </ScrollView>
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
        padding: 24,
        paddingBottom: 100,
    },
    header: {
        marginBottom: 32,
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
    section: {
        marginBottom: 32,
        backgroundColor: COLORS.surface,
        borderRadius: 16,
        padding: 20,
    },
    sectionTitle: {
        ...TYPOGRAPHY.h2,
        fontSize: 20,
        marginBottom: 8,
    },
    sectionDescription: {
        ...TYPOGRAPHY.body,
        fontSize: 14,
        color: COLORS.secondaryText,
        marginBottom: 16,
    },
});