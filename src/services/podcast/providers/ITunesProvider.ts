import { PodcastSearchResult } from '../../../types/podcast';
import { ITUNES_SEARCH_URL } from '../../../config/podcastConfig';

export interface PodcastSearchProvider {
    search(query: string, limit?: number): Promise<PodcastSearchResult[]>;
}

export class ITunesProvider implements PodcastSearchProvider {
    async search(query: string, limit = 20): Promise<PodcastSearchResult[]> {
        try {
            const url = `${ITUNES_SEARCH_URL}?term=${encodeURIComponent(query)}&media=podcast&limit=${limit}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`iTunes search failed with status ${response.status}`);
            }
            
            const data = await response.json();
            
            if (!data.results || !Array.isArray(data.results)) {
                return [];
            }

            return data.results.map((result: any) => ({
                title: result.collectionName || '',
                author: result.artistName || '',
                artworkUrl: result.artworkUrl600 || result.artworkUrl100 || '',
                feedUrl: result.feedUrl || '',
                genres: result.primaryGenreName ? [result.primaryGenreName] : [],
                episodeCount: result.trackCount,
                source: 'itunes'
            }));
        } catch (error) {
            console.error('iTunesProvider search error:', error);
            return [];
        }
    }
}
