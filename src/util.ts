import { SupportRSSItem, type SupportRSS } from "./models/common-rss";
import { MikanamiItem, type MikanamiRSS } from "./models/mikanami-rss";
import { NyaaItem, NyaaRSS } from "./models/nyaa-rss";
import { ShareAcgnxItem, ShareAcgnxRSS } from "./models/shareAcgnx-rss";

export function isMikananiRSS(rss: SupportRSS): rss is MikanamiRSS {
    return rss.rss.channel[0].link[0].includes("mikanani");
}

export function isMikananiRSSItem(item: SupportRSSItem): item is MikanamiItem {
    return item.link[0].includes("mikanani");
}

export function isShareAcgnxRSS(rss: SupportRSS): rss is ShareAcgnxRSS {
    return rss.rss.channel[0].link[0].includes("share.acgnx");
}

export function isShareAcgnxRSSItem(
    item: SupportRSSItem
): item is ShareAcgnxItem {
    return item.link[0].includes("share.acgnx");
}

export function isNyaaRSS(rss: SupportRSS): rss is NyaaRSS {
    return rss.rss.channel[0].link[0].includes("nyaa");
}

export function isNyaaRSSItem(item: SupportRSSItem): item is NyaaItem {
    return item.link[0].includes("nyaa");
}

export function getUrlFromRSSItem(item: SupportRSSItem): string {
    if (isMikananiRSSItem(item)) {
        return item.enclosure[0].$.url;
    } else if (isShareAcgnxRSSItem(item)) {
        return item.enclosure[0].$.url;
    } else if (isNyaaRSSItem(item)) {
        return item.link[0];
    } else {
        throw "Wrong RSSItem";
    }
}

export function parseInterval(format: string | number): number {
    if (typeof format === "number") {
        return format;
    }

    const second = 60;
    const minute = second * 60;
    const hour = minute * 60;
    const day = hour * 24;
    const value = parseInt(format.slice(format.length - 1));
    const unit = format[format.length - 1] as "s" | "m" | "h" | "d";
    switch (unit) {
        case "s":
            return second * value;
        case "m":
            return minute * value;
        case "h":
            return hour * value;
        case "d":
            return day * value;
        default:
            return 0;
    }
}
