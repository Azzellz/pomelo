import { type MikanamiItem } from "./mikanami-rss";
export interface Rule {
    option: DownloadOption;
    accept?: RegExp[] | ((content: string) => boolean);
    reject?: RegExp[] | ((content: string) => boolean);
    onAccepted?: (item: MikanamiItem) => void;
    onRejected?: (item: MikanamiItem) => void;
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
    uri?: string;
    host?: string;
    port?: string;
    token?: string;
}
