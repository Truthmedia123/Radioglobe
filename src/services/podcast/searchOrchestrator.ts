import { PodcastSearchResult } from '../../types/podcast';
import { ITunesProvider } from './providers/ITunesProvider';
import { PodcastIndexProvider } from './providers/PodcastIndexProvider';
import { GpodderProvider } from './providers/GpodderProvider';
import { PODCASTINDEX_API_KEY, PODCASTINDEX_API_SECRET } from '../../config/podcastConfig';

const itunesProvider = new ITunesProvider();
const podcastIndexProvider = new PodcastIndexProvider(PODCASTINDEX_API_KEY, PODCASTINDEX_API_SECRET);
const gpodderProvider = new GpodderProvider();

function normalizeFeedUrl(url: string): string {
    return url.toLowerCase().trim().replace(/\/$/, '').replace(/^https?:\/\/(www\.)?/, '');
}

export async function searchAllProviders(query: string, limit = 20): Promise<PodcastSearchResult[]> {
    if (!query.trim()) {
        return [];
    }

    const promises = [
        itunesProvider.search(query, limit),
        podcastIndexProvider.search(query, limit),
        gpodderProvider.search(query, limit)
    ];

    const results = await Promise.allSettled(promises);
    
    let allResults: PodcastSearchResult[] = [];

    results.forEach((result, index) => {
        if (result.status === 'fulfilled') {
            allResults = allResults.concat(result.value);
        } else {
            console.error(`Provider at index ${index} failed:`, result.reason);
        }
    });

    // Deduplicate by normalized feed URL
    const seenUrls = new Set<string>();
    const deduplicatedResults: PodcastSearchResult[] = [];

    for (const item of allResults) {
        if (!item.feedUrl) continue;
        
        const normalized = normalizeFeedUrl(item.feedUrl);
        if (!seenUrls.has(normalized)) {
            seenUrls.add(normalized);
            deduplicatedResults.push(item);
        }
    }

    return deduplicatedResults;
}
