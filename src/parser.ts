import { SupportRSS } from "./models/resource/rss/common-rss";
import { getTitleFromRSSItem, getUrlFromRSSItem } from "./util";

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
