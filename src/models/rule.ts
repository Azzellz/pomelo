import { SupportRSSUrl, type SupportRSSItem } from "./common-rss";
import { PomeloRecord } from "./record";

export type PomeloHandler = (content: string) => boolean;
export interface Rule {
    name: string;
    option: DownloadOption;
    accept?: PomeloHandler;
    reject?: PomeloHandler;
    onAccepted?: (item: SupportRSSItem, record?: PomeloRecord) => void;
    onRejected?: (item: SupportRSSItem, record?: PomeloRecord) => void;
    onMatchEnd?: () => void;
}

export type RuleMap = {
    [name in string]: RuleUnit;
};

export interface RegExpOption {
    expr: string;
    flag: string;
}
export interface RuleUnit {
    option: DownloadOption;
    accept: RuleHandlerOption;
    reject: RuleHandlerOption;
}

export type RuleHandlerOption =
    | RegExpOption[][]
    | string[][]
    | string
    | RegExpOption
    | PomeloHandler;

export interface DownloadOption {
    dir: string;
    uri?: SupportRSSUrl;
    host?: string;
    port?: string;
    token?: string;
}
