import { PodcastIndexClient } from '@mj-kiwi/podcast-index-api';
import { PodcastSearchResult } from '../../../types/podcast';

export class PodcastIndexProvider {
    private client: any;

    constructor(apiKey: string, apiSecret: string) {
        // Only instantiate if keys are provided to avoid crashes
        if (apiKey && apiSecret && apiKey !== 'YOUR_API_KEY') {
            this.client = new PodcastIndexClient({
                authKey: apiKey,
                secretKey: apiSecret
            });
        }
    }

    async search(query: string, limit = 20): Promise<PodcastSearchResult[]> {
        if (!this.client) {
            console.warn('PodcastIndexClient not initialized: API keys missing');
            return [];
        }

        try {
            const response = await this.client.searchPodcasts({ q: query, max: limit });

            if (!response || !response.feeds || !Array.isArray(response.feeds)) {
                return [];
            }

            return response.feeds.map((feed: any) => {
                let genres: string[] = [];
                if (feed.categories) {
                    // categories might be an object mapping id to name, e.g., {"1": "Arts"}
                    genres = Object.values(feed.categories);
                }

                return {
                    title: feed.title || '',
                    author: feed.author || '',
                    artworkUrl: feed.artwork || feed.image || '',
                    feedUrl: feed.url || '',
                    genres,
                    episodeCount: feed.episodeCount,
                    source: 'podcastindex'
                };
            });
        } catch (error) {
            console.error('PodcastIndexProvider search error:', error);
            return [];
        }
    }
}
