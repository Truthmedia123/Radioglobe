import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { PodcastEpisode } from '../types/podcast';
import { fetchEpisodesFromFeed } from '../services/podcast/rssParser';
import { documentDirectory, getInfoAsync, makeDirectoryAsync, downloadAsync, deleteAsync } from 'expo-file-system/legacy';

interface EpisodeProgress {
    positionMillis: number;
    durationMillis: number;
    lastPlayed: string;
    episode: PodcastEpisode;
}

interface DownloadInfo {
    localPath: string | null;
    downloadedAt: string;
    status: 'idle' | 'downloading' | 'complete' | 'error';
    progress: number;
    errorMessage?: string;
}

interface PodcastState {
    subscribedFeeds: string[];
    episodes: Record<string, PodcastEpisode[]>; // keyed by feed URL
    loading: boolean;
    selectedFeedUrl: string | null;
    episodeProgress: Record<string, EpisodeProgress>;
    downloadedEpisodes: Record<string, DownloadInfo>;

    // Actions
    loadSubscriptions: () => Promise<void>;
    subscribe: (feedUrl: string) => Promise<void>;
    unsubscribe: (feedUrl: string) => Promise<void>;
    fetchEpisodes: (feedUrl: string) => Promise<PodcastEpisode[]>;
    setSelectedFeedUrl: (feedUrl: string | null) => void;
    clearEpisodes: (feedUrl: string) => void;
    updateProgress: (episode: PodcastEpisode, positionMillis: number, durationMillis: number) => void;
    getProgress: (guid: string) => EpisodeProgress | null;
    downloadEpisode: (episode: PodcastEpisode) => Promise<string | null>;
    removeDownload: (guid: string) => Promise<void>;
    getDownloadPath: (guid: string) => string | null;
}

export const usePodcastStore = create<PodcastState>()(
    persist(
        (set, get) => ({
            subscribedFeeds: [],
            episodes: {},
            loading: false,
            selectedFeedUrl: null,
            episodeProgress: {},
            downloadedEpisodes: {},

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

            updateProgress: (episode: PodcastEpisode, positionMillis: number, durationMillis: number) => {
                const { episodeProgress } = get();
                set({
                    episodeProgress: {
                        ...episodeProgress,
                        [episode.guid]: {
                            positionMillis,
                            durationMillis,
                            lastPlayed: new Date().toISOString(),
                            episode,
                        },
                    },
                });
            },

            getProgress: (guid: string) => {
                return get().episodeProgress[guid] || null;
            },

            downloadEpisode: async (episode: PodcastEpisode) => {
                const guid = episode.guid;
                if (!guid || !episode.audioUrl) return null;

                set((state) => ({
                    downloadedEpisodes: {
                        ...state.downloadedEpisodes,
                        [guid]: {
                            localPath: null,
                            downloadedAt: new Date().toISOString(),
                            status: 'downloading',
                            progress: 0,
                        }
                    }
                }));

                try {
                    const dirUri = (documentDirectory || '') + 'podcasts/';
                    const dirInfo = await getInfoAsync(dirUri);
                    if (!dirInfo.exists) {
                        await makeDirectoryAsync(dirUri, { intermediates: true });
                    }

                    const safeGuid = guid.replace(/[^a-zA-Z0-9]/g, '_');
                    const fileUri = dirUri + safeGuid + '.mp3';

                    const downloadResumptionData = await downloadAsync(episode.audioUrl, fileUri);
                    if (downloadResumptionData.status === 200) {
                        set((state) => ({
                            downloadedEpisodes: {
                                ...state.downloadedEpisodes,
                                [guid]: {
                                    localPath: downloadResumptionData.uri,
                                    downloadedAt: new Date().toISOString(),
                                    status: 'complete',
                                    progress: 100,
                                }
                            }
                        }));
                        return downloadResumptionData.uri;
                    } else {
                        throw new Error(`Download failed with status ${downloadResumptionData.status}`);
                    }
                } catch (error: any) {
                    console.error('Download failed:', error);
                    set((state) => ({
                        downloadedEpisodes: {
                            ...state.downloadedEpisodes,
                            [guid]: {
                                localPath: null,
                                downloadedAt: new Date().toISOString(),
                                status: 'error',
                                progress: -1,
                                errorMessage: error.message || 'Download failed',
                            }
                        }
                    }));
                    return null;
                }
            },

            removeDownload: async (guid: string) => {
                const { downloadedEpisodes } = get();
                const info = downloadedEpisodes[guid];
                if (info && info.localPath) {
                    try {
                        await deleteAsync(info.localPath, { idempotent: true });
                    } catch (e) {
                        console.error('Failed to delete file', e);
                    }
                    const updated = { ...downloadedEpisodes };
                    delete updated[guid];
                    set({ downloadedEpisodes: updated });
                }
            },

            getDownloadPath: (guid: string) => {
                const info = get().downloadedEpisodes[guid];
                return info && info.status === 'complete' ? info.localPath : null;
            },
        }),
        {
            name: 'podcast-storage',
            storage: createJSONStorage(() => AsyncStorage),
            partialize: (state) => ({
                subscribedFeeds: state.subscribedFeeds,
                episodes: state.episodes,
                episodeProgress: state.episodeProgress,
                downloadedEpisodes: state.downloadedEpisodes,
            }),
        }
    )
);