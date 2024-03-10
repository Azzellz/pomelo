import { SupportRSSUrl, type SupportRSSItem } from "./common-rss";
import { PomeloRecord } from "./record";
export interface Rule {
    option: DownloadOption;
    accept?: RegExp[] | ((content: string) => boolean);
    reject?: RegExp[] | ((content: string) => boolean);
    onAccepted?: (item: SupportRSSItem, record?: PomeloRecord) => void;
    onRejected?: (item: SupportRSSItem, record?: PomeloRecord) => void;
}

export type RuleMap = {
    [name in string]: RuleJSON;
};

export interface RegExpOption {
    expr: string;
    flag: string;
}
export interface RuleJSON {
    option: DownloadOption;
    accept: RegExpOption[][] | string[][];
    reject: RegExpOption[][] | string[][];
}

export interface DownloadOption {
    dir: string;
    uri?: SupportRSSUrl;
    host?: string;
    port?: string;
    token?: string;
}
