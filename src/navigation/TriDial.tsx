import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Archive, Compass, Disc3, Podcast } from 'lucide-react-native';
import { MiniPlayer } from '../components/MiniPlayer';
import { COLORS, RADIUS } from '../constants/theme';
import { useNavigationStore } from '../store/navigationStore';

interface TriDialProps {
  discoveryScreen: React.ReactNode;
  playerScreen: React.ReactNode;
  archiveScreen: React.ReactNode;
  podcastScreen: React.ReactNode;
}

const TABS = [
  { label: 'Explore', Icon: Compass },
  { label: 'Player', Icon: Disc3 },
  { label: 'Library', Icon: Archive },
  { label: 'Podcasts', Icon: Podcast },
];

export const TriDial: React.FC<TriDialProps> = ({
  discoveryScreen,
  playerScreen,
  archiveScreen,
  podcastScreen,
}) => {
  const { activeTab, setActiveTab } = useNavigationStore();
  const screens = [discoveryScreen, playerScreen, archiveScreen, podcastScreen];

  return (
    <View style={styles.container}>
      <View style={styles.screen}>{screens[activeTab]}</View>
      <View style={styles.chrome}>
        <MiniPlayer />
        <View style={styles.tabBar}>
          {TABS.map(({ label, Icon }, index) => {
            const isActive = activeTab === index;
            return (
              <TouchableOpacity
                key={label}
                style={styles.tabButton}
                onPress={() => setActiveTab(index)}
                activeOpacity={0.82}
              >
                <View style={[styles.iconPill, isActive && styles.iconPillActive]}>
                  <Icon size={22} color={isActive ? COLORS.black : COLORS.secondaryText} strokeWidth={2.3} />
                </View>
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]} numberOfLines={1}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  screen: {
    flex: 1,
    overflow: 'hidden',
  },
  chrome: {
    backgroundColor: COLORS.background,
    paddingTop: 6,
    paddingBottom: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  tabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    paddingVertical: 4,
  },
  iconPill: {
    width: 50,
    height: 34,
    borderRadius: RADIUS.round,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconPillActive: {
    backgroundColor: COLORS.primary,
  },
  tabLabel: {
    fontFamily: 'Inter_500Medium',
    fontSize: 11,
    color: COLORS.mutedText,
  },
  tabLabelActive: {
    color: COLORS.text,
  },
});
