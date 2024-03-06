export interface Resource {
    rss: RSS;
}

export interface Rule {
    name: string;
    accept?: RegExp[] | ((content: string) => boolean);
    reject?: RegExp[] | ((content: string) => boolean);
    onAccepted?: (item: Item) => void;
    onRejected?: (item: Item) => void;
}

export interface RSS {
    $: RSSClass;
    channel: Channel[];
}

export interface RSSClass {
    version: string;
}

export interface Channel {
    title: string[];
    link: string[];
    description: string[];
    item: Item[];
}

export interface Item {
    guid: GUIDElement[];
    link: string[];
    title: string[];
    description: string[];
    torrent: TorrentElement[];
    enclosure: EnclosureElement[];
}

export interface EnclosureElement {
    $: Enclosure;
}

export interface Enclosure {
    type: Type;
    length: string;
    url: string;
}

export enum Type {
    ApplicationXBittorrent = "application/x-bittorrent",
}

export interface GUIDElement {
    _: string;
    $: GUID;
}

export interface GUID {
    isPermaLink: string;
}

export interface TorrentElement {
    $: Torrent;
    link: string[];
    contentLength: string[];
    pubDate: string[];
}

export interface Torrent {
    xmlns: string;
}
