declare module 'react-native-rss-parser' {
    export interface RSSItem {
        title: string;
        description: string;
        content: string;
        link: string;
        authors: Array<{ name: string }>;
        categories: string[];
        published: string;
        enclosures: Array<{
            url: string;
            length?: string;
            type?: string;
        }>;
        itunes?: {
            duration?: string;
            image?: string;
            summary?: string;
        };
    }

    export interface RSSFeed {
        title: string;
        description: string;
        link: string;
        items: RSSItem[];
        image?: {
            url: string;
        };
    }

    export function parse(feedUrl: string): Promise<RSSFeed>;
}