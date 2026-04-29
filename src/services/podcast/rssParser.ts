import { PodcastEpisode } from '../../types/podcast';
import RSSParser from 'react-native-rss-parser';

export async function fetchEpisodesFromFeed(feedUrl: string): Promise<PodcastEpisode[]> {
    try {
        const response = await fetch(feedUrl);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const xmlText = await response.text();
        const parsed = await RSSParser.parse(xmlText);

        const episodes: PodcastEpisode[] = parsed.items.map((item: any) => {
            // Extract audio URL from enclosure
            let audioUrl = '';
            if (item.enclosures && item.enclosures.length > 0) {
                const audioEnclosure = item.enclosures.find((enc: any) =>
                    enc.type?.includes('audio') || enc.url?.endsWith('.mp3') || enc.url?.endsWith('.m4a')
                );
                audioUrl = audioEnclosure?.url || '';
            } else if (item.enclosure?.url) {
                audioUrl = item.enclosure.url;
            }

            // Parse duration from itunes:duration
            let durationSeconds = 0;
            const durationStr = item.itunes?.duration || item.duration;
            if (durationStr) {
                durationSeconds = parseDurationToSeconds(durationStr);
            }

            // Extract artwork
            let artworkUrl = item.itunes?.image?.href || '';
            if (!artworkUrl && parsed.image?.url) {
                artworkUrl = parsed.image.url;
            }

            // Strip HTML from description
            const rawDescription = item.description || item.content || '';
            const description = stripHtml(rawDescription).substring(0, 200);

            return {
                guid: item.id || item.link || audioUrl,
                title: item.title || 'Untitled',
                description,
                audioUrl,
                publishDate: item.published || item.pubDate || new Date().toISOString(),
                durationSeconds,
                artworkUrl,
                podcastTitle: parsed.title || 'Unknown Podcast',
            };
        });

        return episodes.filter(ep => ep.audioUrl); // Only episodes with audio
    } catch (error) {
        console.error('Failed to parse RSS feed:', error);
        return [];
    }
}

function parseDurationToSeconds(duration: string): number {
    if (!duration) return 0;
    // Format could be "HH:MM:SS", "MM:SS", or just seconds as a number
    if (typeof duration === 'number') {
        return duration;
    }
    const parts = duration.split(':').map(Number);
    if (parts.length === 3) {
        // HH:MM:SS
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
    } else if (parts.length === 2) {
        // MM:SS
        return parts[0] * 60 + parts[1];
    } else if (parts.length === 1) {
        // seconds
        return parseInt(duration, 10) || 0;
    }
    return 0;
}

function stripHtml(html: string): string {
    return html
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}