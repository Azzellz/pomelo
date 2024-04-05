import { RegExpOption, RuleHandlerOption } from "../models/rule";
import type {
    ShareAcgnxItem,
    ShareAcgnxRSS,
    NyaaItem,
    NyaaRSS,
    MikanamiItem,
    MikanamiRSS,
    SupportRSSItem,
} from "../models/resource/rss";

//类型守卫
//#region
export function isMikananiRSS(target: any): target is MikanamiRSS {
    try {
        return target.rss.channel[0].link[0].includes("mikanani");
    } catch (error) {
        return false;
    }
}

export function isMikananiRSSItem(item: SupportRSSItem): item is MikanamiItem {
    return item.link[0].includes("mikanani");
}

export function isShareAcgnxRSS(target: any): target is ShareAcgnxRSS {
    try {
        return target.rss.channel[0].link[0].includes("share.acgnx");
    } catch (error) {
        return false;
    }
}

export function isShareAcgnxRSSItem(
    item: SupportRSSItem
): item is ShareAcgnxItem {
    return item.link[0].includes("share.acgnx");
}

export function isNyaaRSS(target: any): target is NyaaRSS {
    try {
        return target.rss.channel[0].link[0].includes("nyaa");
    } catch (error) {
        return false;
    }
}

export function isNyaaRSSItem(item: SupportRSSItem): item is NyaaItem {
    return item.link[0].includes("nyaa");
}

export function isRegExpOption(opt: RuleHandlerOption): opt is RegExpOption {
    const _tmp = opt as RegExpOption;
    if (!_tmp) return false;
    return !!_tmp.expr && !!_tmp.flag;
}
