import type { SupportRSS } from "./models";
import { getTitleFromRSSItem, getUrlFromRSSItem } from "./utils";

export async function parseRSS(
    rss: SupportRSS,
    handler: (content: string, link: string) => void
) {
    if (!handler && typeof handler !== "function") {
        return;
    }
    for (const ch of rss.rss.channel) {
        for (const item of ch.item) {
            await handler(getTitleFromRSSItem(item), getUrlFromRSSItem(item));
        }
    }
}

export default {
    parseRSS,
};
