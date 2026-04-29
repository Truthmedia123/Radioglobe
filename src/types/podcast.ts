export interface PodcastSearchResult {
    title: string;
    author: string;
    artworkUrl: string;
    feedUrl: string;
    genres: string[];
    episodeCount?: number;
    source: 'itunes' | 'podcastindex' | 'gpodder';
}

export interface PodcastEpisode {
    guid: string;
    title: string;
    description: string;
    audioUrl: string;
    publishDate: string;
    durationSeconds: number;
    artworkUrl: string;
    podcastTitle: string;
}
