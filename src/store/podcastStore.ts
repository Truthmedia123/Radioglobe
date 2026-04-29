import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PodcastEpisode } from '../types/podcast';
import { fetchEpisodesFromFeed } from '../services/podcast/rssParser';

interface PodcastState {
    subscribedFeeds: string[];
    episodes: Record<string, PodcastEpisode[]>; // keyed by feed URL
    loading: boolean;
    selectedFeedUrl: string | null;

    // Actions
    loadSubscriptions: () => Promise<void>;
    subscribe: (feedUrl: string) => Promise<void>;
    unsubscribe: (feedUrl: string) => Promise<void>;
    fetchEpisodes: (feedUrl: string) => Promise<PodcastEpisode[]>;
    setSelectedFeedUrl: (feedUrl: string | null) => void;
    clearEpisodes: (feedUrl: string) => void;
}

export const usePodcastStore = create<PodcastState>()(
    persist(
        (set, get) => ({
            subscribedFeeds: [],
            episodes: {},
            loading: false,
            selectedFeedUrl: null,

            loadSubscriptions: async () => {
                // Already loaded via persist, but we can trigger a re-fetch if needed
                console.log('Subscriptions loaded from storage');
            },

            subscribe: async (feedUrl: string) => {
                const { subscribedFeeds } = get();
                if (subscribedFeeds.includes(feedUrl)) {
                    return;
                }

                set({ loading: true });
                try {
                    // Add to subscriptions
                    const updatedFeeds = [...subscribedFeeds, feedUrl];
                    set({ subscribedFeeds: updatedFeeds });

                    // Fetch episodes for this feed
                    await get().fetchEpisodes(feedUrl);
                } catch (error) {
                    console.error('Failed to subscribe to podcast:', error);
                } finally {
                    set({ loading: false });
                }
            },

            unsubscribe: async (feedUrl: string) => {
                const { subscribedFeeds, episodes } = get();
                const updatedFeeds = subscribedFeeds.filter(url => url !== feedUrl);
                const updatedEpisodes = { ...episodes };
                delete updatedEpisodes[feedUrl];

                set({
                    subscribedFeeds: updatedFeeds,
                    episodes: updatedEpisodes,
                });
            },

            fetchEpisodes: async (feedUrl: string) => {
                const { episodes } = get();
                set({ loading: true });
                try {
                    const fetchedEpisodes = await fetchEpisodesFromFeed(feedUrl);
                    const updatedEpisodes = {
                        ...episodes,
                        [feedUrl]: fetchedEpisodes,
                    };
                    set({ episodes: updatedEpisodes });
                    return fetchedEpisodes;
                } catch (error) {
                    console.error('Failed to fetch episodes:', error);
                    return [];
                } finally {
                    set({ loading: false });
                }
            },

            setSelectedFeedUrl: (feedUrl: string | null) => {
                set({ selectedFeedUrl: feedUrl });
            },

            clearEpisodes: (feedUrl: string) => {
                const { episodes } = get();
                const updatedEpisodes = { ...episodes };
                delete updatedEpisodes[feedUrl];
                set({ episodes: updatedEpisodes });
            },
        }),
        {
            name: 'podcast-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                subscribedFeeds: state.subscribedFeeds,
                episodes: state.episodes,
            }),
        }
    )
);