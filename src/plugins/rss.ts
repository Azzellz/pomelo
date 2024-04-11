import { parseStringPromise } from "xml2js";
import { PomeloPlugin, SupportRSS } from "../models";
import {
    getTitleFromRSSItem,
    getUrlFromRSSItem,
    isMikananiRSS,
    isNyaaRSS,
    isShareAcgnxRSS,
} from "../utils";

export function RSS(): PomeloPlugin {
    return {
        name: "pomelo-rss",
        async parser(target: string) {
            const obj = await parseStringPromise(target);
            if (isMikananiRSS(obj) || isNyaaRSS(obj) || isShareAcgnxRSS(obj)) {
                return obj;
            } else {
                throw "unsupported RSS feeds, please replace them with supported RSS feeds.";
            }
        },
        async worker(rss: object, handler) {
            for (const ch of (rss as SupportRSS).rss.channel) {
                for (const item of ch.item) {
                    await handler(
                        getTitleFromRSSItem(item),
                        getUrlFromRSSItem(item)
                    );
                }
            }
        },
    };
}
