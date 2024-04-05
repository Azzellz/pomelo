import { SupportRSSItem } from "../models/resource/rss";
import { isMikananiRSSItem, isShareAcgnxRSSItem, isNyaaRSSItem } from "./guard";

//解析字符串/数字至秒,字符串支持后缀s,m,h,d
export function parseStrToMillion(format: string | number): number {
    if (typeof format === "number") {
        return format * 1000;
    }

    const second = 1000;
    const minute = second * 60;
    const hour = minute * 60;
    const day = hour * 24;
    const value = parseInt(format.slice(0, format.length - 1));
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

export function getTitleFromRSSItem(item: SupportRSSItem): string {
    if (isMikananiRSSItem(item)) {
        return item.title[0];
    } else if (isShareAcgnxRSSItem(item)) {
        return item.title[0];
    } else if (isNyaaRSSItem(item)) {
        return item.title[0];
    } else {
        throw "Wrong RSSItem";
    }
}