export interface ShareAcgnxRSS {
    rss: {
        $: {
            version: string;
        };
        channel: ShareAcgnxChannel[];
    };
}

interface ShareAcgnxChannel {
    title: string[];
    link: string[];
    description: string[];
    lastBuildDate: string[];
    language: string[];
    generator: string[];
    copyright: string[];
    item: ShareAcgnxItem[];
}

export interface ShareAcgnxItem {
    title: string[];
    link: string[];
    description: string[];
    guid: GUIDElement[];
    author: Author[];
    enclosure: EnclosureElement[];
    pubDate: string[];
    category: CategoryElement[];
}

enum Author {
    Nekomoekissaten = "nekomoekissaten",
    Sakuratosub = "sakuratosub",
    TrySail = "TrySail",
    XSxSxSxSx = "xSxSxSxSx",
    動漫花園鏡像 = "動漫花園鏡像",
    萌番組鏡像 = "萌番組鏡像",
    萌萌的搬運者 = "萌萌的搬運者",
}

interface CategoryElement {
    _: Empty;
    $: Category;
}

interface Category {
    domain: string;
}

enum Empty {
    動漫音樂 = "動漫音樂",
    動畫 = "動畫",
    日劇日影 = "日劇/日影",
    日文原版 = "日文原版",
    遊戲 = "遊戲",
    音樂 = "音樂",
}

interface EnclosureElement {
    $: Enclosure;
}

interface Enclosure {
    url: string;
    length: string;
    type: Type;
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
