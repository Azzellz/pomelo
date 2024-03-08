export interface MikanamiRSS {
    rss: {
        $: {
            version: string;
        };
        channel: MikanamiChannel[];
    };
}

export interface MikanamiChannel {
    title: string[];
    link: string[];
    description: string[];
    item: MikanamiItem[];
}

export interface MikanamiItem {
    guid: GUIDElement[];
    link: string[];
    title: string[];
    description: string[];
    torrent: TorrentElement[];
    enclosure: EnclosureElement[];
}

interface EnclosureElement {
    $: Enclosure;
}

interface Enclosure {
    type: Type;
    length: string;
    url: string;
}

enum Type {
    ApplicationXBittorrent = "application/x-bittorrent",
}

interface GUIDElement {
    _: string;
    $: GUID;
}

interface GUID {
    isPermaLink: string;
}

interface TorrentElement {
    $: Torrent;
    link: string[];
    contentLength: string[];
    pubDate: string[];
}

interface Torrent {
    xmlns: string;
}

