//Resource
//#region

import exp from "constants";

export interface Resource {
    rss: RSS;
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

//#endregion

export interface Config {
    interval: number | string;
    baseUrl: string;
    rss: {
        uri: string;
        save?: string;
    };
    aria2: {
        host: string;
        port: string;
        token: string;
    };
    rules: RuleJSON[];
}

export interface Rule {
    name: string;
    option: DownloadOption;
    accept?: RegExp[] | ((content: string) => boolean);
    reject?: RegExp[] | ((content: string) => boolean);
    onAccepted?: (item: Item) => void;
    onRejected?: (item: Item) => void;
}

export interface RegExpOption {
    expr: string;
    flag: string;
}
export interface RuleJSON {
    name: string;
    option: DownloadOption;
    accept: RegExpOption[][] | string[][];
    reject: RegExpOption[][] | string[][];
}

export interface DownloadOption {
    dir: string;
    host?: string;
    port?: string;
    token?: string;
}
