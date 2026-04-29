import { PodcastSearchResult } from '../../../types/podcast';
import { GPODDER_BASE_URL } from '../../../config/podcastConfig';

export class GpodderProvider {
    async search(query: string, limit = 20): Promise<PodcastSearchResult[]> {
        try {
            const url = `${GPODDER_BASE_URL}/search.json?q=${encodeURIComponent(query)}`;
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`gpodder search failed with status ${response.status}`);
            }

            const data = await response.json();
            
            if (!Array.isArray(data)) {
                return [];
            }

            // Gpodder doesn't do native limit, so slice it
            const limitedData = data.slice(0, limit);

            return limitedData.map((result: any) => {
                let author = '';
                if (result.title && result.title.includes(' - ')) {
                    author = result.title.split(' - ')[0].trim();
                }

                return {
                    title: result.title || '',
                    author: author,
                    artworkUrl: result.scaled_logo_url || result.logo_url || '',
                    feedUrl: result.url || '',
                    genres: [],
                    source: 'gpodder'
                };
            });
        } catch (error) {
            console.error('GpodderProvider search error:', error);
            return [];
        }
    }
}
