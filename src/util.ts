import { readFile } from "fs/promises";
import { existsSync } from "fs";
import { SupportRSSItem, type SupportRSS } from "./models/common-rss";
import { Config } from "./models/config";
import { MikanamiItem, type MikanamiRSS } from "./models/mikanami-rss";
import { NyaaItem, NyaaRSS } from "./models/nyaa-rss";
import { PomeloRecord } from "./models/record";
import { RegExpOption, RuleHandlerOption } from "./models/rule";
import { ShareAcgnxItem, ShareAcgnxRSS } from "./models/shareAcgnx-rss";
import { load as loadYaml } from "js-yaml";

//类型守卫
//#region
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

export function isRegExpOption(opt: RuleHandlerOption): opt is RegExpOption {
    const _tmp = opt as RegExpOption;
    if (!_tmp) return false;
    return !!_tmp.expr && !!_tmp.flag;
}

//#endregion

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

//loader
//#region

//加载配置文件,支持四种
export async function loadConfig(path: string): Promise<Config> {
    const tsConfigPath = path + "/pomelo.config.ts";
    if (existsSync(tsConfigPath)) {
        //这里使用默认导出
        return (await import(tsConfigPath)).default;
    }

    const jsonConfigPath = path + "/pomelo.json";
    if (existsSync(jsonConfigPath)) {
        return (await import(jsonConfigPath)).default;
    }

    const yamlConfigPath = path + "/pomelo.yaml";
    if (existsSync(yamlConfigPath)) {
        const config = loadYaml(
            (await readFile(yamlConfigPath)).toString()
        ) as Config;
        return config;
    }

    const ymlConfigPath = path + "/pomelo.yml";
    if (existsSync(ymlConfigPath)) {
        const config = loadYaml(
            (await readFile(ymlConfigPath)).toString()
        ) as Config;
        return config;
    } else {
        throw `failed to find pomelo.config.ts/pomelo.json/pomelo.yaml/pomelo.yml from ${path}, please use -d to specify the path of the dir to the configuration file.`;
    }
}

//加载记录文件
export async function loadRecord(path: string): Promise<PomeloRecord> {
    const recordPath = path + "/__record.json";
    if (existsSync(recordPath)) {
        const record = (await import(recordPath)).default;
        return {
            accepted: {},
            rejected: {},
            ...record,
        };
    } else {
        return {
            accepted: {},
            rejected: {},
        };
    }
}

//#endregion
