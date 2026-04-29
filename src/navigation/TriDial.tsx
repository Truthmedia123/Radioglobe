import React, { useRef, useEffect } from 'react';
import { StyleSheet, View, TouchableOpacity, Animated, Dimensions, Text } from 'react-native';
import PagerView from 'react-native-pager-view';
import { useNavigationStore } from '../store/navigationStore';
import { GlobeIcon } from '../components/icons/GlobeIcon';
import { DialIcon } from '../components/icons/DialIcon';
import { ArchiveIcon } from '../components/icons/ArchiveIcon';
import { COLORS } from '../constants/theme';

const { width } = Dimensions.get('window');

interface TriDialProps {
    discoveryScreen: React.ReactNode;
    playerScreen: React.ReactNode;
    archiveScreen: React.ReactNode;
    podcastScreen: React.ReactNode;
}

export const TriDial: React.FC<TriDialProps> = ({
    discoveryScreen,
    playerScreen,
    archiveScreen,
    podcastScreen,
}) => {
    const { activeTab, setActiveTab } = useNavigationStore();
    const pagerRef = useRef<PagerView>(null);
    const glowAnimations = [
        useRef(new Animated.Value(0)).current,
        useRef(new Animated.Value(0)).current,
        useRef(new Animated.Value(0)).current,
        useRef(new Animated.Value(0)).current,
    ];

    // Start glow animation for active tab
    useEffect(() => {
        const activeIndex = activeTab;
        glowAnimations.forEach((anim, index) => {
            if (index === activeIndex) {
                Animated.loop(
                    Animated.sequence([
                        Animated.timing(anim, {
                            toValue: 1,
                            duration: 800,
                            useNativeDriver: true,
                        }),
                        Animated.timing(anim, {
                            toValue: 0,
                            duration: 800,
                            useNativeDriver: true,
                        }),
                    ])
                ).start();
            } else {
                anim.setValue(0);
            }
        });
    }, [activeTab]);

    const handlePageSelected = (event: any) => {
        const position = event.nativeEvent.position;
        setActiveTab(position);
    };

    const handleTabPress = (index: number) => {
        setActiveTab(index);
        pagerRef.current?.setPage(index);
    };

    const opacityInterpolations = glowAnimations.map(anim =>
        anim.interpolate({
            inputRange: [0, 1],
            outputRange: [0.3, 1],
        })
    );

    return (
        <View style={styles.container}>
            <PagerView
                ref={pagerRef}
                style={styles.pager}
                initialPage={activeTab}
                onPageSelected={handlePageSelected}
                removeClippedSubviews={false}
            >
                <View key="1">{discoveryScreen}</View>
                <View key="2">{playerScreen}</View>
                <View key="3">{archiveScreen}</View>
                <View key="4">{podcastScreen}</View>
            </PagerView>

            <View style={styles.tabBar}>
                {['Discovery', 'Player', 'Archive', 'Podcasts'].map((label, index) => (
                    <TouchableOpacity
                        key={label}
                        style={styles.tabButton}
                        onPress={() => handleTabPress(index)}
                        activeOpacity={0.7}
                    >
                        <View style={styles.iconContainer}>
                            {index === 0 && (
                                <>
                                    <Animated.View
                                        style={[
                                            styles.glow,
                                            {
                                                opacity: opacityInterpolations[index],
                                                backgroundColor: COLORS.primary,
                                            },
                                        ]}
                                    />
                                    <GlobeIcon active={activeTab === index} />
                                </>
                            )}
                            {index === 1 && (
                                <>
                                    <Animated.View
                                        style={[
                                            styles.glow,
                                            {
                                                opacity: opacityInterpolations[index],
                                                backgroundColor: COLORS.primary,
                                            },
                                        ]}
                                    />
                                    <DialIcon active={activeTab === index} />
                                </>
                            )}
                            {index === 2 && (
                                <>
                                    <Animated.View
                                        style={[
                                            styles.glow,
                                            {
                                                opacity: opacityInterpolations[index],
                                                backgroundColor: COLORS.primary,
                                            },
                                        ]}
                                    />
                                    <ArchiveIcon active={activeTab === index} />
                                </>
                            )}
                            {index === 3 && (
                                <>
                                    <Animated.View
                                        style={[
                                            styles.glow,
                                            {
                                                opacity: opacityInterpolations[index],
                                                backgroundColor: COLORS.primary,
                                            },
                                        ]}
                                    />
                                    <Text style={{fontSize: 24}}>🎧</Text>
                                </>
                            )}
                        </View>
                    </TouchableOpacity>
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: COLORS.background,
    },
    pager: {
        flex: 1,
    },
    tabBar: {
        flexDirection: 'row',
        height: 80,
        backgroundColor: COLORS.surface,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255, 255, 255, 0.05)',
        paddingHorizontal: 20,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    tabButton: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 12,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
    },
    glow: {
        position: 'absolute',
        width: 48,
        height: 48,
        borderRadius: 24,
        opacity: 0.3,
    },
});